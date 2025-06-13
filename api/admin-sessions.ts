// pages/api/admin-sessions.js
import { getAdminSessions } from "../lib/AdminDAO";

export default async function handler(req: any, res: any) {
	const groupId = req.query.groupId;
	if (!groupId) return res.status(400).json({ message: "Missing groupId" });

	try {
		const sessions = await getAdminSessions(groupId);
		return res.status(200).json({ sessions });
	} catch (error) {
		console.error("Error fetching admin sessions:", error);
		return res.status(500).json({ error: "Failed to fetch admin sessions" });
	}
}
