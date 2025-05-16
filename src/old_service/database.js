const { MongoClient } = require("mongodb");
const config = require("./dbConfig.json");

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db("FuneralMemories");
const memoryCollection = db.collection("memories");

// async function main() {
//   (async function testConnection() {
//     await client.connect();
//     await db.command({ ping: 1 });
//   })().catch((ex) => {
//     console.log(`Unable to connect to database with ${url} because ${ex.message}`);
//     process.exit(1);
//   });

//   test = {test: "This is a test"};
//   await addMemory(test);
//   mems = await getMemories();
//   mems.forEach((i) => console.log(i.test));
//   await client.close();
// }

// main().catch(console.error);

(async function testConnection() {
	await client.connect();
	await db.command({ ping: 1 });
})().catch((ex) => {
	console.log(
		`Unable to connect to database with ${url} because ${ex.message}`
	);
	process.exit(1);
});

async function addMemory(memory) {
	try {
		const result = await memoryCollection.insertOne(memory);
		const inserted = await memoryCollection.findOne({ _id: result.insertedId });
		return inserted;
	} catch (err) {
		console.error("Error adding memory to database: ", err.message);
		throw new Error("Unable to add memory");
	}
}

// TODO:: Need to make sure this is the correct way to implement it

// async function deleteMemory(memory) {
// 	try {
// 		const result = await memoryCollection.deleteOne(memory);
// 		return true;
// 	} catch (err) {
// 		console.error("Error deleting memory in database: ", err.message);
// 		throw new Error("Unable to delete memory");
// 	}
// }

async function getMemories(groupId) {
	try {
		const memories = await memoryCollection
			.find({ groupId: groupId })
			.toArray();
		return memories;
	} catch (err) {
		console.error("Error getting memories from the database: ", err.message);
		throw new Error("Unable to get memories");
	}
}

module.exports = { addMemory, getMemories };
