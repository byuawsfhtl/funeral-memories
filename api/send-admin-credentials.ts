import nodemailer from "nodemailer";

export default async function handler(req: any, res: any) {
  const { email, username, password, groupId, ancestorName } = req.body;

  if (!email || !username || !password || !groupId) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Funeral Memories" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your Funeral Memories Group Credentials`,
      text: `Hello,

Your Funeral Memories group has been created for ancestor "${ancestorName}".

Here are your access details:

Group ID: ${groupId}
Username: ${username}
Password: ${password}

Please keep this information safe.

Thank you,
Funeral Memories Team`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent." });
  } catch (error) {
    console.error("Failed to send admin credentials email:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
}
