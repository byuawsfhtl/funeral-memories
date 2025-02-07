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
import Quote from './Quote.jsx';
import FindRelative from './find_relative/FindRelative.jsx';
import { WebSocketChat } from './Chat.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode className="d-flex flex-column min-vh-100">
    <Router>
      <Header />
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/login" Component={Login} />
        <Route path="/instructions" Component={Instructions} />
        <Route path="/confirmation" Component={Confirmation} />
        <Route path="/wall" Component={Wall} />
        <Route path="/addmem" Component={AddMem} />
        <Route path="/quote" Component={Quote} />
        <Route path="/chat" Component={WebSocketChat} />
        <Route path="/find-relative" Component={FindRelative} />
        <Route path="*" Component={Home} />
      </Routes>
      <Footer />
    </Router>
  </React.StrictMode>
)
