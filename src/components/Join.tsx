import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FuneralMemoryService } from "../service/FuneralMemoryService";

export default function Join() {
	const [groupId, setGroupId] = useState<string>("");
	const navigate = useNavigate();
	const service = new FuneralMemoryService();

	const location = useLocation();

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const paramGroupId = params.get("groupId");

		if (paramGroupId) {
			setGroupId(paramGroupId.toLowerCase());
			handleJoin({ preventDefault: () => {} }); // auto-join if param exists
		}
	}, []);

	const handleJoin = async (event: any) => {
		event.preventDefault();

		try {
			const group = await service.getGroup(groupId);
			console.log("Group fetched:", group);
			if (group) {
				navigate(`/wall`, {
					state: { madeGroup: group },
				});
				localStorage.setItem("madeGroup", JSON.stringify(group));
			} else {
				console.log("no group");
				alert("That group doesn't exist yet, double check the Group ID");
			}
		} catch (err) {
			console.log("server error");
			if (err instanceof Error) {
				console.error("Error fetching group:", err.message);
			} else {
				console.error("Error fetching group:", err);
			}
			alert("That group doesn't exist yet, double check the Group ID");
		}
	};

	return (
		<main
			className="d-flex justify-content-center flex-grow-1 container my-4 d-flex flex-column align-items-center"
			style={{ minHeight: "80vh" }}
		>
			<div className="w-100" style={{ maxWidth: "400px" }}>
				<h1
					className="text-center mb-4"
					style={{ fontFamily: "Merriweather, serif", fontWeight: 500 }}
				>
					Join Group
				</h1>

				<form onSubmit={handleJoin}>
					<div className="mb-3">
						<label htmlFor="group-id" className="form-label">
							Enter Group ID:
						</label>
						<input
							type="text"
							id="group-id"
							className="form-control"
							placeholder="XXXXX"
							value={groupId}
							onChange={(e) => setGroupId(e.target.value.toLowerCase())}
							required
						/>
					</div>
					<button type="submit" className="btn btn-primary w-100">
						Join Group
					</button>
				</form>
			</div>
		</main>
	);
}
