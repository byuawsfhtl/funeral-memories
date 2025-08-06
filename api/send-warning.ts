import { Db, MongoClient } from "mongodb";
import nodemailer from "nodemailer";

// Connect to MongoDB
const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);
const dbName = "FuneralMemories";

// Constants 5 minutes for testing
const THIRTEEN_DAYS_MS = 13 * 24 * 60 * 60 * 1000;
export default async function handler(_: any, res: any) {
  console.log("⚙️ send-warning function triggered");

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(dbName);

    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 1 * 60 * 60 * 1000);
    const nowIso = now.toISOString();
    const oneHourLaterIso = oneHourLater.toISOString();
    console.log(oneHourLater);

    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

    const groupsToWarnOne = await db
      .collection("groups")
      .find({
        $expr: {
          $gt: [
            {
              $subtract: [
                { $toLong: { $toDate: "$expirationDate" } }, // convert expirationDate string to Date, then to long ms
                "$timestamp", // timestamp already number, use directly
              ],
            },
            ONE_WEEK_MS,
          ],
        },
      })
      .toArray();

    console.log(
      `📦 Found ${groupsToWarnOne.length} group(s) where expiration - timestamp is more than a week.`
    );

    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    const groupsToWarnTwo = await db
      .collection("groups")
      .find({
        $expr: {
          $gt: [
            {
              $subtract: [
                { $toLong: { $toDate: "$expirationDate" } }, // convert expirationDate string to Date, then to long ms
                "$timestamp", // timestamp already number, use directly
              ],
            },
            ONE_DAY_MS,
          ],
        },
      })
      .toArray();

    console.log(
      `📦 Found ${groupsToWarnTwo.length} group(s) where expiration - timestamp is more than a day.`
    );

    for (const group of groupsToWarnTwo) {
      const groupId = group.groupId;
      const groupPerson = group.ancestor;
      const groupPersonName = groupPerson.name;
      console.log(`🔍 Looking up admin for groupId: ${groupId}`);

      const admin = await db.collection("admin").findOne({ groupId });
      const email = admin?.admin;

      if (!email) {
        console.warn(`⚠️ No admin email found for groupId: ${groupId}`);
        continue;
      }

      console.log(`📧 Sending email to ${email} for groupId: ${groupId}`);
      await sendEmail(email, groupId, groupPersonName, db, "2");
    }

    for (const group of groupsToWarnOne) {
      const groupId = group.groupId;
      const groupPerson = group.ancestor;
      const groupPersonName = groupPerson.name;
      console.log(`🔍 Looking up admin for groupId: ${groupId}`);

      const admin = await db.collection("admin").findOne({ groupId });
      const email = admin?.admin;

      if (!email) {
        console.warn(`⚠️ No admin email found for groupId: ${groupId}`);
        continue;
      }

      console.log(`📧 Sending email to ${email} for groupId: ${groupId}`);
      await sendEmail(email, groupId, groupPersonName, db, "1");
    }

    // Find groups expiring in the next 2 hours
    const groupsToWarnThree = await db
      .collection("groups")
      .find({
        expirationDate: { $gt: nowIso, $lte: oneHourLaterIso },
        emailSent: { $ne: true },
      })
      .toArray();

    console.log(`📦 Found ${groupsToWarnThree.length} group(s) to warn`);

    for (const group of groupsToWarnThree) {
      const groupId = group.groupId;
      const groupPerson = group.ancestor;
      const groupPersonName = groupPerson.name;
      console.log(`🔍 Looking up admin for groupId: ${groupId}`);

      const admin = await db.collection("admin").findOne({ groupId });
      const email = admin?.admin;

      if (!email) {
        console.warn(`⚠️ No admin email found for groupId: ${groupId}`);
        continue;
      }

      console.log(`📧 Sending email to ${email} for groupId: ${groupId}`);
      await sendEmail(email, groupId, groupPersonName, db, "3");
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
async function sendEmail(
  to: string,
  groupId: string,
  groupPersonName: string,
  db: Db,
  numberEmailSent: string
) {
  var timeExpiration = "0";
  if (numberEmailSent == "1") {
    timeExpiration = "one week";
  } else if (numberEmailSent == "2") {
    timeExpiration = "one day";
  } else if (numberEmailSent == "3") {
    timeExpiration = "one hour";
  }
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Funeral Memories" <${process.env.EMAIL_USER}>`,
    to,
    subject: `⏳ Your Funeral Memories group "${groupId}" will be deleted soon!`,
    text: `Hi,

This is a friendly reminder that your Funeral Memories group "${groupId}" for "${groupPersonName}" is scheduled to be deleted in "${timeExpiration}".

If you would like to publish it to FamilySearch and/or export all the memories as a PDF, please got to funeral-memories.fhtl.org and do so before it expires.

Thank you,
The Funeral Memories Team`,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Email sent to ${to} for group ${groupId}`);
  await db
    .collection("groups")
    .updateOne({ groupId }, { $set: { emailSent: true } });
}
