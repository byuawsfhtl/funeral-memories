import {
	postGroup,
	getGroup,
	updateGroup,
	deleteGroup,
} from "../lib/GroupDAO.js";

module.exports = async (req, res) => {
	try {
		if (req.method === "GET") {
			const { groupId } = req.query;
			if (!groupId) return res.status(400).json({ message: "Missing groupId" });

			const group = await getGroup(groupId);
			if (!group) {
				return res.status(404).json({ message: "Group not found" });
			}
			return res.status(200).json(group);
		}

		if (req.method === "POST") {
			const group = req.body;
			const result = await postGroup(group);
			if (!result) {
				return res.status(400).json({ message: "Failed to add group" });
			}
			return res.status(201).json(result);
		}

		if (req.method === "PUT") {
			const { groupId, closed } = req.body;
			const result = await updateGroup(groupId, closed);
			if (!result) {
				return res.status(400).json({ message: "Failed to update group" });
			}
			return res.status(200).json(result);
		}

		if (req.method === "DELETE") {
			const { groupId } = req.body;
			const result = await deleteGroup(groupId);
			if (!result) {
				return res.status(404).json({ message: "Failed to delete group" });
			}
			return res.status(200).json(result);
		}

		res.status(405).end();
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
