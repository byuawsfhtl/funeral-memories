import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import './quote.css'

export default function Quote(){
    const [quote, setQuote] = React.useState('Loading...');
    const [quoteAuthor, setQuoteAuthor] = React.useState('unknown');

    React.useEffect(() => {
        fetch('https://quote.cs260.click')
          .then((response) => response.json())
          .then((data) => {
            setQuote(data.quote);
            setQuoteAuthor(data.author);
          })
          .catch();
      }, []);

    return(
    <main className="container d-flex flex-column justify-content-center flex-grow-1 py-5" >
      <div>

        <h1>Here is an interesting quote</h1>

        <div className='quote-box bg-light text-dark'>
          <p className='quote'>{quote}</p>
          <p className='author'>{quoteAuthor}</p>
        </div>
      </div>
    </main>
    );
}