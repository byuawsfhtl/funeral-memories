import { MongoClient, ObjectId, WithId, Document } from "mongodb";
import { Memory } from "../src/model/Memory";

const uri = process.env.MONGODB_URI;
if (!uri) {
	throw new Error("MONGODB_URI environment variable is not set");
}
const client = new MongoClient(uri);
const dbName = "FuneralMemories";

async function connect() {
	await client.connect();
	return client.db(dbName);
}

//memory = {groupId, title, story, location, date, image, author}
//NOTE: Going to use MongoDBs generated _id for memoryId
export async function postMemory(
	memory: Memory
): Promise<WithId<Document> | null> {
	try {
		const db = await connect();

		const group = await db
			.collection("groups")
			.findOne({ groupId: memory.groupId });
		if (!group) {
			throw new Error("Group does not exist");
		}
		if (group.closed) {
			throw new Error("Group is closed and cannot accept new memories");
		}

		const result = await db.collection("memories").insertOne(memory);
		return await db.collection("memories").findOne({ _id: result.insertedId });
	} catch (err) {
		console.error("Error adding memory to database:", err.message);
		throw new Error("Unable to add memory");
	}
}

export async function getMemories(groupId: string): Promise<Document[]> {
	try {
		const db = await connect();
		return await db.collection("memories").find({ groupId }).toArray();
	} catch (err) {
		console.error("Error getting memories from the database:", err.message);
		throw new Error("Unable to get memories");
	}
}

export async function deleteMemory(
	memoryId: string
): Promise<{ message: string }> {
	try {
		const db = await connect();
		const result = await db.collection("memories").deleteOne({
			_id: new ObjectId(memoryId),
		});

		if (result.deletedCount === 0) {
			throw new Error("Memory not found");
		}

		return { message: "Memory deleted successfully" };
	} catch (err) {
		console.error("Error deleting memory:", err.message);
		throw new Error("Unable to delete memory");
	}
}

export async function updateMemory(
	memoryId: string,
	title: string,
	memory: string,
	location: string,
	date: string,
	image: string | null
): Promise<WithId<Document> | null> {
	console.log("DAO updating:", {
		memoryId,
		updateFields: { title, memory, location, date, image },
	});

	try {
		const db = await connect();
		const updateFields = { title, memory, location, date, image };
		const result = await db
			.collection("memories")
			.updateOne({ _id: new ObjectId(memoryId) }, { $set: updateFields });
		console.log("Update result:", result);

		if (result.modifiedCount === 0) {
			throw new Error("Memory not found or no changes made");
		}

		const updatedDoc = await db
			.collection("memories")
			.findOne({ _id: new ObjectId(memoryId) });
		console.log("Updated document:", updatedDoc);
		return updatedDoc;
	} catch (err) {
		console.error("Error updating memory:", err.message);
		throw new Error("Unable to update memory");
	}
}
