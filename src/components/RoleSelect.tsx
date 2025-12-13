import { useNavigate } from "react-router-dom";
import "../styles/roleSelect.css";

export default function RoleSelect() {
	const navigate = useNavigate();

	return (
		<main className="role-select-main">
				<h1>Choose Your Role</h1>

				<div className="button-container">
					<button className="join-guest-button"
						onClick={() => navigate("/join")}>
						<h5>Join as Guest</h5>
						<p>View & Share Memories</p>
					</button>
					<button className="join-admin-button"
						onClick={() => navigate("/admin")}>
						<h5>Join as Admin</h5>
					</button>
				</div>
		</main>
	);
}
