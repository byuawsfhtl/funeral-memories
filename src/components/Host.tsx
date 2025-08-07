import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function Host() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [hostHover, setHostHover] = useState(false);
  const percentage = 25;

  const handleHost = (e: any) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      alert("Username and password are required.");
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
      className="d-flex justify-content-center align-items-center flex-column"
      style={{ minHeight: "100vh", padding: "2rem" }}
    >
      <div style={{ width: "100%", maxWidth: "500px" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ width: 100, height: 100 }}>
            <CircularProgressbar value={percentage} text={`${percentage}%`} />;
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
