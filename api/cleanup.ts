import type { IncomingMessage, ServerResponse } from "http";
import { MongoClient } from "mongodb";

// 🌐 Environment connection
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI environment variable is not set");

const client = new MongoClient(uri);
const dbName = "FuneralMemories";

async function connect() {
	await client.connect();
	return client.db(dbName);
}

// 🔍 Get all groups with timestamps
async function getAllGroups(): Promise<{ groupId: string; timestamp: number }[]> {
	const db = await connect();
	const docs = await db
		.collection("groups")
		.find({}, { projection: { groupId: 1, timestamp: 1 } })
		.toArray();

	return docs.map(doc => ({
		groupId: doc.groupId as string,
		timestamp: doc.timestamp as number,
	}));
}

// 🧽 Deletion helpers
async function deleteMemories(groupId: string) {
	const db = await connect();
	const result = await db.collection("memories").deleteMany({ groupId });
	return { message: `${result.deletedCount} memory/memories deleted` };
}

async function deleteGroup(groupId: string) {
	const db = await connect();
	const result = await db.collection("groups").deleteOne({ groupId });
	return { message: `${result.deletedCount} group(s) deleted` };
}

async function deleteAdmin(groupId: string) {
	const db = await connect();
	const result = await db.collection("admin").deleteOne({ groupId });
	return { message: `${result.deletedCount} admin(s) deleted` };
}

async function deleteAdminSessions(groupId: string) {
	const db = await connect();
	const result = await db.collection("adminSessions").deleteMany({ groupId });
	return { message: `${result.deletedCount} admin session(s) deleted` };
}

// 🧹 Main handler for cleanup
export default async function handler(
	req: IncomingMessage & { method?: string },
	res: ServerResponse & {
		status: (code: number) => typeof res;
		json: (body: any) => void;
	}
) {
	try {
		console.log("🚀 Cleanup cron job triggered");

		const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000; //2 weeks ago
		console.log("🕒 Cutoff timestamp:", cutoff);

		const allGroups = await getAllGroups();
		console.log(`📦 Found ${allGroups.length} group(s)`);

		for (const group of allGroups) {
			const { groupId, timestamp } = group;

			try {
				console.log(`🔍 Checking group ${groupId} (timestamp: ${timestamp})`);

				if (timestamp < cutoff) {
					console.log(`⚠️ Group ${groupId} is older than 5 minutes — deleting`);

					const mems = await deleteMemories(groupId);
					console.log("🗑️ Memories:", mems.message);

					const admin = await deleteAdmin(groupId);
					console.log("🗑️ Admin:", admin.message);

					try {
						const sessions = await deleteAdminSessions(groupId);
						console.log("🗑️ Admin sessions:", sessions.message);
					} catch (err) {
						console.warn("⚠️ Admin sessions deletion failed (optional):", err);
					}

					const grp = await deleteGroup(groupId);
					console.log("✅ Group:", grp.message);
				} else {
					console.log(`⏭️ Group ${groupId} is newer. Skipping.`);
				}
			} catch (err) {
				console.error(`❌ Error processing group ${groupId}:`, err);
			}
		}

		return res.status(200).json({ success: true, message: "Cleanup complete" });
	} catch (err) {
		console.error("❌ Cleanup failed:", err);
		return res.status(500).json({ success: false, error: "Cleanup failed" });
	}
}
