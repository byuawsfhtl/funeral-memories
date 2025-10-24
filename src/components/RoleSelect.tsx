import { useNavigate } from "react-router-dom";

export default function RoleSelect() {
	const navigate = useNavigate();

	return (
		<main
			className="d-flex justify-content-center align-items-center flex-column container my-5"
			style={{ flexGrow: 1 }}
		>
			<div className="w-100" style={{ maxWidth: "400px" }}>
				<h1 className="text-center mb-4" style={{ fontFamily: "var(--font-serif)", fontWeight: 500 }}>
					Choose Your Role
				</h1>

				<div className="d-grid gap-3 mt-4">
					<button className="btn btn-primary" onClick={() => navigate("/join")}>
						Join as Guest
					</button>
					<button
						className="btn btn-outline-primary"
						onClick={() => navigate("/admin")}
					>
						Join as Admin
					</button>
				</div>
			</div>
		</main>
	);
}
