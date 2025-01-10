import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Navbar, Nav } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useLocation } from "react-router-dom";

export default function Header(){
    return(
    <header className="container-fluid text-white d-none d-md-block" style={{backgroundColor: 'rgb(13 106 95)'}}>
      <h1 className="text-center pt-3">Funeral Memories</h1>
      <Nav className="navbar navbar-expand">
        <div className="container-fluid d-flex justify-content-center">
          <ul className="navbar-nav">
            <LinkContainer to="/" className="nav-link text-white">
                <Nav.Link active={location.pathname === "/"}>
                    Home
                </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/login" className="nav-link text-white">
                <Nav.Link active={location.pathname === "/login"}>
                    Family Search Login
                </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/instructions" className="nav-link text-white">
                <Nav.Link active={location.pathname === "/instructions"}>
                    Instructions
                </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/confirmation" className="nav-link text-white">
                <Nav.Link active={location.pathname === "/confirmation"}>
                    Family Confirmation
                </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/wall" className="nav-link text-white">
                <Nav.Link active={location.pathname === "/wall"}>
                    Memory Wall
                </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/addmem" className="nav-link text-white">
                <Nav.Link active={location.pathname === "/addmem"}>
                    Add Memory
                </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/quote" className="nav-link text-white">
                <Nav.Link active={location.pathname === "/quote"}>
                    Quote
                </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/chat" className="nav-link text-white">
                <Nav.Link active={location.pathname === "/chat"}>
                    Chat
                </Nav.Link>
            </LinkContainer>
          </ul>
        </div>
      </Nav>
    </header>
    );
}