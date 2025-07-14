import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";

// Connect to MongoDB
const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);
const dbName = "FuneralMemories";

// Constants 5 minutes for testing
const THIRTEEN_DAYS_MS = 5 * 60 * 1000;

export default async function handler(_: any, res: any) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const now = Date.now();

    // 1. Get groups created exactly 13 days ago
    const cutoffStart = now - THIRTEEN_DAYS_MS;
    const cutoffEnd = cutoffStart + 24 * 60 * 60 * 1000; // within that 24-hour window

    const groupsToWarn = await db.collection("groups").find({
      timestamp: { $gte: cutoffStart, $lt: cutoffEnd }
    }).toArray();

    for (const group of groupsToWarn) {
      const groupId = group.groupId;

      // 2. Find admin associated with the group
      const admin = await db.collection("admin").findOne({ groupId });
      const email = admin?.admin;
      if (!email) continue;

      // 3. Send warning email
      await sendEmail(email, groupId);
    }

    res.status(200).json({ message: "Warning emails sent." });
  } catch (err) {
    console.error("Error in send-warning:", err);
    res.status(500).json({ error: "Failed to send warnings." });
  } finally {
    await client.close();
  }
}

// Email sender
async function sendEmail(to: string, groupId: string) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  const mailOptions = {
    from: `"Funeral Memories" <${process.env.EMAIL_USER}>`,
    to,
    subject: `⏳ Your Funeral Memories group "${groupId}" will be deleted tomorrow`,
    text: `Hi,

This is a friendly reminder that your Funeral Memories group "${groupId}" is scheduled to be deleted tomorrow, 14 days after creation.

If you would like to save anything, please do so today.

Thank you,
The Funeral Memories Team`,
  };

  await transporter.sendMail(mailOptions);
}
