import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';

export default function Login(){
    return(
        <main>
            <form method="get" action="chat.html">
                <div>
                    <span>Email:</span>
                    <input type="email" placeholder="your@email.com" required/>
                </div>
                <div>
                    <span>Password: </span>
                    <input type="password" placeholder="password" />
                </div>
                <button type="submit">Login</button>
                <button type="submit">Register</button>
            </form>
        </main>
    );
}