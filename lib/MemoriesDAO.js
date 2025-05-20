// import { MongoClient, ObjectId } from "mongodb";
// import { readFile } from "fs/promises";

// const config = JSON.parse(
// 	await readFile(new URL("./dbConfig.json", import.meta.url))
// );

// const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;

// export class MemoryDAO {
// 	constructor() {
// 		this.client = new MongoClient(url);
// 		this.db = this.client.db("FuneralMemories");
// 		this.collection = this.db.collection("memories");
// 	}
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
	throw new Error("MONGODB_URI environment variable is not set");
}
const client = new MongoClient(uri);
const dbName = "FuneralMemories";

async function connect() {
	if (!client.topology?.isConnected()) {
		await client.connect();
	}
	return client.db(dbName);
}

// export async function connect() {
// 	if (!this.client.topology || !this.client.topology.isConnected()) {
// 		await this.client.connect();
// 	}
// }

// export async function close() {
// 	await this.client.close();
// }

//memory = {groupId, title, story, location, date, image, author}
//NOTE: Going to use MongoDBs generated _id for memoryId
export async function postMemory(memory) {
	try {
		const db = await connect();
		const result = await db.collection("memories").insertOne(memory);
		return await db.collection("memories").findOne({ _id: result.insertedId });
	} catch (err) {
		console.error("Error adding memory to database:", err.message);
		throw new Error("Unable to add memory");
	}
}

export async function getMemories(groupId) {
	try {
		const db = await connect();
		return await db.collection("memories").find({ groupId }).toArray();
	} catch (err) {
		console.error("Error getting memories from the database:", err.message);
		throw new Error("Unable to get memories");
	}
}

export async function deleteMemory(memoryId) {
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
	memoryId,
	title,
	story,
	location,
	date,
	image
) {
	try {
		const db = await connect();
		const updateFields = { title, story, location, date, image };
		const result = await db
			.collection("memories")
			.updateOne({ _id: new ObjectId(memoryId) }, { $set: updateFields });

		if (result.modifiedCount === 0) {
			throw new Error("Memory not found or no changes made");
		}

		return await db
			.collection("memories")
			.findOne({ _id: new ObjectId(memoryId) });
	} catch (err) {
		console.error("Error updating memory:", err.message);
		throw new Error("Unable to update memory");
	}
}
// }

//memory = {groupId, title, story, location, date, image, author}
//NOTE: Going to use MongoDBs generated _id for memoryId
// export async function putMemory(memory) {
// 	try {
// 		await client.connect();

// 		const result = await memoryCollection.insertOne(memory);
// 		const inserted = await memoryCollection.findOne({ _id: result.insertedId });
// 		return inserted;
// 	} catch (err) {
// 		console.error("Error adding memory to database:", err.message);
// 		throw new Error("Unable to add memory");
// 	} finally {
// 		await client.close();
// 	}
// }

// export async function getMemories(groupId) {
// 	try {
// 		await client.connect();

// 		const memories = await memoryCollection
// 			.find({ groupId: groupId })
// 			.toArray();
// 		return memories;
// 	} catch (err) {
// 		console.error("Error getting memories from the database:", err.message);
// 		throw new Error("Unable to get memories");
// 	} finally {
// 		await client.close();
// 	}
// }

// export async function deleteMemory(memoryId) {
// 	try {
// 		await client.connect();
// 		const result = await memoryCollection.deleteOne({
// 			_id: new ObjectId(memoryId),
// 		});

// 		if (result.deletedCount === 0) {
// 			throw new Error("Memory not found");
// 		}

// 		return { message: "Memory deleted successfully" };
// 	} catch (err) {
// 		console.error("Error deleting memory:", err.message);
// 		throw new Error("Unable to delete memory");
// 	} finally {
// 		await client.close();
// 	}
// }

// export async function updateMemory(
// 	memoryId,
// 	title,
// 	story,
// 	location,
// 	date,
// 	image
// ) {
// 	try {
// 		await client.connect();
// 		const updateFields = { title, story, location, date, image };
// 		const result = await memoryCollection.updateOne(
// 			{ _id: new ObjectId(memoryId) },
// 			{ $set: updateFields }
// 		);

// 		if (result.modifiedCount === 0) {
// 			throw new Error("Memory not found or no changes made");
// 		}

// 		return await memoryCollection.findOne({ _id: new ObjectId(memoryId) });
// 	} catch (err) {
// 		console.error("Error updating memory:", err.message);
// 		throw new Error("Unable to update memory");
// 	} finally {
// 		await client.close();
// 	}
// }
