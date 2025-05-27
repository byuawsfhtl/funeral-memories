// api/admin/login.js

import { getAdmin } from "../../data/admindao.js"; // adjust path if needed
import { compareSync } from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { groupId, username, password } = req.body;

  if (!groupId || !username || !password) {
    return res.status(400).send("Missing groupId, username, or password");
  }

  try {
    const admin = await getAdmin(groupId);
    if (!admin || admin.admin !== username) {
      return res.status(401).send("Invalid username or group ID");
    }

    const isMatch = await compareSync(password, admin.password);
    if (!isMatch) {
      return res.status(401).send("Invalid password");
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).send("Internal server error");
  }
}
