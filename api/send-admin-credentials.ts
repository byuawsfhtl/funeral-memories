import nodemailer from "nodemailer";

export default async function handler(req: any, res: any) {
  const { email, username, password, groupId, ancestorName, expirationDate } =
    req.body;

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

Your Funeral Memories group has been created for "${ancestorName}".

Here are your access details:

Group ID: ${groupId}
Username: ${username}
Password: ${password}

Your group and corresponding Memory Wall and memories will expire on ${expirationDate}. Please make sure to publish your memories to FamilySearch or export them to a PDF before this time.

Please keep this information safe.

Thank you,
Funeral Memories Team`,
      html: `
    <p>Hello,</p>

    <p>Your Funeral Memories group has been created for "<strong>${ancestorName}</strong>".</p>

    <p>Here are your access details:</p>

    <ul>
      <li><strong>Group ID:</strong> ${groupId}</li>
      <li><strong>Username:</strong> ${username}</li>
      <li><strong>Password:</strong> ${password}</li>
    </ul>

    <p><strong>Your group and corresponding Memory Wall and memories will expire on ${expirationDate}.</strong> Please make sure to publish your memories to FamilySearch or export them to a PDF before this time.</p>

    <p>Please keep this information safe.</p>

    <p>Thank you,<br/>Funeral Memories Team</p>
  `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent." });
  } catch (error) {
    console.error("Failed to send admin credentials email:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
}
