import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FuneralMemoryService } from "../service/FuneralMemoryService";

export default function Join() {
	const [groupId, setGroupId] = useState("");
	const navigate = useNavigate();
	const service = new FuneralMemoryService();

	const handleJoin = async (event) => {
		event.preventDefault();
		// if (groupId.trim()) {
		// 	navigate(`/wall`, {
		// 		state: { groupId, isGuest: true },
		// 	});
		// } else {
		// 	alert("That group doesn't exist yet, check for typos");
		// }

		try {
			const group = await service.getGroup(groupId);
			if (group) {
				navigate(`/wall`, {
					state: { group },
				});
			} else {
				alert("That group doesn't exist yet, check for typos");
			}
		} catch (err) {
			console.error("Error fetching group:", err.message);
			alert("That group doesn't exist yet, check for typos");
		}
	};

	return (
		<main
			className="d-flex justify-content-center flex-grow-1 container my-4 flex-grow-1 d-flex flex-column align-items-center"
			style={{ minHeight: "80vh" }}
		>
			<div className="w-100" style={{ maxWidth: "400px" }}>
				<h1
					className="text-center mb-4"
					style={{ fontFamily: "Merriweather, serif", fontWeight: 500 }}
				>
					Join Group
				</h1>

				<div className="d-grid mb-4">
					<a href="/instructions" className="btn btn-primary">
						Click here if you're new! (instructions)
					</a>
				</div>

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
							onChange={(e) => setGroupId(e.target.value)}
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
