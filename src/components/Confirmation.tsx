import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FuneralMemoryService } from "../service/FuneralMemoryService";

type ConfirmationProps = {
  person: any;
  username: string;
  password: string;
  formData: any;
  ancestors: any[];
  personId: string;
  onClose: () => void;
};

export default function Confirmation({
  person,
  username,
  password,
  formData,
  ancestors,
  personId,
  onClose,
}: ConfirmationProps) {
  const navigate = useNavigate();
  const service = new FuneralMemoryService();
  const [loading, setLoading] = useState(false);

  if (!person) {
    return (
      <div className="container text-center">
        <h2>No person data provided</h2>
        <button
          className="btn btn-secondary mt-3"
          onClick={() => navigate("/find-relative")}
        >
          Find Your Relative
        </button>
      </div>
    );
  }

  const birthYear = person.birthDate
    ? new Date(person.birthDate).getUTCFullYear()
    : "";
  const portraitUrl = `https://api.familysearch.org/platform/tree/persons/${
    person.id
  }/portrait?default=https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png&access_token=${sessionStorage.getItem(
    "yourKey"
  )}`;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/fetchPortrait?portraitUrl=${encodeURIComponent(portraitUrl)}`
      );
      const data = await response.json();
      const portraitBase64 = data.base64;

      const group = {
        ancestor: person,
        portrait: portraitBase64,
        closed: false,
        timestamp: Date.now(),
      };
      const admin = { admin: username, password: password };

      const madeGroup = await service.addGroup(group, admin);

      const sessionId =
        localStorage.getItem("sessionId") || crypto.randomUUID();
      localStorage.setItem("sessionId", sessionId);

      console.log("Logging in admin with:", {
        groupId: madeGroup.groupId,
        username,
        password,
        sessionId,
      });

      const loginRes = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: madeGroup.groupId,
          username,
          password,
          sessionId,
        }),
      });

      if (!loginRes.ok) {
        console.error("Failed to record session as admin");
        alert("Group made, but admin session failed.");
      }

      // After confirming, navigate to wall page
      navigate("/wall", { state: { madeGroup } });
      localStorage.setItem("madeGroup", JSON.stringify(madeGroup));
    } catch (err) {
      console.error("Error during confirmation:", err);
      alert("Something went wrong. Could not confirm group setup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Fullscreen loading overlay */}
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            zIndex: 10001,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="spinner-border text-primary" role="status" />
          <h2 className="mt-3">Creating Memory Wall...</h2>
        </div>
      )}

      {/* Popup wrapper with overlay */}
      <div
        className="popup-overlay"
        onClick={onClose} // clicking outside closes popup
        role="dialog"
        aria-modal="true"
      >
        <div
          className="popup"
          onClick={(e) => e.stopPropagation()} // prevent closing on click inside popup
          tabIndex={-1}
        >
          <div className="text-center">
            <h1>Is this the family member you are looking for?</h1>
            <img
              src={portraitUrl}
              style={{ height: "100px", borderRadius: "50%" }}
              alt="Person Portrait"
            />
            <h2>
              {person.name}
              <br />
              <small style={{ fontSize: "0.6em", color: "#888" }}>
                {person.id}
              </small>
            </h2>

            <div className="d-flex flex-row justify-content-center align-items-center mb-3">
              <p>
                Born {birthYear} - {person.birthPlace}
              </p>
            </div>
            <p>
              This information was found using FamilySearch records. If this
              looks like the correct person, click "Yes" to continue or "No" to
              cancel.
            </p>
            <div className="d-flex justify-content-center gap-2 mt-3">
              <button
                className="btn btn-primary"
                onClick={handleConfirm}
                disabled={loading}
              >
                Yes
              </button>
              <button
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
