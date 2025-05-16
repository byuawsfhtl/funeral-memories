import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Confirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const person = location.state?.person;

  if (!person) {
    return (
      <div className="container text-center">
        <h2>No person data provided</h2>
        <button className="btn btn-secondary mt-3" onClick={() => navigate('/find-relative')}>
          Find Your Relative
        </button>
      </div>
    );
  }

  const birthYear = person.birthDate ? new Date(person.birthDate).getUTCFullYear() : "";
  const portraitUrl = `https://api.familysearch.org/platform/tree/persons/${person.id}/portrait?default=https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png&access_token=${sessionStorage.getItem("yourKey")}`;

  return (
    <main className="container d-flex justify-content-center align-items-center flex-grow-1">
      <div className="text-center">
        <h1>Is this the family member you are looking for?</h1>
        <img src={portraitUrl} style={{ height: "100px" }} alt="Person Portrait" />
        <h2>{person.name}</h2>
        <div className="d-flex flex-row justify-content-center align-items-center">
          <p>Born {birthYear} - {person.birthPlace}</p>
        </div>
        <p>This information was found using FamilySearch records. If this looks like the correct person, click "Yes" to continue or "No" to go back.</p>
        <button className="btn btn-primary me-2" onClick={() => navigate('/wall', {state: {groupId: location.state?.groupId, username: location.state?.username, password: location.state?.password, person: location.state?.person,},})}>Yes</button>
        <button className="btn btn-secondary" onClick={() => navigate('/find-relative', {state: { formData: location.state?.formData, ancestors: location.state?.ancestors}})}>No</button>
      </div>
    </main>
  );
}
