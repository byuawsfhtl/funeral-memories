import type { IncomingMessage, ServerResponse } from "http";

async function getMemories(groupId: string) {
  const res = await fetch(`${process.env.BASE_URL}/api/memories?groupId=${groupId}`);
  if (!res.ok) throw new Error("Failed to fetch memories");
  return await res.json();
}

async function deleteMemory(memoryId: string) {
  const res = await fetch(`${process.env.BASE_URL}/api/memories`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memoryId }),
  });
  if (!res.ok) throw new Error("Failed to delete memory");
}

async function deleteGroup(groupId: string) {
  const res = await fetch(`${process.env.BASE_URL}/api/group`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId }),
  });
  if (!res.ok) throw new Error("Failed to delete group");
}

async function deleteAdmin(groupId: string) {
  const res = await fetch(`${process.env.BASE_URL}/api/admin`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId }),
  });
  if (!res.ok) throw new Error("Failed to delete admin");
}

export default async function handler(
  req: IncomingMessage & { method?: string },
  res: ServerResponse & {
    status: (code: number) => typeof res;
    json: (body: any) => void;
  }
) {
  try {
    const response = await fetch(`${process.env.BASE_URL}/api/group`);
    if (!response.ok) throw new Error("Failed to fetch all groups");
    const allGroups = await response.json();

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
