import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Host() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleHost = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      alert("Username and password are required.");
      return;
    }

    const newGroupId = Math.random().toString(36).substring(2, 8);
    const storedHosts = JSON.parse(localStorage.getItem("hostCredentials")) || {};
    storedHosts[newGroupId] = { username, password };
    localStorage.setItem("hostCredentials", JSON.stringify(storedHosts));

    console.log("Created new group:", newGroupId);
    navigate("/find-relative", {
      state: {
        groupId: newGroupId,
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
        <h1
          className="text-center mb-3"
          style={{ fontFamily: "Merriweather, serif", fontWeight: 500 }}
        >
          Host a Group
        </h1>

        <p className="text-muted text-center mb-4">
          Enter a username and password to create a group and continue to select a relative.
        </p>

        <form onSubmit={handleHost}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username<span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="username"
              className="form-control"
              placeholder="Create a username"
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
            <button type="submit" className="btn btn-secondary btn-lg">
              Host and Continue to Select Relative
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
