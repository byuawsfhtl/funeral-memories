import logo from "../../placeholder_img/NewFuneralMemoriesLogo.png";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header
      className="container-fluid text-white d-none d-md-block"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="d-flex align-items-center justify-content-center pt-3">
          <img
            src={logo}
            alt="Funeral Memories Logo"
            style={{ height: "70px", marginRight: "5px" }}
          />
          <h1 className="m-0" style={{ fontFamily: "var(--font-heading)" }}>
            Funeral Memories
          </h1>
        </div>
      </Link>

      <nav className="navbar navbar-expand">
        <div className="container-fluid d-flex justify-content-center"></div>
      </nav>
    </header>
  );
}
