import type { IncomingMessage, ServerResponse } from "http";
import { deleteGroup, getGroup } from "../lib/GroupDAO";
import { deleteMemories } from "../lib/MemoriesDAO";
import { deleteAdmin } from "../lib/AdminDAO";
import { deleteAdminSessions } from "../lib/AdminDAO"; // if you have one

export default async function handler(
  req: IncomingMessage & { method?: string },
  res: ServerResponse & {
    status: (code: number) => typeof res;
    json: (body: any) => void;
  }
) {
  try {
    console.log("🚀 Cleanup cron job triggered");

    const cutoff = Date.now() - 5 * 60 * 1000; // 5 minutes
    console.log("🕒 Cutoff timestamp:", cutoff);

    const allGroups = await getAllGroups();
    console.log(`📦 Found ${allGroups.length} group(s)`);

    for (const group of allGroups) {
      const { groupId, timestamp } = group;

      try {
        console.log(`\n🔍 Checking group ${groupId} (timestamp: ${timestamp})`);

        if (timestamp < cutoff) {
          console.log(`⚠️ Group ${groupId} is older than 5 minutes — deleting related data`);

          const deleteMemoriesResult = await deleteMemories(groupId);
          console.log("🗑️ Memories deleted:", deleteMemoriesResult.message);

          const deleteAdminResult = await deleteAdmin(groupId);
          console.log("🗑️ Admin deleted:", deleteAdminResult.message);

          try {
            const deleteAdminSessionsResult = await deleteAdminSessions(groupId);
            console.log("🗑️ Admin sessions deleted:", deleteAdminSessionsResult.message);
          } catch (err) {
            console.warn("⚠️ Failed to delete admin sessions (might be fine):", err);
          }

          const deleteGroupResult = await deleteGroup(groupId);
          console.log("✅ Group deleted:", deleteGroupResult.message);
        } else {
          console.log(`⏭️ Group ${groupId} is still newer than 5 minutes. Skipping.`);
        }
      } catch (err) {
        console.error(`❌ Failed processing group ${groupId}:`, err);
      }
    }

    return res.status(200).json({ success: true, message: "Cleanup complete" });
  } catch (err) {
    console.error("❌ Cleanup failed:", err);
    return res.status(500).json({ success: false, error: "Cleanup failed" });
  }
}

async function getAllGroups(): Promise<{ groupId: string; timestamp: number }[]> {
  const { connect } = await import("../lib/GroupDAO");
  const db = await connect();
  const docs = await db
    .collection("groups")
    .find({}, { projection: { groupId: 1, timestamp: 1 } })
    .toArray();

  return docs.map(doc => ({
    groupId: doc.groupId as string,
    timestamp: doc.timestamp as number
  }));
}

