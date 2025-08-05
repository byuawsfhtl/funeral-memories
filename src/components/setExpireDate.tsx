import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

export default function SetExpireDate() {
  const [expirationDateTime, setExpirationDateTime] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { username, password } = location.state || {};

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
  const minDateStr = toDatetimeLocalString(now);

  const oneMonthLater = new Date(now);
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
  const maxDateStr = toDatetimeLocalString(oneMonthLater);

  return (
    <main
      className="container my-5 d-flex justify-content-center align-items-center flex-column"
      style={{ minHeight: "80vh" }}
    >
      <div className="w-100" style={{ maxWidth: 400 }}>
        <h2
          className="text-center mb-4"
          style={{ fontFamily: "Merriweather, serif", fontWeight: 500 }}
        >
          Set Group Expiration
        </h2>
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
