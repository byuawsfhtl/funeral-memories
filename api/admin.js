import { postAdmin, getAdmin, deleteAdmin } from "../lib/AdminDAO.ts";

export default async function handler(req, res) {
	console.log(`req: ${req}`);
	try {
		if (req.method === "GET") {
			console.log("Got to GET");
			const { groupId } = req.query;
			if (!groupId) return res.status(400).json({ message: "Missing groupId" });

			const admin = await getAdmin(groupId);
			if (!admin) {
				return res.status(404).json({ message: "Admin not found" });
			}
			return res.status(200).json(admin);
		}

		if (req.method === "POST") {
			const admin = req.body;
			const result = await postAdmin(admin);
			if (!result) {
				return res.status(400).json({ message: "Failed to add admin" });
			}
			return res.status(201).json(result);
		}

		if (req.method === "DELETE") {
			const { groupId } = req.body;
			const result = await deleteAdmin(groupId);
			if (!result) {
				return res.status(404).json({ message: "Failed to delete admin" });
			}
			return res.status(200).json(result);
		}

		res.status(405).end();
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}
