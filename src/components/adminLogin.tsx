import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FuneralMemoryService } from "../service/FuneralMemoryService";

export default function AdminLogin() {
	const [groupId, setGroupId] = useState<string>("");
	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const service = new FuneralMemoryService();

	const handleLogin = async (e: any) => {
		e.preventDefault();
		setError("");

		if (!groupId.trim() || !username.trim() || !password.trim()) {
			setError("Please fill in all fields.");
			return;
		}

		const sessionId = localStorage.getItem("sessionId") || crypto.randomUUID();
		localStorage.setItem("sessionId", sessionId);

		try {
			// const res = await fetch("/api/login", {
			// 	method: "POST",
			// 	headers: { "Content-Type": "application/json" },
			// 	body: JSON.stringify({ groupId, username, password, sessionId }),
			// });
			const res = await service.login({
				groupId,
				username,
				password,
				sessionId,
			});

			if (!res || !res.sessionId) {
				const message = res.message;
				setError(message || "Invalid login credentials.");
				return;
			}

			// Login succeeded, now fetch group data
			const group = await service.getGroup(groupId);
			if (!group) {
				setError("Group not found after login.");
				return;
			}

			navigate("/wall", {
				state: { madeGroup: group, isAdmin: true },
			});
		} catch (err) {
			if (err instanceof Error) {
				console.error("Login error:", err.message);
			} else {
				console.error("Login error:", err);
			}
			setError("Something went wrong. Please try again.");
		}
	};

	return (
		<main className="d-flex justify-content-center align-items-center flex-column container my-5 flex-grow-1">
			<div className="w-100" style={{ maxWidth: "400px" }}>
				<h2
					className="text-center mb-4"
					style={{ fontFamily: "Merriweather, serif", fontWeight: 500 }}
				>
					Admin Login
				</h2>

				{error && (
					<div className="alert alert-danger text-center py-2">{error}</div>
				)}

				<form onSubmit={handleLogin}>
					<div className="mb-3">
						<label className="form-label">Group ID</label>
						<input
							type="text"
							className="form-control"
							value={groupId}
							onChange={(e) => setGroupId(e.target.value.toLowerCase())}
							placeholder="e.g., abc123"
							required
						/>
					</div>

					<div className="mb-3">
						<label className="form-label">Admin Email</label>
						<input
							type="email"
							className="form-control"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="Enter admin email"
							required
						/>
					</div>

					<div className="mb-3">
						<label className="form-label">Password</label>
						<div style={{ position: "relative" }}>
							<input
								type={showPassword ? "text" : "password"}
								className="form-control"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter password"
								required
								style={{ paddingRight: "2.5rem" }}
							/>
							<button
								type="button"
								onClick={() => setShowPassword((prev) => !prev)}
								title={showPassword ? "Hide password" : "Show password"}
								aria-label={showPassword ? "Hide password" : "Show password"}
								style={{
									position: "absolute",
									right: "0.5rem",
									top: "50%",
									transform: "translateY(-50%)",
									background: "none",
									border: "none",
									padding: "0.25rem",
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									color: "#6c757d",
								}}
							>
								{showPassword ? (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										aria-hidden
									>
										<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
										<circle cx="12" cy="12" r="3" />
									</svg>
								) : (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										aria-hidden
									>
										<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
										<line x1="1" y1="1" x2="23" y2="23" />
									</svg>
								)}
							</button>
						</div>
					</div>

					<div className="d-grid mt-4">
						<button type="submit" className="btn btn-primary">
							Login as Admin
						</button>
					</div>
				</form>
			</div>
		</main>
	);
}
