import logo from "../assets/navylogo.png";
import { Link } from "react-router-dom";
import "../styles/header.css";

export default function Header() {
	return (
		<header>
			<nav>
				<img src={logo} alt="Funeral Memories Logo" />
				<Link to="/">
					<h1>Funeral Memories</h1>
				</Link>
				<div className="nav-links">
					<Link to="/">Home</Link>
					<Link to="/instructions">Instructions</Link>
				</div>
			</nav>
		</header>
	);
}
