import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FuneralMemoryService } from "../service/FuneralMemoryService";

export const signin = (redirectPath = "/find-relative") => {
   const redirectUri = `${window.location.origin}${location.pathname}`;
  window.location.href = `https://auth.fhtl.org?redirect=${redirectUri}`;
};

//TODO:: FIX THIS AND GET IT WHITELISTED ON AUTH>FHTL>ORG





export default function Host() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();
	const service = new FuneralMemoryService();

	const handleHost = (e: any) => {
  e.preventDefault();
  signin("/find-relative"); // redirect to FS login, then come back to this path
};

	return (
		<main
			className="d-flex justify-content-center align-items-center flex-column"
			style={{ minHeight: "100vh", padding: "2rem" }}
		>
			<div style={{ width: "100%", maxWidth: "500px" }}>
				<h1
					className="text-center mb-3"
					style={{ fontFamily: "Merriweather, serif", fontWeight: 500 }}
				>
					Host a Group
				</h1>

				 <p className="text-muted text-center mb-4">
        Sign in with FamilySearch to continue.
      </p>

      <form onSubmit={handleHost}>
        <div className="d-grid">
          <button type="submit" className="btn btn-primary btn-lg">
            Sign In with FamilySearch
          </button>
        </div>
      </form>
			</div>
		</main>
	);
}
