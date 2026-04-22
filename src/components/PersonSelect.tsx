import { useNavigate, useLocation } from "react-router-dom";
import { ProgressBar } from "react-step-progress-bar";
import "../styles/forms.css";

export default function PersonSelect() {
	const navigate = useNavigate();
	const location = useLocation();
	const expirationDateTime = location.state?.expirationDateTime || {};
	const username = location.state?.username || {};
	const password = location.state?.password || {};
	const percentage = 75;

	console.log(
		"expireDate username and Pass: ",
		username,
		password,
		expirationDateTime,
	);

	return (
		<main className="form-main">
			<div className="login-box person-select-box">
				<h1 className="form-title text-center">Select A Relative</h1>
				<br />
				<div className="person-select-actions">
					<div>
						<button
							className="btn btn-secondary person-select-action"
							style={{
								backgroundColor: "#1C495E",
								borderColor: "#1C495E",
								color: "#FFFFF0",
								fontFamily: "DMSans",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: "6px",
								fontSize: "1.1rem",
							}}
							onClick={() =>
								navigate("/find-relative", {
									state: {
										username,
										password,
										expirationDateTime: new Date(
											expirationDateTime,
										).toISOString(),
									},
								})
							}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 256 256"
							>
								<path
									fill="#FFFFF0"
									d="M232.49 215.51L185 168a92.12 92.12 0 1 0-17 17l47.53 47.54a12 12 0 0 0 17-17ZM44 112a68 68 0 1 1 68 68a68.07 68.07 0 0 1-68-68"
								/>
							</svg>
							Find through FamilySearch
						</button>
					</div>

					<p className="person-select-divider">or</p>

					<div>
						<button
							className="btn btn-secondary person-select-action"
							style={{
								backgroundColor: "#1C495E",
								borderColor: "#1C495E",
								color: "#FFFFF0",
								fontFamily: "DMSans",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: "6px",
								fontSize: "1.1rem",
							}}
							onClick={() =>
								navigate("/addPerson", {
									state: {
										username,
										password,
										expirationDateTime: new Date(
											expirationDateTime,
										).toISOString(),
									},
								})
							}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="-2 -2 24 24"
							>
								<path
									fill="#fffff0"
									d="m5.72 14.456l1.761-.508l10.603-10.73a.456.456 0 0 0-.003-.64l-.635-.642a.443.443 0 0 0-.632-.003L6.239 12.635zM18.703.664l.635.643c.876.887.884 2.318.016 3.196L8.428 15.561l-3.764 1.084a.9.9 0 0 1-1.11-.623a.9.9 0 0 1-.002-.506l1.095-3.84L15.544.647a2.215 2.215 0 0 1 3.159.016zM7.184 1.817c.496 0 .898.407.898.909a.903.903 0 0 1-.898.909H3.592c-.992 0-1.796.814-1.796 1.817v10.906c0 1.004.804 1.818 1.796 1.818h10.776c.992 0 1.797-.814 1.797-1.818v-3.635c0-.502.402-.909.898-.909s.898.407.898.91v3.634c0 2.008-1.609 3.636-3.593 3.636H3.592C1.608 19.994 0 18.366 0 16.358V5.452c0-2.007 1.608-3.635 3.592-3.635z"
									stroke-width="0.5"
									stroke="#fffff0"
								/>
							</svg>
							Add Person Manually
						</button>
					</div>
				</div>
			</div>
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
			<br />
		</main>
	);
}
