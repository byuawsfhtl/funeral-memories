import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { ProgressBar } from "react-step-progress-bar";
import "react-circular-progressbar/dist/styles.css";

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
    <main
      className="d-flex flex-grow-1 justify-content-center align-items-center flex-column"
      style={{ padding: "2rem" }}
    >
      <div style={{ width: "100%", maxWidth: "500px" }}>
        <small
          className="text-muted align-items-center"
          style={{ display: "block", textAlign: "center", marginBottom: "8px" }}
        >
          Progress toward creating your memory wall
        </small>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ marginBottom: "10px", width: 500, height: 20 }}>
            {" "}
            <ProgressBar
              percent={percentage}
              filledBackground="linear-gradient(to right, #fefb72, #f0bb31)"
              text={`${percentage}%`} // This shows the percent text inside the progress bar
            />
          </div>
        </div>
        <h1
          className="text-center mb-3"
          style={{ fontFamily: "Merriweather, serif", fontWeight: 500 }}
        >
          Host a Group
        </h1>
        <p className="text-muted text-center mb-4">
          Enter your email and password to create a group.
        </p>
        <p className="text-danger text-center mb-4">
          <strong>
            Note: Remember your information to access the group later.
          </strong>
        </p>
        <form onSubmit={handleHost}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Email<span className="text-danger">*</span>
            </label>
            <input
              type="email"
              id="username"
              className="form-control"
              placeholder="Enter your email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="confirmUsername" className="form-label">
              Confirm Email<span className="text-danger">*</span>
            </label>
            <input
              type="confirmEmail"
              id="confirmUsername"
              className="form-control"
              placeholder="Enter your email again to confirm"
              value={confirmUsername}
              onChange={(e) => setConfirmUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label">
              Password<span className="text-danger">*</span>
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

          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-secondary btn-lg"
              style={{
                backgroundColor: hostHover
                  ? "rgb(8, 82, 75)"
                  : "rgb(13, 106, 95)",
                borderColor: hostHover ? "rgb(8, 82, 75)" : "rgb(13, 106, 95)",
                color: "#fff",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={() => setHostHover(true)}
              onMouseLeave={() => setHostHover(false)}
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
