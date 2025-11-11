import logo from "../../placeholder_img/NewFuneralMemoriesLogo.png";
import { Link } from "react-router-dom";
import "../styles/header.css";

export default function Header() {
  return (
    <header>
      <nav>
        <img src="src\assets\navylogo.png" alt="Funeral Memories Logo" />
        <h1>Funeral Memories</h1>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/instructions">Instructions</Link>
        </div>
      </nav>
    </header>
  );
}
