import {
	postMemory,
	getMemories,
	updateMemory,
	deleteMemory,
} from "../lib/MemoriesDAO.js";

export default async function handler(req: any, res: any) {
	try {
		
		if (req.method === "GET") {
			const { groupId } = req.query;
			if (!groupId) return res.status(400).json({ message: "Missing groupId" });

			const memories = await getMemories(groupId);
			if (!memories) {
				return res.status(404).json({ message: "Memories not found" });
			}
			return res.status(200).json(memories);
		}

		if (req.method === "POST") {
			console.log("got to post");
			const memory = req.body;
			console.log("Backend received memory:", memory);
			const result = await postMemory(memory);
			if (!result) {
				return res.status(400).json({ message: "Failed to add memory" });
			}
			return res.status(201).json(result);
		}

		if (req.method === "PUT") {
			const { memoryId, title, story, place, date, image, author } = req.body;
			const result = await updateMemory(
				memoryId,
				title,
				story,
				place,
				date,
				image,
				author
			);
			if (!result) {
				return res.status(400).json({ message: "Failed to update memory" });
			}
			return res.status(200).json(result);
		}

		if (req.method === "DELETE") {
			const { memoryId } = req.body;
			const result = await deleteMemory(memoryId);
			if (!result) {
				return res.status(404).json({ message: "Failed to delete memory" });
			}
			return res.status(200).json(result);
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
