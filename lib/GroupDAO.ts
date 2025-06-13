import { MongoClient, WithId, Document } from "mongodb";
import { Group } from "../src/model/Group";

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

export async function postGroup(
	group: Group
): Promise<WithId<Document> | null> {
	try {
		const db = await connect();
		const result = await db.collection("groups").insertOne(group);
		return await db.collection("groups").findOne({ _id: result.insertedId });
	} catch (err) {
		if (err instanceof Error) {
			console.error("Error adding group to database:", err.message);
		} else {
			console.error("Error adding group to database:", err);
		}
		throw new Error("Unable to add group");
	}
}

export async function getGroup(
	groupId: string
): Promise<WithId<Document> | null> {
	try {
		const db = await connect();
		return await db.collection("groups").findOne({ groupId });
	} catch (err) {
		if (err instanceof Error) {
			console.error("Error getting group:", err.message);
		} else {
			console.error("Error getting group:", err);
		}
		throw new Error("Unable to get group");
	}
}

export async function updateGroup(
	groupId: string,
	closed: boolean
): Promise<WithId<Document> | null> {
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
		if (err instanceof Error) {
			console.error("Error updating group:", err.message);
		} else {
			console.error("Error updating group:", err);
		}
		throw new Error("Unable to update group");
	}
}

export async function deleteGroup(
	groupId: string
): Promise<{ message: string }> {
	try {
		const db = await connect();
		const result = await db.collection("groups").deleteOne({ groupId });

		if (result.deletedCount === 0) {
			throw new Error("Group not found or already deleted");
		}

		return { message: "Group deleted successfully" };
	} catch (err) {
		if (err instanceof Error) {
			console.error("Error deleting group:", err.message);
		} else {
			console.error("Error deleting group:", err);
		}
		throw new Error("Unable to delete group");
	}
}
