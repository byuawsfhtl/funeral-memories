import { StrictMode } from 'react'
import React from 'react';
import { createRoot } from 'react-dom/client'
// import './index.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from './App.jsx'
import Header from './Header.jsx'
import Home from './Home.jsx';
import Login from './Login.jsx';
import Instructions from './Instructions.jsx';
import Confirmation from './Confirmation.jsx';
import Wall from './Wall.jsx';
import AddMem from './AddMem.jsx';
import Footer from './Footer.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode class="d-flex flex-column min-vh-100">
    <Router>
      <Header />
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/login" Component={Login} />
        <Route path="/instructions" Component={Instructions} />
        <Route path="/confirmation" Component={Confirmation} />
        <Route path="/wall" Component={Wall} />
        <Route path="/addmem" Component={AddMem} />
      </Routes>
      <Footer />
    </Router>
  </React.StrictMode>
)
