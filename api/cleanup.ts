import type { IncomingMessage, ServerResponse } from "http";
import { MongoClient, ObjectId } from "mongodb";

// Setup DB connection
const uri = process.env.MONGODB_URI!;
const dbName = "FuneralMemories";
const client = new MongoClient(uri);

async function connect() {
  if (!client.topology?.isConnected?.()) {
    await client.connect();
  }
  return client.db(dbName);
}

async function getAllGroups() {
  const db = await connect();
  return await db.collection("group").find().toArray();
}

async function getMemories(groupId: string) {
  const db = await connect();
  return await db.collection("memories").find({ groupId }).toArray();
}

async function deleteMemory(memoryId: string) {
  const db = await connect();
  return await db.collection("memories").deleteOne({ _id: new ObjectId(memoryId) });
}

async function deleteGroup(groupId: string) {
  const db = await connect();
  return await db.collection("group").deleteOne({ groupId });
}

async function deleteAdmin(groupId: string) {
  const db = await connect();
  return await db.collection("admin").deleteOne({ groupId });
}

async function deleteAdminSessions(groupId: string) {
  const db = await connect();
  return await db.collection("adminSessions").deleteOne({ groupId });
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

    for (const group of allGroups) {
      if (group.timestamp < cutoff) {
        try {
          const memories = await getMemories(group.groupId);
          for (const memory of memories) {
            await deleteMemory(memory._id);
          }

          await deleteAdmin(group.groupId);
          await deleteAdminSessions(group.groupId); // optional but nice
          await deleteGroup(group.groupId);

          console.log(`✅ Deleted group ${group.groupId}`);
        } catch (err) {
          console.error(`❌ Error deleting group ${group.groupId}:`, err);
        }
      }
    }

    return res.status(200).json({ success: true, message: "Cleanup complete" });
  } catch (err) {
    console.error("❌ Cleanup failed:", err);
    return res.status(500).json({ success: false, error: "Cleanup failed" });
  }
}
