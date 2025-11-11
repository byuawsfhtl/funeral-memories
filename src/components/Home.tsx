import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/home.css";
import { main } from "@popperjs/core";

export default function Home() {
	const navigate = useNavigate();
	const [hostHover, setHostHover] = useState(false);

	return (

		// <main>
		// 	<h1 className="mb-5 text-center" style={{ fontFamily: "var(--font-serif)", fontWeight: 500 }}>
		// 		Welcome to Funeral Memories!
		// 	</h1>

		// 	<div className="row w-100" style={{ maxWidth: "800px" }}>
		// 		<div className="d-grid mb-4 pt-3">
		// 			<a href="/instructions" className="btn btn-primary">
		// 				Click here if you're new! (Instructions)
		// 			</a>
		// 		</div>
		// 		<div className="col-12 col-md-6 mb-3 mb-md-0">
		// 			<button
		// 				className="btn btn-primary w-100"
		// 				style={{ height: "200px", fontSize: "1.5rem" }}
		// 				onClick={() => navigate("/roleSelect")}
		// 			>
		// 				Join a Group
		// 			</button>
		// 		</div>
		// 		<div className="col-12 col-md-6">
		// 			<button
		// 				className="btn btn-secondary w-100"
		// 				style={{
		// 					height: "200px",
		// 					fontSize: "1.5rem",
		// 					backgroundColor: hostHover ? "var(--color-primary-hover)" : "var(--color-primary)",
		// 					borderColor: hostHover ? "var(--color-primary-hover)" : "var(--color-primary)",
		// 					color: "var(--color-white)",
		// 				}}
		// 				onClick={() => navigate("/host")}
		// 				onMouseEnter={() => setHostHover(true)}
		// 				onMouseLeave={() => setHostHover(false)}
		// 			>
		// 				Host a New Group
		// 			</button>
		// 		</div>
		// 	</div>
		// </main>

		<main>
			<div className="hero">
				<div className="hero-left">
					<p className="tagline">Share and honor the memories of your loved ones</p>
					<button className="new-button"><a href="/instructions">New? Click here to get started!</a></button>
				</div>
				<div className="hero-right">
					<button className="join-button" onClick={() => navigate("/roleSelect")}>
						Join a Group
					</button>
					<button className="new-g-button" onClick={() => navigate("/roleSelect")}>
						Host a New Group
					</button>
				</div>
			</div>
		</main>
	);
}
