// api/admin/login.js

import { getAdmin } from "../lib/AdminDAO.js";
import bcrypt from "bcryptjs";
import { compareSync } from "bcryptjs";
import { addAdminSession } from "../lib/AdminDAO.js";

export default async function handler(req: any, res: any) {
  console.log("got to login.js");
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { groupId, username, password, sessionId } = req.body;

  console.log(
    "groupID: ",
    groupId,
    " username: ",
    username,
    " password: ",
    password,
    " sessionId: ",
    sessionId
  );

  if (!groupId || !username || !password) {
    return res.status(400).send("Missing groupId, username, or password");
  }

  try {
    const admin = await getAdmin(groupId);
    if (!admin || admin.admin !== username) {
      return res.status(401).send("Invalid username or group ID");
    }

    const isMatch = await bcrypt.compareSync(password, admin.password);

    console.log("isMatch: ", isMatch);
    if (!isMatch) {
      return res.status(401).send("Invalid password");
    }

    await addAdminSession(groupId, sessionId);

    return res.status(200).json({ success: true });
  } catch (err) {
    if (err instanceof Error) {
      console.error("Login error:", err.message);
    } else {
      console.error("Login error:", err);
    }
    return res.status(500).send("Internal server error");
  }
}
