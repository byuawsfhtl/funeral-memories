import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-step-progress-bar/styles.css";
import { ProgressBar } from "react-step-progress-bar";
import "react-circular-progressbar/dist/styles.css";

export default function SetExpireDate() {
  const [expirationDateTime, setExpirationDateTime] = useState("");
  const [error, setError] = useState("");
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

    navigate("/find-relative", {
      state: {
        username,
        password,
        expirationDateTime: new Date(expirationDateTime).toISOString(),
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
      className="container d-flex justify-content-center align-items-center flex-column"
      style={{
        display: "flex",
        flexDirection: "column", // keep label above bar
        alignItems: "center", // horizontal center
        justifyContent: "center", // vertical center
        maxHeight: "100vh", // center horizontallH
      }} // optional padding
    >
      <div
        className="w-100"
        style={{
          maxWidth: 400,
          display: "flex",
          flexDirection: "column", // keep label above bar
          alignItems: "center", // horizontal center
          justifyContent: "center",
        }}
      >
        <small
          className="text-muted align-items-center"
          style={{ display: "block", textAlign: "center", marginBottom: "8px" }}
        >
          Progress toward creating your memory wall
        </small>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ marginBottom: "10px", width: "100%", height: 20 }}>
            {" "}
            <ProgressBar
              percent={percentage}
              filledBackground="linear-gradient(to right, #fefb72, #f0bb31)"
              text={`${percentage}%`} // This shows the percent text inside the progress bar
            />
          </div>
        </div>

        <h2
          className="text-center mb-4"
          style={{ fontFamily: "Merriweather, serif", fontWeight: 500 }}
        >
          Set Group Expiration Date
        </h2>
        <p className="text-muted text-center mb-4">
          Please enter a date and time for when you want this group to expire.
        </p>
        <p className="text-danger text-center mb-4">
          <strong>
            {" "}
            Note: The expiration date must be within one month from today and a
            minimum of 2 hours from the current time.
          </strong>
        </p>
        {error && (
          <div className="alert alert-danger text-center py-2">{error}</div>
        )}
        <form onSubmit={handleSetExpiration}>
          <div className="mb-3">
            <label className="form-label"> Group Expiration Date & Time</label>
            <input
              type="datetime-local"
              className="form-control"
              value={expirationDateTime}
              onChange={(e) => setExpirationDateTime(e.target.value)}
              required
              min={minDateStr}
              max={maxDateStr}
            />
          </div>
          <div className="d-grid mt-4">
            <button type="submit" className="btn btn-primary">
              Set Expiration & Continue
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
