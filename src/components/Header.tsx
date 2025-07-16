import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { Navbar, Nav } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useLocation } from "react-router-dom";
import logo from "../../placeholder_img/NewFuneralMemoriesLogo.png";

export default function Header() {
  return (
    <header
      className="container-fluid text-white d-none d-md-block"
      style={{ backgroundColor: "rgb(13 106 95)" }}
    >
      <div className="d-flex align-items-center justify-content-center pt-3">
        <img
          src={logo}
          alt="Funeral Memories Logo"
          style={{ height: "70px", marginRight: "5px" }}
        />
        <h1 className="m-0" style={{ fontFamily: '"Bodoni Moda SC", serif' }}>
          Funeral Memories
        </h1>
      </div>
      <Nav className="navbar navbar-expand">
        <div className="container-fluid d-flex justify-content-center">
          <ul className="navbar-nav">
            <LinkContainer to="/" className="nav-link text-white">
              <Nav.Link active={location.pathname === "/"}>Home</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/instructions" className="nav-link text-white">
              <Nav.Link active={location.pathname === "/instructions"}>
                Instructions
              </Nav.Link>
            </LinkContainer>
            {/* <LinkContainer to="/confirmation" className="nav-link text-white">
							<Nav.Link active={location.pathname === "/confirmation"}>
								Family Confirmation
							</Nav.Link>
						</LinkContainer> */}
            {/* <LinkContainer to="/wall" className="nav-link text-white">
							<Nav.Link active={location.pathname === "/wall"}>
								Memory Wall
							</Nav.Link>
						</LinkContainer>
						<LinkContainer to="/find-relative" className="nav-link text-white">
							<Nav.Link active={location.pathname === "/find-relative"}>
								Find Relative
							</Nav.Link>
						</LinkContainer> */}
          </ul>
        </div>
      </Nav>
    </header>
  );
}
