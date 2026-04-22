import { useState } from "react";
import Join from "./Join";
import AdminLogin from "./adminLogin";
import "../styles/roleSelect.css";

type OverlayMode = "none" | "guest" | "admin";

export default function RoleSelect() {
  const [mode, setMode] = useState<OverlayMode>("guest");

  return (
    <main className="role-select-main">
      {/* LEFT HALF */}
      <section className="leftPanel">
        <h1 className="roleTitle">Choose Your Role</h1>

        <div className="button-container">
          <button
            className={`join-guest-button ${mode === "guest" ? "role-active" : "role-inactive"}`}
            onClick={() => setMode("guest")}
          >
            <h5>Join as Guest</h5>
            <p>View &amp; Share Memories</p>
          </button>

          <button
            className={`join-admin-button ${mode === "admin" ? "role-active" : "role-inactive"}`}
            onClick={() => setMode("admin")}
          >
            <h5>Join as Admin</h5>
          </button>

        </div>
      </section>

	  <div className="verticalLine"></div>

      {/* RIGHT HALF */}
      <aside className={`rightPanel ${mode !== "none" ? "open" : ""}`}>
        <div className="overlayInner">
          {mode === "guest" && <Join embedded />}
          {mode === "admin" && <AdminLogin embedded />}
        </div>
      </aside>
    </main>
  );
}
