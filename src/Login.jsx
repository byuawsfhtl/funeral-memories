import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';

export default function Login(){

    function testAPI(){
        const url = "https://ident.familysearch.org/cis-web/oauth2/v3/authorization";
        fetch(url)
            .then((x) => x.json())
            .then((response) => {
                // document.querySelector("pre").textContent = JSON.stringify(
                // response.value,
                // null,
                // "  "
                // );
                alert(JSON.stringify(response))
            });
    }

    return(
        <main>
            <Button onClick={testAPI()}>test</Button>
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