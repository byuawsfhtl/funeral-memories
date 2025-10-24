import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Home() {
	const navigate = useNavigate();
	const [hostHover, setHostHover] = useState(false);

	return (
		<main className="container my-4 flex-grow-1 d-flex flex-column justify-content-center align-items-center">
			<h1 className="mb-5 text-center" style={{ fontFamily: "var(--font-serif)", fontWeight: 500 }}>
				Welcome to Funeral Memories!
			</h1>

			<div className="row w-100" style={{ maxWidth: "800px" }}>
				<div className="d-grid mb-4 pt-3">
					<a href="/instructions" className="btn btn-primary">
						Click here if you're new! (Instructions)
					</a>
				</div>
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
						className="btn btn-secondary w-100"
						style={{
							height: "200px",
							fontSize: "1.5rem",
							backgroundColor: hostHover ? "var(--color-primary-hover)" : "var(--color-primary)",
							borderColor: hostHover ? "var(--color-primary-hover)" : "var(--color-primary)",
							color: "var(--color-white)",
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
