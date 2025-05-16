const {
	postMemory,
	getMemories,
	updateMemory,
	deleteMemory,
} = require("../lib/MemoriesDAO");

module.exports = async (req, res) => {
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
			const memory = req.body;
			const result = await postMemory(memory);
			if (!result) {
				return res.status(400).json({ message: "Failed to add memory" });
			}
			return res.status(201).json(result);
		}

		if (req.method === "PUT") {
			const { memoryId, title, story, location, date, image } = req.body;
			const result = await updateMemory(
				memoryId,
				title,
				story,
				location,
				date,
				image
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
		res.status(500).json({ error: error.message });
	}
};
