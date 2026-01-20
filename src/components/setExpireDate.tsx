import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-step-progress-bar/styles.css";
import { ProgressBar } from "react-step-progress-bar";
import "react-circular-progressbar/dist/styles.css";
import "../styles/forms.css";

export default function SetExpireDate() {
  const [expirationDateTime, setExpirationDateTime] = useState("");
  const [error, setError] = useState("");
  const [hostHover, setHostHover] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { username, password } = location.state || {};
  const percentage = 50;

  const handleSetExpiration = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!expirationDateTime.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    navigate("/personSelect", {
      state: {
        username,
        password,
        expirationDateTime: expirationDateTime,
      },
    });
  };

  // Helper to pad numbers
  const pad = (n: number) => n.toString().padStart(2, "0");

  // Build datetime string for <input type="datetime-local" />
  function toDatetimeLocalString(date: Date) {
    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      "T" +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes())
    );
  }

  const now = new Date();
  const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const minDateStr = toDatetimeLocalString(twentyFourHoursLater);
  console.log(minDateStr);

  const oneMonthLater = new Date(now);
  oneMonthLater.setHours(23, 59, 59, 999); // 11:59:59.999 PM
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
  const maxDateStr = toDatetimeLocalString(oneMonthLater);

  return (
    <main
      className="form-main"
      >
      <div>

        <div className="login-box">
                  <h2 className="form-title">
          Set Group Expiration Date
        </h2>

        <p className="text-muted text-center mb-2">
          Please enter a date and time for when you want this group to expire.
        </p>
        <p className="text-danger text-center mb-2">
          <strong>
            Note: The expiration date must be within one month from today and a
            minimum of 2 hours from the current time.
          </strong>
        </p>
        <br />
        {error && (
          <div className="alert alert-danger text-center py-2">{error}</div>
        )}

        <form onSubmit={handleSetExpiration}>
          <div >
            <label className="form-label">Group Expiration Date & Time</label>
            <br />
            <input
              type="datetime-local"
              className="form-control"
              value={expirationDateTime}
              onChange={(e) => setExpirationDateTime(e.target.value)}
              required
              min={minDateStr}
              max={maxDateStr}
              style={{width:"50%"}}
            />
          </div>
          <br />
          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-secondary btn-lg"
              style={{
							  backgroundColor: hostHover
								  ? "#153443"
								  : "#1C495E",
							  color: "#fff",
							  transition: "background 0.2s, border-color 0.2s",
                fontFamily: "DMSans"
						  }}
              onMouseEnter={() => setHostHover(true)}
							onMouseLeave={() => setHostHover(false)}
            >
              Set Expiration & Continue
            </button>
          </div>
        </form>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", width: "100%" }}>
          <div style={{ marginBottom: "100px", width: 500, height: 20 }}>
            <p style={{ textAlign: "center", marginBottom: "8px", color: "#1C495E" }}>Progress toward creating your memory wall</p>
            <ProgressBar
              percent={percentage}
              filledBackground="linear-gradient(to right, #2D5F76, #1C495E)"
              text={`${percentage}%`}
            />
        </div>
      </div>

      </div>
    </main>
  );
}
