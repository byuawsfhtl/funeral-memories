import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FuneralMemoryService } from "../service/FuneralMemoryService";

export default function Confirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const person = location.state?.person;
  //const groupId = location.state?.groupId;
  const username = location.state?.username;
  const password = location.state?.password;
  const formData = location.state?.formData;
  const ancestors = location.state?.ancestors;
  const service = new FuneralMemoryService();

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
    // Generate the portrait URL
    const accessToken = sessionStorage.getItem("yourKey");
    const portraitUrl = `https://api.familysearch.org/platform/tree/persons/${person.id}/portrait?access_token=${accessToken}`;

    let portraitBase64 = null;
    try {
      const response = await fetch(
        `/api/fetchPortrait?portraitUrl=${encodeURIComponent(portraitUrl)}`
      );
      const data = await response.json();
      portraitBase64 = data.base64;
    } catch (err) {
      console.warn("Failed to fetch portrait:", err);
      portraitBase64 = null;
    }

    try {
      const group = {
        ancestor: person,
        portrait: portraitBase64,
        closed: false,
        timestamp: Date.now(),
      };
      const admin = { admin: username, password: password };

      // ✅ Update the group with selected person ID
      const madeGroup = await service.addGroup(group, admin); // or pass { personId } if supported

      // ✅ Navigate to the memory wall
      navigate("/wall", { state: { madeGroup: madeGroup } });
    } catch (err) {
      console.error("Error during confirmation:", err);
      alert("Something went wrong. Could not confirm group setup.");
    }
  };

  return (
    <main className="container d-flex justify-content-center align-items-center flex-grow-1">
      <div className="text-center">
        <h1>Is this the family member you are looking for?</h1>
        <img
          src={portraitUrl}
          style={{ height: "100px", borderRadius: "50%" }}
          alt="Person Portrait"
        />
        <h2>{person.name}</h2>
        <div className="d-flex flex-row justify-content-center align-items-center">
          <p>
            Born {birthYear} - {person.birthPlace}
          </p>
        </div>
        <p>
          This information was found using FamilySearch records. If this looks
          like the correct person, click "Yes" to continue or "No" to go back.
        </p>
        <button className="btn btn-primary me-2" onClick={handleConfirm}>
          Yes
        </button>
        <button
          className="btn btn-secondary"
          onClick={() =>
            navigate("/find-relative", {
              state: { formData, ancestors, groupId, username, password },
            })
          }
        >
          No
        </button>
      </div>
    </main>
  );
}
