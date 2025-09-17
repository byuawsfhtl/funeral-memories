import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { ProgressBar } from "react-step-progress-bar";

export default function PersonSelect() {
	const navigate = useNavigate();
	const [hostHover, setHostHover] = useState(false);
	const location = useLocation();
	const expirationDateTime = location.state?.expirationDateTime || {};
	const username = location.state?.username || {};
	const password = location.state?.password || {};
	const percentage = 75;

	console.log(
		"expireDate username and Pass: ",
		username,
		password,
		expirationDateTime
	);

	return (
		<main className="container my-4 flex-grow-1 d-flex flex-column justify-content-center align-items-center">
			<div style={{ width: "100%", maxWidth: "500px", marginBottom: "15px" }}>
				<small
					className="text-muted align-items-center"
					style={{
						display: "block",
						textAlign: "center",
						marginBottom: "8px",
					}}
				>
					Progress toward creating your memory wall
				</small>
				<ProgressBar
					percent={percentage}
					filledBackground="linear-gradient(to right, #fefb72, #f0bb31)"
					text={`${percentage}%`}
				/>
			</div>
			<h1
				className="mb-5 text-center"
				style={{ fontFamily: "Merriweather, serif", fontWeight: 500 }}
			>
				Select A Relative
			</h1>

			<div className="row w-100" style={{ maxWidth: "800px" }}>
				<div className="col-12 col-md-6 mb-3 mb-md-0">
					<button
						className="btn btn-primary w-100"
						style={{ height: "200px", fontSize: "1.5rem" }}
						onClick={() =>
							navigate("/find-relative", {
								state: {
									username,
									password,
									expirationDateTime: new Date(
										expirationDateTime
									).toISOString(),
								},
							})
						}
					>
						🔍 Find through FamilySearch
					</button>
				</div>
				<div className="col-12 col-md-6">
					<button
						className="btn btn-secondary w-100 custom-host-btn"
						style={{
							height: "200px",
							fontSize: "1.5rem",
							backgroundColor: hostHover
								? "rgb(8, 82, 75)"
								: "rgb(13, 106, 95)",
							borderColor: hostHover ? "rgb(8, 82, 75)" : "rgb(13, 106, 95)",
							color: "#fff",
							transition: "background 0.2s, border-color 0.2s",
						}}
						onClick={() =>
							navigate("/addPerson", {
								state: {
									username,
									password,
									expirationDateTime: new Date(
										expirationDateTime
									).toISOString(),
								},
							})
						}
						onMouseEnter={() => setHostHover(true)}
						onMouseLeave={() => setHostHover(false)}
					>
						✍️ Add Person Manually
					</button>
				</div>
			</div>
		</main>
	);
}
