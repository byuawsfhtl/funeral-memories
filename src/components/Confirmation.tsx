import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FuneralMemoryService } from "../service/FuneralMemoryService";

export default function Confirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const person = location.state?.person;
  const username = location.state?.username;
  const password = location.state?.password;
  const formData = location.state?.formData;
  const ancestors = location.state?.ancestors;
  const service = new FuneralMemoryService();
  const [loading, setLoading] = useState(false); // 🆕 loading state

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
    setLoading(true); // show overlay
    const accessToken = sessionStorage.getItem("yourKey");
    const portraitUrl = `https://api.familysearch.org/platform/tree/persons/${
      person.id
    }/portrait?default=https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png&access_token=${sessionStorage.getItem(
      "yourKey"
    )}`;

    let portraitBase64 = null;
    try {
      const response = await fetch(
        `/api/fetchPortrait?portraitUrl=${encodeURIComponent(portraitUrl)}`
      );
      const data = await response.json();
      portraitBase64 = data.base64;
    } catch (err) {
      console.warn("Failed to fetch portrait:", err);
    }

    try {
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

      navigate("/wall", { state: { madeGroup } });
      localStorage.setItem("madeGroup", JSON.stringify(madeGroup));
    } catch (err) {
      console.error("Error during confirmation:", err);
      alert("Something went wrong. Could not confirm group setup.");
    } finally {
      setLoading(false); // hide overlay after navigation fails
    }
  };

  return (
    <>
      {/*Fullscreen loading overlay */}
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            zIndex: 9999,
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

      <main className="container d-flex justify-content-center align-items-center flex-grow-1">
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

          <div className="d-flex flex-row justify-content-center align-items-center">
            <p>
              Born {birthYear} - {person.birthPlace}
            </p>
          </div>
          <p>
            This information was found using FamilySearch records. If this looks
            like the correct person, click "Yes" to continue or "No" to go back.
          </p>
          <button
            className="btn btn-primary me-2"
            onClick={handleConfirm}
            disabled={loading}
          >
            Yes
          </button>
          <button
            className="btn btn-secondary"
            onClick={() =>
              navigate("/find-relative", {
                state: { formData, ancestors, username, password },
              })
            }
            disabled={loading}
          >
            No
          </button>
        </div>
      </main>
    </>
  );
}
