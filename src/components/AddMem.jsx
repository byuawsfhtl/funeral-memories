import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddMem(){
    const navigate = useNavigate();
    const [memory, setMemory] = useState("");

    const handleClick = () => {
      if(memory !== ""){
        fetch('/api/memory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({memory})
        }).then((res) => {
            if(res.status === 201){
                navigate('/wall');
            }
        }).catch((err) => {
            console.log(err);
        });
      }
    }

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
      
      <form className="mb-3 w-100" style={{maxWidth: "500px"}} onSubmit={handleClick}>
        <input type="text" className="form-control" value={memory} placeholder="Type memory here" onChange={(e) => setMemory(e.target.value)}/>
      </form>
      
      <button className="btn btn-primary" onClick={handleClick}>Pin to Memory Wall</button>
    </main>
    );
}