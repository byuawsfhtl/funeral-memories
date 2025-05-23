import formidable from "formidable";
import fs from "fs";
import {
  postMemory,
  getMemories,
  updateMemory,
  deleteMemory,
} from "../lib/MemoriesDAO.js";

export const config = {
  api: {
    bodyParser: false, // Necessary for formidable to work
  },
};

export default async function handler(req, res) {
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
      const form = new formidable.IncomingForm();

      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Form parse error:", err);
          return res.status(400).json({ message: "Error parsing form data" });
        }

        const memory = {
          groupId: fields.groupId,
          title: fields.title,
          story: fields.memory,
          location: fields.location,
          date: fields.date,
          author: fields.author,
          createdAt: new Date(),
        };

        if (files.image) {
          const fileData = await fs.promises.readFile(files.image.filepath);
          memory.image = fileData.toString("base64"); // store as base64 string
        }

        const result = await postMemory(memory);
        if (!result) {
          return res.status(400).json({ message: "Failed to add memory" });
        }
        return res.status(201).json(result);
      });
      return;
    }

    if (req.method === "PUT") {
      // To keep it simple, this assumes updates use JSON not multipart
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const body = JSON.parse(Buffer.concat(buffers).toString());

      const { memoryId, title, story, location, date, image } = body;
      const result = await updateMemory(memoryId, title, story, location, date, image);
      if (!result) {
        return res.status(400).json({ message: "Failed to update memory" });
      }
      return res.status(200).json(result);
    }

    if (req.method === "DELETE") {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const body = JSON.parse(Buffer.concat(buffers).toString());

      const { memoryId } = body;
      const result = await deleteMemory(memoryId);
      if (!result) {
        return res.status(404).json({ message: "Failed to delete memory" });
      }
      return res.status(200).json(result);
    }

    res.status(405).end();
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: error.message });
  }
}
