import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FuneralMemoryService } from "../service/FuneralMemoryService";

export default function Join() {
	const [groupId, setGroupId] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();
	const location = useLocation();
	const service = new FuneralMemoryService();

	// Handles form submit OR direct param submit
	const handleJoin = async (e?: React.FormEvent, overrideGroupId?: string) => {
		if (e) e.preventDefault();

		const idToUse = overrideGroupId ?? groupId;
		if (!idToUse) return;

		setIsLoading(true);
		try {
			const group = await service.getGroup(idToUse);
			console.log("Group fetched:", group);

			if (group) {
				localStorage.setItem("madeGroup", JSON.stringify(group));
				navigate(`/wall`, { state: { madeGroup: group } });
			} else {
				alert("That group doesn't exist yet, double check the Group ID");
			}
		} catch (err) {
			console.error("Error fetching group:", err);
			alert("That group doesn't exist yet, double check the Group ID");
		} finally {
			setIsLoading(false);
		}
	};

	// If groupId is in the URL query params, auto-join
	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const paramGroupId = params.get("groupId");

		if (paramGroupId) {
			const lowerGroupId = paramGroupId.toLowerCase();
			setGroupId(lowerGroupId);
			handleJoin(undefined, lowerGroupId);
		}
	}, [location.search]);

	return (
		<main className="d-flex justify-content-center flex-grow-1 container my-4 flex-column align-items-center">
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
					<button
						type="submit"
						className="btn btn-primary w-100"
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<span
									className="spinner-border spinner-border-sm me-2"
									role="status"
									aria-hidden="true"
								></span>
								Joining...
							</>
						) : (
							"Join Group"
						)}
					</button>
				</form>
			</div>
		</main>
	);
}
