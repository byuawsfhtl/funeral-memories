import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { useNavigate } from 'react-router-dom'

export default function AddMem(){
    const navigate = useNavigate();
    return(
    <main className="container d-flex flex-column justify-content-center align-items-center flex-grow-1 py-5" >
      <h1 className="mb-4">What is your memory of John Smith?</h1>
      {/* <div className="d-flex flex-column align-items-center mb-4">
        <button className="btn btn-light mb-3 p-0" style={{height: "250px", width: "250px", border: "1px solid #ced4da", display: "flex", alignItems: "center", justifyContent: "center"}}>
          <img src="./placeholder_img/camera.png" alt="add photo" style={{height: "50px", opacity: "0.65"}} />
        </button>
        <button className="btn btn-light p-2" style={{border: "1px solid #ced4da"}}>
          <img src="./placeholder_img/Speaker_Icon.svg.png" alt="add audio" style={{height: "25px", opacity: "0.65"}} />
        </button>
      </div> */}
      
      <div className="mb-3 w-100" style={{maxWidth: "500px"}}>
        <input type="text" className="form-control" placeholder="Type memory here" />
      </div>
      
      <button className="btn btn-primary" onClick={() => navigate('/wall')}>Pin to Memory Wall</button>
    </main>
    );
}