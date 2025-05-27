// // import 'bootstrap/dist/css/bootstrap.min.css';
// // import React from 'react';

// // export default function Home(){
// //     return(
// //     <main className="container my-4 flex-grow-1 d-flex flex-column">
// //       <h1 className="d-flex justify-content-center">Welcome to Funeral Memories</h1>
// //       <button className="btn btn-primary mt"> <a href="/instructions" className="text-white text-decoration-none">Click here if you're new! (instructions)</a></button>
// //       <br/><br/>
// //       <form method="get" action="/wall">
// //         <div className="mb-3">
// //           <label for="name" className="form-label">Name:</label>
// //           <input type="text" id="name" className="form-control" placeholder="Name" required/>
// //         </div>
// //         <div className="mb-3">
// //           <input type="text" className="form-control" placeholder="XXXX" required/>
// //           <button type="submit" className="btn btn-primary mt-2">Join</button>
// //         </div>
// //       </form>
// //       <button type="submit" className="btn btn-secondary"><a href="/find-relative" className="text-white text-decoration-none">Host</a></button>
// //     </main>
// //     );
// // }

// import "bootstrap/dist/css/bootstrap.min.css";
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function Home() {
// 	const [groupId, setGroupId] = useState("");
// 	const navigate = useNavigate();

// 	const handleJoin = (event) => {
// 		event.preventDefault();
// 		if (groupId.trim()) {
// 			navigate(`/join`);
// 			//navigate(`/wall?groupId=${groupId}`);
// 		}
// 	};

// 	const handleHost = () => {
// 		const newGroupId = Math.random().toString(36).substring(2, 8); // Generate random group ID
// 		navigate(`/host`);
// 		//navigate(`/wall?groupId=${newGroupId}`);
// 	};

// 	return (
// 		<main className="container my-4 flex-grow-1 d-flex flex-column">
// 			<h1 className="d-flex justify-content-center">
// 				Welcome to Funeral Memories
// 			</h1>
// 			<button className="btn btn-primary">
// 				<a href="/instructions" className="text-white text-decoration-none">
// 					Click here if you're new! (instructions)
// 				</a>
// 			</button>
// 			<br />
// 			<br />
// 			<form onSubmit={handleJoin}>
// 				<div className="mb-3">
// 					<label htmlFor="group-id" className="form-label">
// 						Enter Group ID:
// 					</label>
// 					<input
// 						type="text"
// 						id="group-id"
// 						className="form-control"
// 						placeholder="XXXX"
// 						value={groupId}
// 						onChange={(e) => setGroupId(e.target.value)}
// 						required
// 					/>
// 					<button type="submit" className="btn btn-primary mt-2">
// 						Join Group
// 					</button>
// 				</div>
// 			</form>
// 			<button onClick={handleHost} className="btn btn-secondary">
// 				Host a New Group
// 			</button>
// 		</main>
// 	);
// }

import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="container my-4 flex-grow-1 d-flex flex-column justify-content-center align-items-center">
      <h1
        className="mb-5 text-center"
        style={{ fontFamily: "Merriweather, serif", fontWeight: 500 }}
      >
        Welcome to Funeral Memories!
      </h1>

      <div className="row w-100" style={{ maxWidth: "800px" }}>
        <div className="col-12 col-md-6 mb-3 mb-md-0">
          <button
            className="btn btn-primary w-100"
            style={{ height: "200px", fontSize: "1.5rem" }}
            onClick={() => navigate("/roleSelect")}
          >
            Join a Group
          </button>
        </div>
        <div className="col-12 col-md-6">
          <button
            className="btn btn-secondary w-100"
            style={{ height: "200px", fontSize: "1.5rem" }}
            onClick={() => navigate("/host")}
          >
            Host a New Group
          </button>
        </div>
      </div>
    </main>
  );
}
