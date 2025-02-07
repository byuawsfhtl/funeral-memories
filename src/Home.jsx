import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';

export default function Home(){
    return(
    <main className="container my-4 flex-grow-1 d-flex flex-column">
      <h1 className="d-flex justify-content-center">Welcome to Funeral Memories</h1>
      <button className="btn btn-primary mt"> <a href="/instructions" className="text-white text-decoration-none">Click here if you're new! (instructions)</a></button>
      <br/><br/>
      <form method="get" action="/wall">
        <div className="mb-3">
          <label for="name" className="form-label">Name:</label>
          <input type="text" id="name" className="form-control" placeholder="Name" required/>
        </div>
        <div className="mb-3">
          <input type="text" className="form-control" placeholder="XXXX" required/>
          <button type="submit" className="btn btn-primary mt-2">Join</button>
        </div>
      </form>
      <button type="submit" className="btn btn-secondary"><a href="/find-relative" className="text-white text-decoration-none">Host</a></button>
    </main>
    );
}