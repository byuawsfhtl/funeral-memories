import type { IncomingMessage, ServerResponse } from "http";
import { MongoClient } from "mongodb";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";

// 🧾 Generate PDF from memory data
import { PassThrough } from "stream";

export async function generateMemoriesPDF(
  name: string,
  memories: any[]
): Promise<Buffer> {
  const doc = new PDFDocument({ autoFirstPage: false });
  const stream = new PassThrough();
  const chunks: Buffer[] = [];

  doc.pipe(stream);

  for (const memory of memories) {
    doc.addPage();

    doc.fontSize(20).text(`Memory for ${name}`, { align: "center" }).moveDown();

    // Memory title
    doc.fontSize(16).text(memory.title ?? "Untitled", { underline: true });
    doc.moveDown(0.5);

    // Optional metadata
    doc.fontSize(12);
    if (memory.author) doc.text(`Shared by: ${memory.author}`);
    if (memory.date) doc.text(`Date: ${memory.date}`);
    if (memory.place) doc.text(`Place: ${memory.place}`);
    doc.moveDown(0.5);

    // Memory body
    doc.fontSize(11).text(memory.memory ?? "(No content)", {
      width: 460,
      align: "left",
    });
    doc.moveDown(1);

    // Optional image
    if (memory.image?.startsWith("data:image/")) {
      try {
        const matches = memory.image.match(/^data:(image\/\w+);base64,(.+)$/);
        if (matches) {
          const format = matches[1]; // e.g., "image/jpeg"
          const data = matches[2];
          const buffer = Buffer.from(data, "base64");

          // Fit image width to page
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

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

// ✉️ Send PDF via email
async function sendMemoryEmail(
  toEmail: string,
  pdfBuffer: Buffer,
  personName: string
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Funeral Memories" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Memories for ${personName}`,
    text: `Attached is a PDF archive of your group's memories.`,
    attachments: [
      {
        filename: `Memories-${personName}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}

// 🌐 Environment connection
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI environment variable is not set");

const client = new MongoClient(uri);
const dbName = "FuneralMemories";

async function connect() {
  await client.connect();
  return client.db(dbName);
}

// 🔍 Get all groups with timestamps
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

// 🧽 Deletion helpers
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

// 🧹 Main handler for cleanup
export default async function handler(
  req: IncomingMessage & { method?: string },
  res: ServerResponse & {
    status: (code: number) => typeof res;
    json: (body: any) => void;
  }
) {
  try {
    console.log("🚀 Cleanup cron job triggered");

    //const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000; //2 weeks ago
    const cutoff = Date.now() - 5 * 60 * 1000; // 5 minutes ago
    console.log("🕒 Cutoff timestamp:", cutoff);

    const allGroups = await getAllGroups();
    console.log(`📦 Found ${allGroups.length} group(s)`);

    for (const group of allGroups) {
      const { groupId, timestamp } = group;

      try {
        console.log(`🔍 Checking group ${groupId} (timestamp: ${timestamp})`);

        if (timestamp < cutoff) {
          console.log(`⚠️ Group ${groupId} is older than 5 minutes — deleting`);
          const db = await connect();

          const adminDoc = await db.collection("admin").findOne({ groupId });
          const memories = await db
            .collection("memories")
            .find({ groupId })
            .toArray();
          const personName = adminDoc?.person?.name ?? "Your Loved One";

          if (adminDoc?.email && memories.length > 0) {
            try {
              const pdf = await generateMemoriesPDF(personName, memories);
              await sendMemoryEmail(adminDoc.email, pdf, personName);
              console.log(`📧 Sent PDF to ${adminDoc.email}`);
            } catch (err) {
              console.warn(
                `⚠️ Failed to email memories to ${adminDoc.email}:`,
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
        } else {
          console.log(`⏭️ Group ${groupId} is newer. Skipping.`);
        }
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
