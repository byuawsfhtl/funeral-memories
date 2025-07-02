import type { IncomingMessage, ServerResponse } from "http";
import { FuneralMemoryService } from "../../src/service/FuneralMemoryService";

export default async function handler(
  req: IncomingMessage & { method?: string },
  res: ServerResponse & {
    status: (code: number) => typeof res;
    json: (body: any) => void;
  }
) {
  const service = new FuneralMemoryService();

  try {
    const response = await fetch(`${process.env.BASE_URL}/api/group`);
    if (!response.ok) throw new Error("Failed to fetch all groups");
    const allGroups = await response.json();

    const now = Date.now();
    const cutoff = now - 14 * 24 * 60 * 60 * 1000; // 14 days

    for (const group of allGroups) {
      if (group.timestamp < cutoff) {
        try {
          const memories = await service.getMemories(group.groupId);
          for (const memory of memories) {
            await service.deleteMemory(memory._id);
          }
          await service.deleteAdmin(group.groupId);
          await service.deleteGroup(group.groupId);
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
