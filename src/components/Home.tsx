import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";

export default function Home() {
	const navigate = useNavigate();
	const [hostHover, setHostHover] = useState(false);

	return (
		<main className="container my-4 flex-grow-1 d-flex flex-column justify-content-center align-items-center">
			<h1
				className="mb-5 text-center"
				style={{ fontFamily: "Merriweather, serif", fontWeight: 500 }}
			>
				Welcome to Funeral Memories!
			</h1>

			<div className="d-grid mb-4 pt-3">
				<a href="/instructions" className="btn btn-primary">
					Click here if you're new! (Instructions)
				</a>
			</div>
			<div className="row w-100" style={{ maxWidth: "800px" }}>
				<div className="col-12 col-md-6 mb-3 mb-md-0">
					<button
						className="btn btn-primary w-100"
						style={{ height: "200px", fontSize: "1.5rem" }}
						onClick={() => navigate("/roleSelect")}
					>
						Join a Group
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
						onClick={() => navigate("/host")}
						onMouseEnter={() => setHostHover(true)}
						onMouseLeave={() => setHostHover(false)}
					>
						Host a New Group
					</button>
				</div>
			</div>
		</main>
	);
}
