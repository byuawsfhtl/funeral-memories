import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "react-step-progress-bar";
import "../styles/forms.css";

export default function Host() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmUsername, setConfirmUsername] = useState("");
	const navigate = useNavigate();
	const [hostHover, setHostHover] = useState(false);
	const percentage = 25;

	const handleHost = (e: any) => {
		e.preventDefault();
		if (!username.trim() || !password.trim()) {
			alert("Email and password are required.");
			return;
		}
		if (!confirmUsername.trim()) {
			alert("Email needs to be confirmed");
			return;
		}

		if (username != confirmUsername) {
			alert("Email's do not match");
			return;
		}

		// Just navigate, no group created here
		navigate("/setExpirationDate", {
			state: {
				username,
				password,
			},
		});
	};

	return (
		<main className="form-main">
			<div>

				<div className="login-box">
					<h1 className="form-title">Host a Group</h1>
					<p>Enter your email and password to create a group.</p>
					<p className="">
						<strong>
							Note: Remember your information to access the group later.
						</strong>
					</p>
					< br />
					<form onSubmit={handleHost}>
						<div className="mb-3">
							<label htmlFor="username" className="form-label">
								Email <span className="text-danger">*<br /></span>
							</label>
							<input
								type="email"
								id="username"
								name="username"
								autoComplete="email"
								className="form-control"
								placeholder="Enter your email"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
							/>
						</div>
						< br />
						<div className="mb-3">
							<label htmlFor="confirmUsername" className="form-label">
								Confirm Email <span className="text-danger">*<br /></span>
							</label>
							<input
								type="email"
								id="confirmUsername"
								name="confirmUsername"
								className="form-control"
								autoComplete="off"
								placeholder="Enter your email again to confirm"
								value={confirmUsername}
								onChange={(e) => setConfirmUsername(e.target.value)}
								required
							/>
						</div>
						< br />
						<div className="mb-4">
							<label htmlFor="password" className="form-label">
								Password <span className="text-danger">*<br /></span>
							</label>
							<input
								type="password"
								id="password"
								className="form-control"
								placeholder="Create a password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						< br />
						<div className="d-grid">
							<button
								type="submit"
								className="btn btn-secondary btn-lg"
								style={{
									backgroundColor: hostHover
										? "#153443"
										: "#1C495E",
									color: "#fff",
									transition: "background 0.2s, border-color 0.2s",
									fontFamily: "DMSans"
								}}
								onMouseEnter={() => setHostHover(true)}
								onMouseLeave={() => setHostHover(false)}
							>
								Continue
							</button>
						</div>
					</form>
				</div>

				<br /><br /><br />

			</div>
		</main>
	);
}
