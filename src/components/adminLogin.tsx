import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FuneralMemoryService } from "../../api/service/FuneralMemoryService";
//import { compareSync } from "bcrypt";

export default function AdminLogin() {
  const [groupId, setGroupId] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const service = new FuneralMemoryService();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setError("");

    if (!groupId.trim() || !username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    const sessionId = localStorage.getItem("sessionId") || crypto.randomUUID();
    localStorage.setItem("sessionId", sessionId);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, username, password, sessionId }),
      });

      if (!res.ok) {
        const message = await res.text();
        setError(message || "Invalid login credentials.");
        return;
      }

      // ✅ Login succeeded, now fetch group data
      const group = await service.getGroup(groupId);
      if (!group) {
        setError("Group not found after login.");
        return;
      }

      navigate("/wall", {
        state: { madeGroup: group, isAdmin: true },
      });
    } catch (err) {
      if (err instanceof Error) {
        console.error("Login error:", err.message);
      } else {
        console.error("Login error:", err);
      }
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <main
      className="d-flex justify-content-center align-items-center flex-column container my-5"
      style={{ minHeight: "80vh" }}
    >
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <h2
          className="text-center mb-4"
          style={{ fontFamily: "Merriweather, serif", fontWeight: 500 }}
        >
          Admin Login
        </h2>

        {error && (
          <div className="alert alert-danger text-center py-2">{error}</div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Group ID</label>
            <input
              type="text"
              className="form-control"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              placeholder="e.g., abc123"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Admin Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <div className="d-grid mt-4">
            <button type="submit" className="btn btn-primary">
              Login as Admin
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
