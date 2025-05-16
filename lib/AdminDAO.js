// import { MongoClient } from 'mongodb';

// const uri = process.env.MONGODB_URI!;
// const client = new MongoClient(uri);
// const dbName = 'your-db-name';

// async function connect() {
//   if (!client.topology?.isConnected()) {
//     await client.connect();
//   }
//   return client.db(dbName);
// }

// export async function addMemory(memory) {
//   const db = await connect();
//   return db.collection('memories').insertOne(memory);
// }

// export async function getMemories(groupId?: string) {
//   const db = await connect();
//   const filter = groupId ? { groupId } : {};
//   return db.collection('memories').find(filter).toArray();
// }

import { MongoClient } from "mongodb";
// import { readFile } from "fs/promises";
import { genSaltSync, hashSync } from "bcryptjs";

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

// const config = JSON.parse(
// 	await readFile(new URL("./dbConfig.json", import.meta.url))
// );

//const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;

//export class AdminDAO {
// constructor() {
// 	this.client = new MongoClient(url);
// 	this.db = this.client.db("FuneralMemories");
// 	this.collection = this.db.collection("admin");
// }

// export async function connect() {
// 	if (!this.client.topology || !this.client.topology.isConnected()) {
// 		await this.client.connect();
// 	}
// }

// export async function close() {
// 	await this.client.close();
// }

// admin = { groupId, admin, password }
export async function postAdmin(admin) {
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
		console.error("Error adding admin to database:", err.message);
		throw new Error("Unable to add admin");
	}
}

export async function getAdmin(groupId) {
	try {
		const db = await connect();
		return await db.collection("admin").findOne({ groupId });
	} catch (err) {
		console.error("Error getting admin:", err.message);
		throw new Error("Unable to get admin");
	}
}

export async function deleteAdmin(groupId) {
	try {
		const db = await connect();
		const result = await db.collection("admin").deleteOne({ groupId });

		if (result.deletedCount === 0) {
			throw new Error("Admin not found or already deleted");
		}

		return { message: "Admin deleted successfully" };
	} catch (err) {
		console.error("Error deleting admin:", err.message);
		throw new Error("Unable to delete admin");
	}
}
//}
