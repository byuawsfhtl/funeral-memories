import type { IncomingMessage, ServerResponse } from "http";
import { MongoClient } from "mongodb";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import { PassThrough } from "stream";

/** Memories worth attaching as a PDF (skip empty DB stubs). */
export function memoriesWithContent(memories: any[]): any[] {
  return memories.filter((m) => {
    const body = String(m?.memory ?? m?.story ?? "").trim();
    const title = String(m?.title ?? "").trim();
    const hasImage =
      typeof m?.image === "string" && m.image.startsWith("data:image/");
    return body.length > 0 || title.length > 0 || hasImage;
  });
}

export async function generateMemoriesPDF(
  name: string,
  memories: any[]
): Promise<Buffer> {
  const doc = new PDFDocument({ autoFirstPage: false });
  const stream = new PassThrough();

  doc.pipe(stream);

  for (const memory of memories) {
    doc.addPage();

    doc
      .fontSize(20)
      .text(`Memories for ${name}`, { align: "center" })
      .moveDown();

    // Memory title
    doc.fontSize(16).text(memory.title ?? "Untitled", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    if (memory.author) doc.text(`Shared by: ${memory.author}`);
    if (memory.date) doc.text(`Date: ${memory.date}`);
    if (memory.place) doc.text(`Place: ${memory.place}`);
    doc.moveDown(0.5);

    // Memory body (support legacy `story` field)
    const bodyText = memory.memory ?? memory.story ?? "(No content)";
    doc.fontSize(11).text(bodyText, {
      width: 460,
      align: "left",
    });
    doc.moveDown(1);

    // Optional image
    if (memory.image?.startsWith("data:image/")) {
      try {
        const matches = memory.image.match(/^data:(image\/\w+);base64,(.+)$/);
        if (matches) {
          const data = matches[2];
          const buffer = Buffer.from(data, "base64");

          doc.image(buffer, {
            fit: [460, 300],
            align: "center",
          });
        }
      } catch (err) {
        doc.fontSize(10).fillColor("red").text("⚠ Failed to render image.");
      }
    }
  }

  // Listeners MUST be registered before doc.end() or chunks may never fire (empty PDF).
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
    doc.end();
  });
}

// ✉️ Send expiry email (PDF only when there were memories)
async function sendMemoryEmail(
  toEmail: string,
  personName: string,
  pdfBuffer: Buffer | null
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const firstLine =
    "Your group for Funeral Memories (funeral-memories.fhtl.org) has expired.";
  const text =
    pdfBuffer === null
      ? `${firstLine}\n\nIt appears there were no memories on the wall. Thank you for using our service.`
      : `${firstLine} Attached is a PDF archive of your group's memories.`;

  await transporter.sendMail({
    from: `"Funeral Memories" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Memories for ${personName}`,
    text,
    ...(pdfBuffer !== null && {
      attachments: [
        {
          filename: `Memories-${personName}.pdf`,
          content: pdfBuffer,
        },
      ],
    }),
  });
}

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI environment variable is not set");

const client = new MongoClient(uri);
const dbName = "FuneralMemories";

async function connect() {
  await client.connect();
  return client.db(dbName);
}

// Get all groups with timestamps
async function getAllGroups(): Promise<
  { groupId: string; timestamp: number }[]
> {
  const db = await connect();
  const docs = await db
    .collection("groups")
    .find({}, { projection: { groupId: 1, timestamp: 1 } })
    .toArray();

  return docs.map((doc) => ({
    groupId: doc.groupId as string,
    timestamp: doc.timestamp as number,
  }));
}

//Deletion helpers
async function deleteMemories(groupId: string) {
  const db = await connect();
  const result = await db.collection("memories").deleteMany({ groupId });
  return { message: `${result.deletedCount} memory/memories deleted` };
}

async function deleteGroup(groupId: string) {
  const db = await connect();
  const result = await db.collection("groups").deleteOne({ groupId });
  return { message: `${result.deletedCount} group(s) deleted` };
}

async function deleteAdmin(groupId: string) {
  const db = await connect();
  const result = await db.collection("admin").deleteOne({ groupId });
  return { message: `${result.deletedCount} admin(s) deleted` };
}

async function deleteAdminSessions(groupId: string) {
  const db = await connect();
  const result = await db.collection("adminSessions").deleteMany({ groupId });
  return { message: `${result.deletedCount} admin session(s) deleted` };
}

//Main handler for cleanup
export default async function handler(
  req: IncomingMessage & { method?: string },
  res: ServerResponse & {
    status: (code: number) => typeof res;
    json: (body: any) => void;
  }
) {
  try {
    console.log("🚀 Cleanup cron job triggered");

    const now = new Date();
    const cutoffDate = new Date(now); // copy current date
    cutoffDate.setMonth(cutoffDate.getMonth() - 1); // subtract 1 calendar month
    // cutoffDate now represents exactly one month ago (e.g., Aug 1 → Jul 1)

    const cutoff = cutoffDate.getTime(); // timestamp in milliseconds
    //const cutoff = Date.now() - 5 * 60 * 1000; // 5 minutes ago for testing

    const db = await connect();
    const nowIso = new Date().toISOString();
    const expiredGroups = await db
      .collection("groups")
      .find({ expirationDate: { $lte: nowIso } })
      .toArray();
    console.log(`📦 Found ${expiredGroups.length} expired group(s)`);

    for (const group of expiredGroups) {
      const groupId = group.groupId;
      try {
        console.log(`⚠️ Deleting expired group ${groupId}`);

        const adminDoc = await db.collection("admin").findOne({ groupId });
        const memories = await db
          .collection("memories")
          .find({ groupId })
          .toArray();
        const personName = group.ancestor?.name || "Your Loved One";

        if (adminDoc?.admin) {
          try {
            const toArchive = memoriesWithContent(memories);
            let pdf: Buffer | null = null;
            if (toArchive.length > 0) {
              const buf = await generateMemoriesPDF(personName, toArchive);
              // Defensive: broken stream race used to yield near-empty buffers
              if (buf.length >= 64) {
                pdf = buf;
              } else {
                console.warn(
                  `⚠️ PDF buffer too small for group ${groupId} (${buf.length} bytes); omitting attachment`
                );
              }
            }
            await sendMemoryEmail(adminDoc.admin, personName, pdf);
            console.log(
              `📧 Sent expiry email to ${adminDoc.admin}` +
                (pdf ? " (with PDF)" : " (no memories, no PDF)")
            );
          } catch (err) {
            console.warn(
              `⚠️ Failed to email memories to ${adminDoc.admin}:`,
              err
            );
          }
        }

        const mems = await deleteMemories(groupId);
        console.log("🗑️ Memories:", mems.message);

        const admin = await deleteAdmin(groupId);
        console.log("🗑️ Admin:", admin.message);

        try {
          const sessions = await deleteAdminSessions(groupId);
          console.log("🗑️ Admin sessions:", sessions.message);
        } catch (err) {
          console.warn("⚠️ Admin sessions deletion failed (optional):", err);
        }

        const grp = await deleteGroup(groupId);
        console.log("✅ Group:", grp.message);
      } catch (err) {
        console.error(`❌ Error processing group ${groupId}:`, err);
      }
    }

    return res.status(200).json({ success: true, message: "Cleanup complete" });
  } catch (err) {
    console.error("❌ Cleanup failed:", err);
    return res.status(500).json({ success: false, error: "Cleanup failed" });
  }
}
