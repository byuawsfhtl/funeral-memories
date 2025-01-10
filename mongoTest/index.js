const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('FuneralMemories');
const memoryCollection = db.collection('memories');

async function main() {
  // Connect to the database cluster
  // const db = client.db('rental');
  // const collection = db.collection('house');

  // Test that you can connect to the database
  (async function testConnection() {
    await client.connect();
    await db.command({ ping: 1 });
  })().catch((ex) => {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    process.exit(1);
  });

  // Insert a document
  // const house = {
  //   name: 'Beachfront views',
  //   summary: 'From your bedroom to the beach, no shoes required',
  //   property_type: 'Condo',
  //   beds: 1,
  // };
  // await collection.insertOne(house);

  // // Query the documents
  // const query = { property_type: 'Condo', beds: { $lt: 2 } };
  // const options = {
  //   sort: { score: -1 },
  //   limit: 10,
  // };

  // const cursor = collection.find(query, options);
  // const rentals = await cursor.toArray();
  // rentals.forEach((i) => console.log(i));
  test = {test: "This is a test"};
  await addMemory(test);
  mems = await getMemories();
  mems.forEach((i) => console.log(i.test));
  await client.close();
}

main().catch(console.error);

async function addMemory(memory){
  try {
    const result = await memoryCollection.insertOne(memory);
    const inserted = await memoryCollection.findOne({ _id: result.insertedId });
    return inserted;
  } catch (err) {
    console.error('Error adding memory to database: ', err.message);
    throw new Error('Unable to add memory');
  }
}

async function getMemories(){
  try {
      const memories = await memoryCollection.find({});
      const array = await memories.toArray();
      return array;
  } catch (err) {
      console.error("Error getting memories from the database: ", err.message);
      throw new Error('Unable to get memories');
  }
}