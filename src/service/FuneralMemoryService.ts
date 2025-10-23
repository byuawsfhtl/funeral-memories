import { Admin } from "../model/Admin";
import { Group } from "../model/Group";
import { Memory } from "../model/Memory";

export class FuneralMemoryService {
        private readonly enableMockData =
                import.meta.env.VITE_ENABLE_API_MOCKS === "true" ||
                (import.meta.env.DEV && import.meta.env.VITE_ENABLE_API_MOCKS !== "false");

        private mockGroup: Group = {
                groupId: "elmwood",
                ancestor: {
                        name: "Eleanor \"Ellie\" Thompson",
                        gender: "Female",
                        birthDate: "1932-04-17",
                        birthPlace: "Savannah, Georgia, USA",
                        deathDate: "2021-11-02",
                        deathPlace: "Salt Lake City, Utah, USA",
                        ascendancyNumber: "1",
                        descendancyNumber: "1",
                        role: "Honored Loved One",
                        id: "KWJH-ELLE",
                },
                portrait: "/placeholder_img/raf_pilot.jpg",
                closed: false,
                timestamp: new Date("2024-02-14T12:00:00Z"),
        };

        private mockAdmins: Admin[] = [
                {
                        groupId: "elmwood",
                        admin: "host@example.com",
                        password: "remember-me",
                },
        ];

        private mockMemories: Memory[] = [
                {
                        _id: "mock-memory-1",
                        groupId: "elmwood",
                        title: "Grandma's Laughter",
                        memory:
                                "Ellie's laughter filled the whole farmhouse during Sunday dinners. She always told the funniest stories about her days as a nurse.",
                        place: "Savannah, Georgia",
                        date: "1968-06-12",
                        image: "/placeholder_img/pc159.jpg",
                        author: "Caroline M.",
                        createdAt: new Date("2024-01-05T10:30:00Z"),
                        sessionId: "mock-session-guest-1",
                },
                {
                        _id: "mock-memory-2",
                        groupId: "elmwood",
                        title: "Porch Swing Evenings",
                        memory:
                                "We would sit together on the porch swing drinking sweet tea while she hummed old hymns. Those quiet evenings are my favorite memories.",
                        place: "Salt Lake City, Utah",
                        date: "1994-08-23",
                        image: null,
                        author: "Henry T.",
                        createdAt: new Date("2024-01-07T18:45:00Z"),
                        sessionId: "mock-session-guest-2",
                },
                {
                        _id: "mock-memory-3",
                        groupId: "elmwood",
                        title: "Airshow Adventure",
                        memory:
                                "Ellie surprised everyone by booking a hot air balloon ride for her 80th birthday. She waved to the grandkids the entire time!",
                        place: "Albuquerque, New Mexico",
                        date: "2012-10-05",
                        image: "/placeholder_img/apollo_13_service_module.jpg",
                        author: "Luis R.",
                        createdAt: new Date("2024-01-10T09:12:00Z"),
                        sessionId: "mock-session-guest-3",
                },
        ];

        private mockAdminSessions: string[] = ["mock-session-admin"];

        private cloneGroup(group: Group, overrideId?: string): Group {
                return {
                        ...group,
                        groupId: overrideId ?? group.groupId,
                        ancestor: { ...group.ancestor },
                        timestamp: new Date(group.timestamp),
                };
        }

        private cloneMemory(memory: Memory, overrideGroupId?: string): Memory {
                return {
                        ...memory,
                        groupId: overrideGroupId ?? memory.groupId,
                        createdAt: new Date(memory.createdAt),
                };
        }

        private generateId(prefix: string): string {
                if (
                        typeof globalThis !== "undefined" &&
                        globalThis.crypto &&
                        typeof globalThis.crypto.randomUUID === "function"
                ) {
                        return `${prefix}-${globalThis.crypto.randomUUID()}`;
                }

                return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
        }

        private returnMockGroup(requestedGroupId?: string) {
                const groupId = requestedGroupId?.toLowerCase() || this.mockGroup.groupId;
                return this.cloneGroup(this.mockGroup, groupId);
        }

        private returnMockMemories(requestedGroupId?: string) {
                const groupId = requestedGroupId?.toLowerCase() || this.mockGroup.groupId;
                return this.mockMemories.map((memory) => this.cloneMemory(memory, groupId));
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
                if (this.enableMockData) {
                        return this.mockMemories.map((memory) => ({
                                memoryId: memory._id,
                                success: true,
                        }));
                }

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

					let file: File;
					let type = "Story";

					if (memory.image) {
						const uniqueFilename = `memory-photo-${
							memory._id || Date.now()
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
                if (this.enableMockData) {
                        return this.returnMockMemories(groupId);
                }

                try {
                        const res = await fetch(`/api/memories?groupId=${groupId}`);
                        if (!res.ok) throw new Error("Failed to fetch memories");
                        return await res.json();
                } catch (err) {
                        if (this.enableMockData) {
                                console.warn("Falling back to mock memories due to fetch error:", err);
                                return this.returnMockMemories(groupId);
                        }
                        if (err instanceof Error) {
                                console.error("Error fetching memories from API:", err.message);
                        } else {
                                console.error("Error fetching memories from API:", err);
                        }
			throw new Error("Unable to fetch memories");
		}
	}

        async addMemory(memory: Partial<Memory>) {
                if (this.enableMockData) {
                        const newMemory: Memory = {
                                _id: this.generateId("mock-memory"),
                                groupId: memory.groupId || this.mockGroup.groupId,
                                title: memory.title || "Untitled Memory",
                                memory: memory.memory || "",
                                place: memory.place || "",
                                date: memory.date || "",
                                image: memory.image || null,
                                author: memory.author || "Anonymous",
                                createdAt: memory.createdAt ? new Date(memory.createdAt) : new Date(),
                                sessionId: memory.sessionId || this.generateId("mock-session"),
                        };
                        this.mockMemories = [...this.mockMemories, newMemory];
                        return this.cloneMemory(newMemory);
                }

                try {
                        const res = await fetch("/api/memories", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(memory),
                        });
                        if (!res.ok) throw new Error("Failed to add memory");
                        return await res.json();
                } catch (err) {
                        if (this.enableMockData) {
                                console.warn("Falling back to mock addMemory due to error:", err);
                                return this.addMemory(memory);
                        }
                        if (err instanceof Error) {
                                console.error("Error adding memory:", err.message);
                        } else {
                                console.error("Error adding memory:", err);
                        }
                        throw new Error("Unable to add memory");
                }
        }

        async deleteMemory(memoryId: string) {
                if (this.enableMockData) {
                        this.mockMemories = this.mockMemories.filter((memory) => memory._id !== memoryId);
                        return { success: true };
                }

                //TODO:: change to groupId and the memoryId!!!!!
                try {
                        const res = await fetch("/api/memories", {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ memoryId }),
                        });
                        if (!res.ok) throw new Error("Failed to delete memory");
                        return await res.json();
                } catch (err) {
                        if (this.enableMockData) {
                                console.warn("Falling back to mock deleteMemory due to error:", err);
                                this.mockMemories = this.mockMemories.filter((memory) => memory._id !== memoryId);
                                return { success: true };
                        }
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

                if (this.enableMockData) {
                        this.mockMemories = this.mockMemories.map((memory) =>
                                memory._id === data.memoryId
                                        ? {
                                                  ...memory,
                                                  title: data.title,
                                                  memory: data.story,
                                                  place: data.place,
                                                  date: data.date,
                                                  image: data.image,
                                                  author: data.author,
                                          }
                                        : memory
                        );
                        const updated = this.mockMemories.find((memory) => memory._id === data.memoryId);
                        return updated ? this.cloneMemory(updated) : null;
                }

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
                        if (this.enableMockData) {
                                console.warn("Falling back to mock updateMemory due to error:", err);
                                return this.updateMemory(data);
                        }
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
                if (this.enableMockData) {
                        const newGroupId = (Math.random().toString(36).substring(2, 8) || "elmwood").toLowerCase();
                        this.mockGroup = this.cloneGroup(
                                {
                                        ...this.mockGroup,
                                        ...group,
                                        ancestor: {
                                                ...this.mockGroup.ancestor,
                                                ...group.ancestor,
                                        },
                                        groupId: newGroupId,
                                        timestamp: new Date(),
                                },
                                newGroupId
                        );
                        this.mockAdmins = [
                                { groupId: newGroupId, admin: admin.admin, password: admin.password },
                        ];
                        return this.cloneGroup(this.mockGroup);
                }

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

			console.log("groupID: ", newGroupId);
			console.log("admin: ", admin);

			await this.addAdmin({ groupId: newGroupId, ...admin });
			console.log("added admin");

			const res = await fetch("/api/group", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ groupId: newGroupId, ...group }),
			});
			if (!res.ok) throw new Error("Failed to add group");
			const newGroup = await res.json();

			// Send email after group and admin created:
			await fetch("/api/send-admin-credentials", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: admin.admin, // assuming username is the admin email
					username: admin.admin,
					password: admin.password,
					groupId: newGroupId,
					ancestorName: group.ancestor?.name || "Unknown",
					expirationDate: group.expirationDate,
					pid: group.ancestor?.id || "Unknown",
				}),
			});

			return newGroup;
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
                if (this.enableMockData) {
                        return this.returnMockGroup(groupId);
                }

                try {
                        console.log(`in service: ${groupId}`);
                        const res = await fetch(`/api/group?groupId=${groupId}`);
                        if (!res.ok) throw new Error("Failed to fetch group");
                        return await res.json();
                } catch (err) {
                        if (this.enableMockData) {
                                console.warn("Falling back to mock group due to fetch error:", err);
                                return this.returnMockGroup(groupId);
                        }
                        if (err instanceof Error) {
                                console.error("Error fetching group:", err.message);
                        } else {
                                console.error("Error fetching group:", err);
                        }
			throw new Error("Unable to fetch group");
		}
	}

        async closeGroup(groupId: string) {
                if (this.enableMockData) {
                        if (this.mockGroup.groupId === groupId) {
                                this.mockGroup = {
                                        ...this.mockGroup,
                                        closed: true,
                                };
                        }
                        return this.cloneGroup(this.mockGroup);
                }

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
                if (this.enableMockData) {
                        if (this.mockGroup.groupId === groupId) {
                                this.mockMemories = [];
                        }
                        return { success: true };
                }

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
                if (this.enableMockData) {
                        this.mockAdmins = [admin];
                        return admin;
                }

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
                if (this.enableMockData) {
                        const admin = this.mockAdmins.find((entry) => entry.groupId === groupId);
                        if (!admin) {
                                throw new Error("Admin not found");
                        }
                        return { ...admin };
                }

                try {
                        const res = await fetch(`/api/admin?groupId=${groupId}`);
                        if (!res.ok) throw new Error("Failed to fetch admin");
                        return await res.json();
                } catch (err) {
                        if (this.enableMockData) {
                                console.warn("Falling back to mock admin due to fetch error:", err);
                                const admin = this.mockAdmins.find((entry) => entry.groupId === groupId);
                                if (admin) {
                                        return { ...admin };
                                }
                                throw new Error("Unable to fetch admin");
                        }
                        if (err instanceof Error) {
                                console.error("Error fetching admin:", err.message);
                        } else {
                                console.error("Error fetching admin:", err);
                        }
			throw new Error("Unable to fetch admin");
		}
	}

	//TODO:: might be able to delete
        async deleteAdmin(groupId: string) {
                if (this.enableMockData) {
                        this.mockAdmins = this.mockAdmins.filter((admin) => admin.groupId !== groupId);
                        return { success: true };
                }

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
                if (this.enableMockData) {
                        return [...this.mockAdminSessions];
                }

                try {
                        const response = await fetch(`/api/admin-sessions?groupId=${groupId}`);
                        if (!response.ok) throw new Error("Failed to fetch admin sessions");
                        const data = await response.json();
                        return data.sessions || [];
                } catch (err) {
                        if (this.enableMockData) {
                                console.warn(
                                        "Falling back to mock admin sessions due to fetch error:",
                                        err
                                );
                                return [...this.mockAdminSessions];
                        }
                        console.error("Error fetching admin sessions:", err);
                        return [];
                }
        }

        async isClosed(groupId: string): Promise<boolean> {
                if (this.enableMockData) {
                        return this.returnMockGroup(groupId).closed;
                }

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
