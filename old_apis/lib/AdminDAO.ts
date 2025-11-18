import { MongoClient, WithId, Document } from "mongodb";
import { genSaltSync, hashSync } from "bcryptjs";
import { Admin } from "../../src/model/Admin";

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

// admin = { groupId, admin, password }
export async function postAdmin(
	admin: Admin
): Promise<WithId<Document> | null> {
	const salt = genSaltSync(10);
	const hash = hashSync(admin.password, salt);

	try {
		const db = await connect();
		const result = await db.collection("admin").insertOne({
			...admin,
			password: hash,
		});
		return await db.collection("admin").findOne({ _id: result.insertedId });
	} catch (err) {
		if (err instanceof Error) {
			console.error("Error adding admin to database:", err.message);
		} else {
			console.error("Error adding admin to database:", err);
		}
		throw new Error("Unable to add admin");
	}
}

export async function getAdmin(groupId: string): Promise<Document | null> {
	try {
		const db = await connect();
		return await db.collection("admin").findOne({ groupId });
	} catch (err) {
		if (err instanceof Error) {
			console.error("Error getting admin:", err.message);
		} else {
			console.error("Error getting admin:", err);
		}
		throw new Error("Unable to get admin");
	}
}

export async function deleteAdmin(
	groupId: string
): Promise<{ message: string }> {
	try {
		const db = await connect();
		const result = await db.collection("admin").deleteOne({ groupId });

		if (result.deletedCount === 0) {
			throw new Error("Admin not found or already deleted");
		}

		return { message: "Admin deleted successfully" };
	} catch (err) {
		if (err instanceof Error) {
			console.error("Error deleting admin:", err.message);
		} else {
			console.error("Error deleting admin:", err);
		}
		throw new Error("Unable to delete admin");
	}
}

export async function addAdminSession(
	groupId: string,
	sessionId: string
): Promise<void> {
	const db = await connect();
	await db
		.collection("adminSessions")
		.updateOne(
			{ groupId },
			{ $addToSet: { sessionIds: sessionId } },
			{ upsert: true }
		);
}

export async function getAdminSessions(groupId: string): Promise<string[]> {
	const db = await connect();
	const doc = await db.collection("adminSessions").findOne({ groupId });
	console.log(doc);
	return doc?.sessionIds || [];
}

export async function deleteAdminSessions(
	groupId: string
): Promise<{ message: string }> {
	try {
		const db = await connect();
		const result = await db.collection("adminSessions").deleteOne({ groupId });

		if (result.deletedCount === 0) {
			throw new Error("Admin sessions not found or already deleted");
		}

		return { message: "Admin sessions deleted successfully" };
	} catch (err) {
		if (err instanceof Error) {
			console.error("Error deleting admin sessions:", err.message);
		} else {
			console.error("Error deleting admin sessions:", err);
		}
		throw new Error("Unable to delete admin sessions");
	}
}
