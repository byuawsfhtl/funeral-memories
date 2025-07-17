import { Admin } from "../model/Admin";
import { Group } from "../model/Group";
import { Memory } from "../model/Memory";

export class FuneralMemoryService {
	private extractActualAccessToken(jwt: string): string | null {
		try {
			const payload = JSON.parse(atob(jwt.split(".")[1]));
			return payload.fs_access_token;
		} catch (err) {
			console.error("Failed to decode token:", err);
			return null;
		}
	}

	async publishMemoriesToFamilySearch(
		groupId: string,
		personId: string,
		token: string
	) {
		console.log("uploading");
		const accessToken = this.extractActualAccessToken(token);
		if (!accessToken) {
			throw new Error("Invalid or missing fs_access_token in JWT");
		}
		console.log("Access Token:", accessToken);
		try {
			const memories = await this.getMemories(groupId);
			console.log(memories);

			const results = await Promise.all(
				memories.map(async (memory: Memory) => {
					const formattedDate = memory.date
						? new Date(memory.date).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
						  })
						: "N/A";

					console.log("Preparing memory upload:", {
						id: memory._id,
						title: memory.title,
						place: memory.place,
						date: memory.date,
						sessionId: memory.sessionId,
					});

					const description = `Date: ${formattedDate}\nLocation: ${
						memory.place || "N/A"
					}\n\n${memory.memory}`;
					console.log("decription");

					const file = new File(
						[description],
						`${memory.title || "Memory"}.txt`,
						{
							type: "text/plain",
						}
					);

					const formData = new FormData();
					formData.append("artifact", file);
					formData.append("title", memory.title);
					formData.append("description", description);
					formData.append("filename", file.name);
					formData.append("type", "Story");

					for (const [key, value] of formData.entries()) {
						console.log(`FormData: ${key} =`, value);
					}

					const response = await fetch(
						`https://api.familysearch.org/platform/tree/persons/${personId}/memories`,
						{
							method: "POST",
							headers: {
								Authorization: `Bearer ${accessToken}`,
							},
							body: formData,
						}
					);

					if (!response.ok) {
						const errorText = await response.text();
						return { memoryId: memory._id, success: false, error: errorText };
					}
					console.log(`✅ Upload succeeded for ${memory.title}`);

					return { memoryId: memory._id, success: true };
				})
			);

			return results;
		} catch (err) {
			console.error("Error during FamilySearch publishing:", err);
			throw err;
		}
	}

	// MEMORIES
	async getMemories(groupId: string) {
		try {
			const res = await fetch(`/api/memories?groupId=${groupId}`);
			if (!res.ok) throw new Error("Failed to fetch memories");
			return await res.json();
		} catch (err) {
			if (err instanceof Error) {
				console.error("Error fetching memories from API:", err.message);
			} else {
				console.error("Error fetching memories from API:", err);
			}
			throw new Error("Unable to fetch memories");
		}
	}

	async addMemory(memory: Partial<Memory>) {
		try {
			const res = await fetch("/api/memories", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(memory),
			});
			if (!res.ok) throw new Error("Failed to add memory");
			return await res.json();
		} catch (err) {
			if (err instanceof Error) {
				console.error("Error adding memory:", err.message);
			} else {
				console.error("Error adding memory:", err);
			}
			throw new Error("Unable to add memory");
		}
	}

	async deleteMemory(memoryId: string) {
		try {
			const res = await fetch("/api/memories", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ memoryId }),
			});
			if (!res.ok) throw new Error("Failed to delete memory");
			return await res.json();
		} catch (err) {
			if (err instanceof Error) {
				console.error("Error deleting memory:", err.message);
			} else {
				console.error("Error deleting memory:", err);
			}
			throw new Error("Unable to delete memory");
		}
	}

	async updateMemory(data: {
		memoryId: string;
		title: string;
		story: string;
		place: string;
		date: string;
		image: string | null;
		author: string;
	}) {
		//const { memoryId, title, story, location, date, image } = data;
		console.log("Sending to backend:", {
			data,
		});

		try {
			const res = await fetch("/api/memories", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...data,
				}),
			});
			if (!res.ok) throw new Error("Failed to update memory");
			return await res.json();
		} catch (err) {
			if (err instanceof Error) {
				console.error("Error updating memory:", err.message);
			} else {
				console.error("Error updating memory:", err);
			}
			throw new Error("Unable to update memory");
		}
	}

	// GROUPS
	//any because they add properties to them to fit the models
	async addGroup(group: any, admin: any) {
		let newGroupId = Math.random().toString(36).substring(2, 8);
		newGroupId = newGroupId.toLowerCase();
		try {
			let existing;
			do {
				console.log("got to before fetch");
				const res = await fetch(`/api/group?groupId=${newGroupId}`);
				existing = res.ok ? await res.json() : null;
				if (existing) {
					newGroupId = Math.random().toString(36).substring(2, 8);
					newGroupId = newGroupId.toLowerCase();
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
			if (err instanceof Error) {
				console.error("Error adding group:", err.message);
			} else {
				console.error("Error adding group:", err);
			}
			throw new Error("Unable to add group");
		}
	}

	async getGroup(groupId: string): Promise<Group> {
		try {
			console.log(`in service: ${groupId}`);
			const res = await fetch(`/api/group?groupId=${groupId}`);
			if (!res.ok) throw new Error("Failed to fetch group");
			return await res.json();
		} catch (err) {
			if (err instanceof Error) {
				console.error("Error fetching group:", err.message);
			} else {
				console.error("Error fetching group:", err);
			}
			throw new Error("Unable to fetch group");
		}
	}

	async closeGroup(groupId: string) {
		try {
			const res = await fetch("/api/group", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ groupId, closed: true }),
			});
			if (!res.ok) throw new Error("Failed to update group");
			return await res.json();
		} catch (err) {
			if (err instanceof Error) {
				console.error("Error updating group:", err.message);
			} else {
				console.error("Error updating group:", err);
			}
			throw new Error("Unable to update group");
		}
	}

	async deleteGroup(groupId: string) {
		try {
			const res = await fetch("/api/group", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ groupId }),
			});
			if (!res.ok) throw new Error("Failed to delete group");
			return await res.json();
		} catch (err) {
			if (err instanceof Error) {
				console.error("Error deleting group:", err.message);
			} else {
				console.error("Error deleting group:", err);
			}
			throw new Error("Unable to delete group");
		}
	}

	// ADMINS
	async addAdmin(admin: Admin) {
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
			if (err instanceof Error) {
				console.error("Error adding admin:", err.message);
			} else {
				console.error("Error adding admin:", err);
			}
			throw new Error("Unable to add admin");
		}
	}

	async getAdmin(groupId: string) {
		try {
			const res = await fetch(`/api/admin?groupId=${groupId}`);
			if (!res.ok) throw new Error("Failed to fetch admin");
			return await res.json();
		} catch (err) {
			if (err instanceof Error) {
				console.error("Error fetching admin:", err.message);
			} else {
				console.error("Error fetching admin:", err);
			}
			throw new Error("Unable to fetch admin");
		}
	}

	async deleteAdmin(groupId: string) {
		try {
			const res = await fetch("/api/admin", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ groupId }),
			});
			if (!res.ok) throw new Error("Failed to delete admin");
			return await res.json();
		} catch (err) {
			if (err instanceof Error) {
				console.error("Error deleting admin:", err.message);
			} else {
				console.error("Error deleting admin:", err);
			}
			throw new Error("Unable to delete admin");
		}
	}

	async getAdminSessions(groupId: string) {
		try {
			const response = await fetch(`/api/admin-sessions?groupId=${groupId}`);
			if (!response.ok) throw new Error("Failed to fetch admin sessions");
			const data = await response.json();
			return data.sessions || [];
		} catch (err) {
			console.error("Error fetching admin sessions:", err);
			return [];
		}
	}

	async isClosed(groupId: string): Promise<boolean> {
		try {
			const res = await fetch(`/api/group?groupId=${groupId}`);
			if (!res.ok) throw new Error("Failed to fetch group status");
			const group = await res.json();
			return group.closed || false;
		} catch (err) {
			if (err instanceof Error) {
				console.error("Error checking group status:", err.message);
			} else {
				console.error("Error checking group status:", err);
			}
			throw new Error("Unable to check group status");
		}
	}
}
