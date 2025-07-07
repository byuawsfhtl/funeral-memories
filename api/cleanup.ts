import type { IncomingMessage, ServerResponse } from "http";
import { MongoClient, ObjectId } from "mongodb";

// Setup DB connection
const uri = process.env.MONGODB_URI;
if (!uri) {
	throw new Error("MONGODB_URI environment variable is not set");
}
const client = new MongoClient(uri);
const dbName = "FuneralMemories";

async function connect() {
	console.log("🔌 Connecting to MongoDB...");
	await client.connect();
	console.log("✅ Connected to MongoDB");
	return client.db(dbName);
}

async function getAllGroups() {
	const db = await connect();
	console.log("📥 Fetching all groups...");
	const groups = await db.collection("group").find().toArray();
	console.log(`📦 Found ${groups.length} groups`);
	return groups;
}

async function getMemories(groupId: string) {
	const db = await connect();
	console.log(`📥 Fetching memories for group ${groupId}...`);
	const memories = await db.collection("memories").find({ groupId }).toArray();
	console.log(`📚 Found ${memories.length} memories`);
	return memories;
}

async function deleteMemory(memoryId: ObjectId) {
	const db = await connect();
	console.log(`🗑️ Deleting memory ${memoryId}...`);
	const result = await db.collection("memories").deleteOne({ _id: new ObjectId(memoryId) });
	console.log(`✅ Memory ${memoryId} deleted:`, result.deletedCount === 1);
	return result;
}

async function deleteGroup(groupId: string) {
	const db = await connect();
	console.log(`🗑️ Deleting group ${groupId}...`);
	const result = await db.collection("group").deleteOne({ groupId });
	console.log(`✅ Group ${groupId} deleted:`, result.deletedCount === 1);
	return result;
}

async function deleteAdmin(groupId: string) {
	const db = await connect();
	console.log(`🗑️ Deleting admin for group ${groupId}...`);
	const result = await db.collection("admin").deleteOne({ groupId });
	console.log(`✅ Admin for group ${groupId} deleted:`, result.deletedCount === 1);
	return result;
}

async function deleteAdminSessions(groupId: string) {
	const db = await connect();
	console.log(`🗑️ Deleting admin sessions for group ${groupId}...`);
	const result = await db.collection("adminSessions").deleteOne({ groupId });
	console.log(`✅ Admin sessions for group ${groupId} deleted:`, result.deletedCount === 1);
	return result;
}

export default async function handler(
	req: IncomingMessage & { method?: string },
	res: ServerResponse & {
		status: (code: number) => typeof res;
		json: (body: any) => void;
	}
) {
	try {
		const allGroups = await getAllGroups();

		const now = Date.now();
		const cutoff = now - 5 * 60 * 1000; // 5 minutes

		console.log(`⏱️ Current time: ${now}, Cutoff time: ${cutoff}`);

		for (const group of allGroups) {
			const groupTime = group.timestamp;
			console.log(`🧪 Evaluating group ${group.groupId} with timestamp ${groupTime}`);

			if (groupTime < cutoff) {
				console.log(`⚠️ Group ${group.groupId} is expired — deleting...`);

				try {
					const memories = await getMemories(group.groupId);

					for (const memory of memories) {
						await deleteMemory(memory._id);
					}

					await deleteAdmin(group.groupId);
					await deleteAdminSessions(group.groupId);
					await deleteGroup(group.groupId);

					console.log(`✅ Fully deleted group ${group.groupId}`);
				} catch (err) {
					console.error(`❌ Error deleting group ${group.groupId}:`, err);
				}
			} else {
				console.log(`⏭️ Group ${group.groupId} is still active. Skipping.`);
			}
		}

		return res.status(200).json({ success: true, message: "Cleanup complete" });
	} catch (err) {
		console.error("❌ Cleanup failed:", err);
		return res.status(500).json({ success: false, error: "Cleanup failed" });
	}
}
