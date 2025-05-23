export class FuneralMemoryService {
  // MEMORIES
  async getMemories(groupId) {
    try {
      const res = await fetch(`/api/memories?groupId=${groupId}`);
      if (!res.ok) throw new Error("Failed to fetch memories");
      return await res.json();
    } catch (err) {
      console.error("Error fetching memories from API:", err.message);
      throw new Error("Unable to fetch memories");
    }
  }

  async addMemory(memory) {
    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memory),
      });
      if (errorData?.error?.includes("closed")) {
        throw new Error("This group is closed and cannot accept new memories.");
      }
      if (!res.ok) throw new Error("Failed to add memory");
      return await res.json();
    } catch (err) {
      console.error("Error adding memory:", err.message);
      throw new Error("Unable to add memory");
    }
  }

  async deleteMemory(memoryId) {
    try {
      const res = await fetch("/api/memories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memoryId }),
      });
      if (!res.ok) throw new Error("Failed to delete memory");
      return await res.json();
    } catch (err) {
      console.error("Error deleting memory:", err.message);
      throw new Error("Unable to delete memory");
    }
  }

  async updateMemory(memoryId, title, story, location, date, image) {
    try {
      const res = await fetch("/api/memories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memoryId, title, story, location, date, image }),
      });
      if (!res.ok) throw new Error("Failed to update memory");
      return await res.json();
    } catch (err) {
      console.error("Error updating memory:", err.message);
      throw new Error("Unable to update memory");
    }
  }

  // GROUPS
  async addGroup(group, admin) {
    let newGroupId = Math.random().toString(36).substring(2, 8);
    try {
      let existing;
      do {
        console.log("got to before fetch");
        const res = await fetch(`/api/group?groupId=${newGroupId}`);
        existing = res.ok ? await res.json() : null;
        if (existing) {
          newGroupId = Math.random().toString(36).substring(2, 8);
        }
      } while (existing);
      console.log("got after fetch");

      await this.addAdmin({ groupId: newGroupId, ...admin });
      console.log("added admin");

      const res = await fetch("/api/group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: newGroupId, ...group }),
      });
      if (!res.ok) throw new Error("Failed to add group");
      return await res.json();
    } catch (err) {
      console.error("Error adding group:", err.message);
      throw new Error("Unable to add group");
    }
  }

  async getGroup(groupId) {
    try {
      const res = await fetch(`/api/group?groupId=${groupId}`);
      if (!res.ok) throw new Error("Failed to fetch group");
      return await res.json();
    } catch (err) {
      console.error("Error fetching group:", err.message);
      throw new Error("Unable to fetch group");
    }
  }

  async updateGroup(groupId, closed) {
    try {
      const res = await fetch("/api/group", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, closed }),
      });
      if (!res.ok) throw new Error("Failed to update group");
      return await res.json();
    } catch (err) {
      console.error("Error updating group:", err.message);
      throw new Error("Unable to update group");
    }
  }

  async deleteGroup(groupId) {
    try {
      const res = await fetch("/api/group", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });
      if (!res.ok) throw new Error("Failed to delete group");
      return await res.json();
    } catch (err) {
      console.error("Error deleting group:", err.message);
      throw new Error("Unable to delete group");
    }
  }

  // ADMINS
  async addAdmin(admin) {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(admin),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Server error:", text);
        throw new Error("Failed to add admin");
      }
      return await res.json();
    } catch (err) {
      console.error("Error adding admin:", err.message);
      throw new Error("Unable to add admin");
    }
  }

  async getAdmin(groupId) {
    try {
      const res = await fetch(`/api/admin?groupId=${groupId}`);
      if (!res.ok) throw new Error("Failed to fetch admin");
      return await res.json();
    } catch (err) {
      console.error("Error fetching admin:", err.message);
      throw new Error("Unable to fetch admin");
    }
  }

  async deleteAdmin(groupId) {
    try {
      const res = await fetch("/api/admin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });
      if (!res.ok) throw new Error("Failed to delete admin");
      return await res.json();
    } catch (err) {
      console.error("Error deleting admin:", err.message);
      throw new Error("Unable to delete admin");
    }
  }
}
