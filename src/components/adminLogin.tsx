import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FuneralMemoryService } from "../service/FuneralMemoryService";
import PasswordField from "./PasswordField";
import "../styles/forms.css";

export default function AdminLogin({ embedded = false }: { embedded?: boolean }) {
  const [groupId, setGroupId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [joinHover, setJoinHover] = useState(false);
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
      const res = await service.login({ groupId, username, password, sessionId });

      if (!res || !res.sessionId) {
        const message = (res as any)?.message;
        setError(message || "Invalid login credentials.");
        return;
      }

      const group = await service.getGroup(groupId);
      if (!group) {
        setError("Group not found after login.");
        return;
      }

      navigate("/wall", { state: { madeGroup: group, isAdmin: true } });
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  const Wrapper: any = embedded ? "div" : "main";

  return (
    <Wrapper
      className={
        embedded
          ? ""
          : "form-main"
      }
    >
      <div className="login-box">
        <h2 className="form-title">
          Admin Login
        </h2>

        {error && <div className="alert alert-danger text-center py-2">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Group ID</label>
			<br />
            <input style={{ fontFamily: "DMSans", width:"100%", paddingTop:"8px", paddingBottom:"8px", paddingLeft:"12px", borderRadius:"5px", border:"1px solid #ccc" }}
              type="text"
              className="form-control"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value.toLowerCase())}
              placeholder="e.g., abc123"
              required
            />
          </div>
	  	  <br />
          <div className="mb-3">
            <label className="form-label">Admin Email</label>
			<br />
            <input style={{ fontFamily: "DMSans", width:"100%", paddingTop:"8px", paddingBottom:"8px", paddingLeft:"12px", borderRadius:"5px", border:"1px solid #ccc" }}
              type="email"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin email"
              required
            />
          </div>
	  	  < br />
          <div className="mb-3">
            <label htmlFor="admin-login-password" className="form-label">Password</label>
			<br />
            <PasswordField
              id="admin-login-password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              inputStyle={{
                fontFamily: "DMSans",
                width: "100%",
                paddingTop: "8px",
                paddingBottom: "8px",
                paddingLeft: "12px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div className="d-grid mt-4">
			<br />
            <button
				type="submit"
				className="btn btn-secondary btn-lg"
				style={{
                    backgroundColor: joinHover
                        ? "#153443"
                        : "#1C495E",
                    color: "#FFFFF0",
                    transition: "background 0.2s, border-color 0.2s",
                    }}
				    onMouseEnter={() => setJoinHover(true)}
                	onMouseLeave={() => setJoinHover(false)}
                    disabled={isLoading}
			>
              Login as Admin
            </button>
          </div>
        </form>
      </div>
    </Wrapper>
  );
}
