import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";

// Connect to MongoDB
const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);
const dbName = "FuneralMemories";

// Constants 5 minutes for testing
const THIRTEEN_DAYS_MS = 5 * 60 * 1000;

export default async function handler(_: any, res: any) {
  console.log("⚙️ send-warning function triggered");

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(dbName);
    const now = Date.now();

    const cutoffStart = now - THIRTEEN_DAYS_MS;
    const cutoffEnd = cutoffStart + 24 * 60 * 60 * 1000;

    console.log(`🕒 Searching for groups created between ${new Date(cutoffStart).toISOString()} and ${new Date(cutoffEnd).toISOString()}`);

    const groupsToWarn = await db.collection("groups").find({
      timestamp: { $gte: cutoffStart, $lt: cutoffEnd }
    }).toArray();

    console.log(`📦 Found ${groupsToWarn.length} group(s) to warn`);

    for (const group of groupsToWarn) {
      const groupId = group.groupId;
      console.log(`🔍 Looking up admin for groupId: ${groupId}`);

      const admin = await db.collection("admin").findOne({ groupId });
      const email = admin?.admin;

      if (!email) {
        console.warn(`⚠️ No admin email found for groupId: ${groupId}`);
        continue;
      }

      console.log(`📧 Sending email to ${email} for groupId: ${groupId}`);
      await sendEmail(email, groupId);
    }

    console.log("✅ All warning emails processed");
    res.status(200).json({ message: "Warning emails sent." });

  } catch (err) {
    console.error("❌ Error in send-warning:", err);
    res.status(500).json({ error: "Failed to send warnings." });

  } finally {
    await client.close();
    console.log("🔒 MongoDB connection closed");
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
  console.log(`✅ Email sent to ${to} for group ${groupId}`);
}
