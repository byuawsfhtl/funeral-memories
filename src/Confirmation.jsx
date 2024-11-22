import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { useNavigate } from 'react-router-dom'

export default function Confirmation(){
    const navigate = useNavigate();
    return(
    <main className="container d-flex justify-content-center align-items-center flex-grow-1">
      <div className="text-center">
        <h1>Is this the family member you are looking for?</h1>
        <img src="./placeholder_img/person_icon.png" style={{height: "100px"}} alt="Person Icon"/>
        <h2>John Smith</h2>
        <div className="d-flex flex-row justify-content-center align-items-center">
          <p>Born 1950 - Massachusetts</p>
        </div>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
          nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in 
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla 
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
          culpa qui officia deserunt mollit anim id est laborum.</p>
        <button className="btn btn-primary me-2" onClick={() => navigate('/wall')}>Yes</button>
        <button className="btn btn-secondary" onClick={() => navigate('/instructions')}>No</button>
      </div>
    </main>
    );
}