// import { MongoClient } from "mongodb";
// import { readFile } from "fs/promises";

// const config = JSON.parse(
// 	await readFile(new URL("./dbConfig.json", import.meta.url))
// );

// const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;

// export class GroupDAO {
// 	constructor() {
// 		this.client = new MongoClient(url);
// 		this.db = this.client.db("FuneralMemories");
// 		this.collection = this.db.collection("groups");
// 	}

// 	async connect() {
// 		if (!this.client.topology || !this.client.topology.isConnected()) {
// 			await this.client.connect();
// 		}
// 	}

// 	async close() {
// 		await this.client.close();
// 	}

import { MongoClient } from "mongodb";

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

// group = { groupId, timestamp, closed, ancestor }
export async function postGroup(group) {
	try {
		const db = await connect();
		const result = await db.collection("groups").insertOne(group);
		return await db.collection("groups").findOne({ _id: result.insertedId });
	} catch (err) {
		console.error("Error adding group to database:", err.message);
		throw new Error("Unable to add group");
	}
}

export async function getGroup(groupId) {
	try {
		const db = await connect();
		return await db.collection("groups").findOne({ groupId });
	} catch (err) {
		console.error("Error getting group:", err.message);
		throw new Error("Unable to get group");
	}
}

export async function updateGroup(groupId, closed) {
	try {
		const db = await connect();
		const result = await db
			.collection("groups")
			.updateOne({ groupId }, { $set: { closed } });

		if (result.modifiedCount === 0) {
			throw new Error("Group not found or already up-to-date");
		}

		return await db.collection("groups").findOne({ groupId });
	} catch (err) {
		console.error("Error updating group:", err.message);
		throw new Error("Unable to update group");
	}
}

export async function deleteGroup(groupId) {
	try {
		const db = await connect();
		const result = await db.collection("groups").deleteOne({ groupId });

		if (result.deletedCount === 0) {
			throw new Error("Group not found or already deleted");
		}

		return { message: "Group deleted successfully" };
	} catch (err) {
		console.error("Error deleting group:", err.message);
		throw new Error("Unable to delete group");
	}
}
// }

// async function putGroup(group) {
// 	try {
// 		await client.connect();

// 		const result = await groupCollection.insertOne(group);
// 		const inserted = await groupCollection.findOne({ _id: result.insertedId });
// 		return inserted;
// 	} catch (err) {
// 		console.error("Error adding group to database:", err.message);
// 		throw new Error("Unable to add group");
// 	} finally {
// 		await client.close();
// 	}
// }

// async function getGroup(groupId) {
// 	try {
// 		await client.connect();

// 		const group = await groupCollection.findOne({ groupId: groupId });
// 		return group;
// 	} catch (err) {
// 		console.error("Error getting group from the database:", err.message);
// 		throw new Error("Unable to get group");
// 	} finally {
// 		await client.close();
// 	}
// }

// async function updateGroup(groupId, closed) {
// 	try {
// 		await client.connect();

// 		const result = await groupCollection.updateOne(
// 			{ groupId: groupId },
// 			{ $set: { closed: closed } }
// 		);

// 		if (result.modifiedCount === 0) {
// 			throw new Error("Group not found or already up-to-date");
// 		}

// 		const updatedGroup = await groupCollection.findOne({ groupId: groupId });
// 		return updatedGroup;
// 	} catch (err) {
// 		console.error("Error updating group:", err.message);
// 		throw new Error("Unable to update group");
// 	} finally {
// 		await client.close();
// 	}
// }

// async function deleteGroup(groupId) {
// 	try {
// 		await client.connect();

// 		const result = await groupCollection.deleteOne({ groupId: groupId });

// 		if (result.deletedCount === 0) {
// 			throw new Error("Group not found or already deleted");
// 		}

// 		return { message: "Group deleted successfully" };
// 	} catch (err) {
// 		console.error("Error deleting group:", err.message);
// 		throw new Error("Unable to delete group");
// 	} finally {
// 		await client.close();
// 	}
// }
