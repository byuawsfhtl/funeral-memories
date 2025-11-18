import axios from "axios";
import { Admin } from "../model/Admin";
import { Group } from "../model/Group";
import { Memory } from "../model/Memory";
import { ClientCommunicator } from "../network/ClientCommunicator";

export class FuneralMemoryService {
	private communicator: ClientCommunicator;

	constructor() {
		// Replace with your deployed API Gateway base URL (stage included)
		this.communicator = new ClientCommunicator(
			"https://qcdothplo9.execute-api.us-west-2.amazonaws.com/dev"
		);
	}

	async fetchAndStoreToken() {
		//TODO:: Change api to be a functoin in service file
		const authTokenUrl = "https://auth.fhtl.org/get_token";
		try {
			const response = await axios.post(authTokenUrl);
			const token = response.data.access_token;
			sessionStorage.setItem("yourKey", token);
			return token;
		} catch (error) {
			console.error("Error fetching token:", error);
			throw error;
		}
	}

	async fetchPortrait(portraitUrl: string): Promise<string> {
		try {
			const imageRes = await fetch(portraitUrl);
			if (!imageRes.ok) {
				throw new Error("Failed to fetch portrait from FamilySearch");
			}

			const contentType = imageRes.headers.get("content-type") || "image/jpeg";
			const arrayBuffer = await imageRes.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const base64 = `data:${contentType};base64,${buffer.toString("base64")}`;
			return base64;
		} catch (err) {
			console.error("Portrait fetch error:", err);
			throw err;
		}
	}

	private extractActualAccessToken(jwt: string): string | null {
		try {
			const payload = JSON.parse(atob(jwt.split(".")[1]));
			return payload.fs_access_token;
		} catch (err) {
			console.error("Failed to decode token:", err);
			return null;
		}
	}

	private base64ToFile(base64DataUrl: string, fileName: string = "photo.jpg") {
		const [prefix, base64] = base64DataUrl.split(",");

		// Extract MIME type (e.g., "image/jpeg")
		const mimeMatch = prefix.match(/data:(.*);base64/);
		const mimeType: string = mimeMatch ? mimeMatch[1] : "image/jpeg";

		// Convert base64 to binary data
		const byteString = atob(base64);
		const arrayBuffer = new ArrayBuffer(byteString.length);
		const uint8Array = new Uint8Array(arrayBuffer);

		for (let i = 0; i < byteString.length; i++) {
			uint8Array[i] = byteString.charCodeAt(i);
		}

		// Create the File
		return new File([arrayBuffer], fileName, { type: mimeType });
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
						id: memory.memoryId,
						title: memory.title,
						place: memory.place,
						date: memory.date,
						sessionId: memory.sessionId,
					});

					let file: File;
					let type = "Story";

					if (memory.image) {
						const uniqueFilename = `memory-photo-${
							memory.memoryId || Date.now()
						}.jpg`;
						file = this.base64ToFile(memory.image, uniqueFilename);
						type = "Photo";
					} else {
						const description = `Date: ${formattedDate}\nLocation: ${
							memory.place || "N/A"
						}\n\n${memory.memory}`;
						file = new File([description], `${memory.title || "Memory"}.txt`, {
							type: "text/plain",
						});
					}

					const formData = new FormData();
					formData.append("artifact", file);
					formData.append("title", memory.title || "Untitled Memory");
					formData.append("filename", file.name);
					formData.append("type", type);

					const description = `Date: ${formattedDate} | Location: ${
						memory.place || "N/A"
					}\n${memory.memory}\n - Contributed By: ${memory.author}`;
					formData.append("description", description);

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
						return {
							memoryId: memory.memoryId,
							success: false,
							error: errorText,
						};
					}
					console.log(`✅ Upload succeeded for ${memory.title}`);

					return { memoryId: memory.memoryId, success: true };
				})
			);

			return results;
		} catch (err) {
			console.error("Error during FamilySearch publishing:", err);
			throw err;
		}
	}

	// MEMORIES
	// async getMemories(groupId: string) {
	// 	try {
	// 		const res = await fetch(`/api/memories?groupId=${groupId}`);
	// 		if (!res.ok) throw new Error("Failed to fetch memories");
	// 		return await res.json();
	// 	} catch (err) {
	// 		if (err instanceof Error) {
	// 			console.error("Error fetching memories from API:", err.message);
	// 		} else {
	// 			console.error("Error fetching memories from API:", err);
	// 		}
	// 		throw new Error("Unable to fetch memories");
	// 	}
	// }

	async getMemories(groupId: string): Promise<Memory[]> {
		return await this.communicator.doGet<Memory[]>("/memories", { groupId });
	}

	// async addMemory(memory: Partial<Memory>) {
	// 	try {
	// 		const res = await fetch("/api/memories", {
	// 			method: "POST",
	// 			headers: { "Content-Type": "application/json" },
	// 			body: JSON.stringify(memory),
	// 		});
	// 		if (!res.ok) throw new Error("Failed to add memory");
	// 		return await res.json();
	// 	} catch (err) {
	// 		if (err instanceof Error) {
	// 			console.error("Error adding memory:", err.message);
	// 		} else {
	// 			console.error("Error adding memory:", err);
	// 		}
	// 		throw new Error("Unable to add memory");
	// 	}
	// }

	//TODO:: Fix service file in front end to create the _id with => crypt.randomUUID();
	async addMemory(memory: Memory): Promise<{ message: string }> {
		return await this.communicator.doPost("/memories", { memory });
	}

	// async deleteMemory(memoryId: string) {
	// 	//TODO:: change to groupId and the memoryId!!!!!
	// 	try {
	// 		const res = await fetch("/api/memories", {
	// 			method: "DELETE",
	// 			headers: { "Content-Type": "application/json" },
	// 			body: JSON.stringify({ memoryId }),
	// 		});
	// 		if (!res.ok) throw new Error("Failed to delete memory");
	// 		return await res.json();
	// 	} catch (err) {
	// 		if (err instanceof Error) {
	// 			console.error("Error deleting memory:", err.message);
	// 		} else {
	// 			console.error("Error deleting memory:", err);
	// 		}
	// 		throw new Error("Unable to delete memory");
	// 	}
	// }

	async deleteMemory(
		groupId: string,
		memoryId: string
	): Promise<{ message: string }> {
		return await this.communicator.doDelete("/memories", {
			groupId,
			memoryId,
		});
	}

	// async updateMemory(data: {
	// 	memoryId: string;
	// 	title: string;
	// 	story: string;
	// 	place: string;
	// 	date: string;
	// 	image: string | null;
	// 	author: string;
	// }) {
	// 	//const { memoryId, title, story, location, date, image } = data;
	// 	console.log("Sending to backend:", {
	// 		data,
	// 	});

	// 	try {
	// 		const res = await fetch("/api/memories", {
	// 			method: "PUT",
	// 			headers: { "Content-Type": "application/json" },
	// 			body: JSON.stringify({
	// 				...data,
	// 			}),
	// 		});
	// 		if (!res.ok) throw new Error("Failed to update memory");
	// 		return await res.json();
	// 	} catch (err) {
	// 		if (err instanceof Error) {
	// 			console.error("Error updating memory:", err.message);
	// 		} else {
	// 			console.error("Error updating memory:", err);
	// 		}
	// 		throw new Error("Unable to update memory");
	// 	}
	// }

	async updateMemory(memory: Memory): Promise<{ message: string }> {
		return await this.communicator.doPost("/memories/update", { memory });
	}

	// GROUPS
	//any because they add properties to them to fit the models
	// async addGroup(group: any, admin: any) {
	// 	let newGroupId = Math.random().toString(36).substring(2, 8);
	// 	newGroupId = newGroupId.toLowerCase();
	// 	try {
	// 		let existing;
	// 		do {
	// 			console.log("got to before fetch");
	// 			const res = await fetch(`/api/group?groupId=${newGroupId}`);
	// 			existing = res.ok ? await res.json() : null;
	// 			if (existing) {
	// 				newGroupId = Math.random().toString(36).substring(2, 8);
	// 				newGroupId = newGroupId.toLowerCase();
	// 			}
	// 		} while (existing);
	// 		console.log("got after fetch");

	// 		console.log("groupID: ", newGroupId);
	// 		console.log("admin: ", admin);

	// 		await this.addAdmin({ groupId: newGroupId, ...admin });
	// 		console.log("added admin");

	// 		const res = await fetch("/api/group", {
	// 			method: "POST",
	// 			headers: { "Content-Type": "application/json" },
	// 			body: JSON.stringify({ groupId: newGroupId, ...group }),
	// 		});
	// 		if (!res.ok) throw new Error("Failed to add group");
	// 		const newGroup = await res.json();

	// 		// Send email after group and admin created:
	// 		await fetch("/api/send-admin-credentials", {
	// 			method: "POST",
	// 			headers: { "Content-Type": "application/json" },
	// 			body: JSON.stringify({
	// 				email: admin.admin, // assuming username is the admin email
	// 				username: admin.admin,
	// 				password: admin.password,
	// 				groupId: newGroupId,
	// 				ancestorName: group.ancestor?.name || "Unknown",
	// 				expirationDate: group.expirationDate,
	// 				pid: group.ancestor?.id || "Unknown",
	// 			}),
	// 		});

	// 		return newGroup;
	// 	} catch (err) {
	// 		if (err instanceof Error) {
	// 			console.error("Error adding group:", err.message);
	// 		} else {
	// 			console.error("Error adding group:", err);
	// 		}
	// 		throw new Error("Unable to add group");
	// 	}
	// }
	async addGroup(group: any, admin: any): Promise<Group> {
		// 1️⃣ Generate unique group ID
		let newGroupId = this.generateGroupId();

		let existing: Group | null = null;
		do {
			console.log("Checking if group ID exists:", newGroupId);

			try {
				existing = await this.communicator.doGet<Group>("/group", {
					groupId: newGroupId,
				});
			} catch (err: any) {
				// If the Lambda returns 404 or "not found", we’re fine — it means it's unique.
				existing = null;
			}

			if (existing) {
				console.log(
					`Group ID ${newGroupId} already exists, generating a new one...`
				);
				newGroupId = this.generateGroupId();
			}
		} while (existing);

		console.log("✅ Unique group ID confirmed:", newGroupId);

		// 2️⃣ Create admin entry
		await this.communicator.doPost("/admin", {
			admin: { groupId: newGroupId, ...admin },
		});
		console.log("✅ Admin created successfully");

		// 3️⃣ Create group
		const newGroup = await this.communicator.doPost("/group", {
			group: { groupId: newGroupId, ...group },
		});
		console.log("✅ Group created successfully");

		// 4️⃣ Send credentials email
		await this.communicator.doPost("/admin/send-credentials", {
			email: admin.admin, // assuming admin.admin is the email
			username: admin.admin,
			password: admin.password,
			groupId: newGroupId,
			ancestorName: group.ancestor?.name || "Unknown",
			expirationDate: group.expirationDate,
			pid: group.ancestor?.id || "Unknown",
		});
		console.log("📨 Credentials email sent successfully");

		// 5️⃣ Return created group info (you can fetch fresh copy if needed)
		const finalGroup = await this.communicator.doGet<Group>("/group", {
			groupId: newGroupId,
		});

		return finalGroup;
	}

	private generateGroupId(): string {
		return Math.random().toString(36).substring(2, 8).toLowerCase();
	}

	// async getGroup(groupId: string): Promise<Group> {
	// 	try {
	// 		console.log(`in service: ${groupId}`);
	// 		const res = await fetch(`/api/group?groupId=${groupId}`);
	// 		if (!res.ok) throw new Error("Failed to fetch group");
	// 		return await res.json();
	// 	} catch (err) {
	// 		if (err instanceof Error) {
	// 			console.error("Error fetching group:", err.message);
	// 		} else {
	// 			console.error("Error fetching group:", err);
	// 		}
	// 		throw new Error("Unable to fetch group");
	// 	}
	// }

	async getGroup(groupId: string): Promise<Group> {
		return await this.communicator.doGet<Group>("/group", { groupId });
	}

	// async closeGroup(groupId: string) {
	// 	try {
	// 		const res = await fetch("/api/group", {
	// 			method: "PUT",
	// 			headers: { "Content-Type": "application/json" },
	// 			body: JSON.stringify({ groupId, closed: true }),
	// 		});
	// 		if (!res.ok) throw new Error("Failed to update group");
	// 		return await res.json();
	// 	} catch (err) {
	// 		if (err instanceof Error) {
	// 			console.error("Error updating group:", err.message);
	// 		} else {
	// 			console.error("Error updating group:", err);
	// 		}
	// 		throw new Error("Unable to update group");
	// 	}
	// }

	// async deleteGroup(groupId: string) {
	// 	try {
	// 		const res = await fetch("/api/group", {
	// 			method: "DELETE",
	// 			headers: { "Content-Type": "application/json" },
	// 			body: JSON.stringify({ groupId }),
	// 		});
	// 		if (!res.ok) throw new Error("Failed to delete group");
	// 		return await res.json();
	// 	} catch (err) {
	// 		if (err instanceof Error) {
	// 			console.error("Error deleting group:", err.message);
	// 		} else {
	// 			console.error("Error deleting group:", err);
	// 		}
	// 		throw new Error("Unable to delete group");
	// 	}
	// }

	async deleteGroup(groupId: string): Promise<{ message: string }> {
		return await this.communicator.doDelete("/group", { groupId });
	}

	// ADMINS
	// async addAdmin(admin: Admin) {
	// 	try {
	// 		const res = await fetch("/api/admin", {
	// 			method: "POST",
	// 			headers: { "Content-Type": "application/json" },
	// 			body: JSON.stringify(admin),
	// 		});
	// 		if (!res.ok) {
	// 			const text = await res.text();
	// 			console.error("Server error:", text);
	// 			throw new Error("Failed to add admin");
	// 		}
	// 		return await res.json();
	// 	} catch (err) {
	// 		if (err instanceof Error) {
	// 			console.error("Error adding admin:", err.message);
	// 		} else {
	// 			console.error("Error adding admin:", err);
	// 		}
	// 		throw new Error("Unable to add admin");
	// 	}
	// }

	async addAdmin(admin: Admin): Promise<{ message: string }> {
		return await this.communicator.doPost("/admin", { admin });
	}

	// async getAdmin(groupId: string) {
	// 	try {
	// 		const res = await fetch(`/api/admin?groupId=${groupId}`);
	// 		if (!res.ok) throw new Error("Failed to fetch admin");
	// 		return await res.json();
	// 	} catch (err) {
	// 		if (err instanceof Error) {
	// 			console.error("Error fetching admin:", err.message);
	// 		} else {
	// 			console.error("Error fetching admin:", err);
	// 		}
	// 		throw new Error("Unable to fetch admin");
	// 	}
	// }

	async getAdmin(groupId: string): Promise<Admin> {
		return await this.communicator.doGet<Admin>("/admin", { groupId });
	}

	//TODO:: might be able to delete
	// async deleteAdmin(groupId: string) {
	// 	try {
	// 		const res = await fetch("/api/admin", {
	// 			method: "DELETE",
	// 			headers: { "Content-Type": "application/json" },
	// 			body: JSON.stringify({ groupId }),
	// 		});
	// 		if (!res.ok) throw new Error("Failed to delete admin");
	// 		return await res.json();
	// 	} catch (err) {
	// 		if (err instanceof Error) {
	// 			console.error("Error deleting admin:", err.message);
	// 		} else {
	// 			console.error("Error deleting admin:", err);
	// 		}
	// 		throw new Error("Unable to delete admin");
	// 	}
	// }
	async deleteAdmin(groupId: string): Promise<{ message: string }> {
		return await this.communicator.doDelete("/admin", { groupId });
	}

	// async getAdminSessions(groupId: string) {
	// 	try {
	// 		const response = await fetch(`/api/admin-sessions?groupId=${groupId}`);
	// 		if (!response.ok) throw new Error("Failed to fetch admin sessions");
	// 		const data = await response.json();
	// 		return data.sessions || [];
	// 	} catch (err) {
	// 		console.error("Error fetching admin sessions:", err);
	// 		return [];
	// 	}
	// }

	async getAdminSessions(groupId: string): Promise<string[]> {
		return await this.communicator.doGet<string[]>("/admin/sessions", {
			groupId,
		});
	}

	// async isClosed(groupId: string): Promise<boolean> {
	// 	try {
	// 		const res = await fetch(`/api/group?groupId=${groupId}`);
	// 		if (!res.ok) throw new Error("Failed to fetch group status");
	// 		const group = await res.json();
	// 		return group.closed || false;
	// 	} catch (err) {
	// 		if (err instanceof Error) {
	// 			console.error("Error checking group status:", err.message);
	// 		} else {
	// 			console.error("Error checking group status:", err);
	// 		}
	// 		throw new Error("Unable to check group status");
	// 	}
	// }

	async login(data: {
		groupId: string;
		username: string;
		password: string;
		sessionId: string;
	}): Promise<{ message: string; sessionId: string }> {
		return await this.communicator.doPost("/admin/login", data);
	}
}
