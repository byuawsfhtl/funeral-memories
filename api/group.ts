import {
	getGroup,
	postGroup,
	updateGroup,
	deleteGroup,
} from "../lib/GroupDAO.js";

import { deleteMemories } from "../lib/MemoriesDAO.js";

export default async function handler(req: any, res: any) {
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
			const memoriesResult = await deleteMemories(groupId);
			if (!memoriesResult) {
				return res.status(404).json({ message: "Failed to delete memories" });
			}
			return res.status(200).json(result, memoriesResult);
		}

		res.status(405).end();
	} catch (error) {
		if (error instanceof Error) {
			res.status(500).json({ error: error.message });
		} else {
			res.status(500).json({ error: "An unknown error occurred" });
		}
	}
}
