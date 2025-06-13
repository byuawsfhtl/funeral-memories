import React, { useState, useEffect } from "react";
import "./FindRelative.css";
import axios from "axios";
import FsService from "./FsService";
import { useNavigate, useLocation } from "react-router-dom";
import { FuneralMemoryService } from "../../service/FuneralMemoryService";

export default function FindRelative() {
	const location = useLocation();
	const navigate = useNavigate();
	const service = new FuneralMemoryService();

	type FormData = {
		firstName: string;
		lastName: string;
		birthPlace: string;
		birthYear: string;
		deathPlace: string;
		deathYear: string;
	};

	const [formData, setFormData] = useState<FormData>({
		firstName: "",
		lastName: "",
		birthPlace: "",
		birthYear: "",
		deathPlace: "",
		deathYear: "",
	});

	const [ancestors, setAncestors] = useState([]);

	const [groupId, setGroupId] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	useEffect(() => {
		// Fill in passed-in state if available
		console.log("Received location.state:", location.state);

		if (location.state?.formData) {
			setFormData(location.state.formData);
		}
		if (location.state?.ancestors) {
			setAncestors(location.state.ancestors);
		}
		if (location.state?.groupId) {
			setGroupId(location.state.groupId);
		}
		if (location.state?.username) {
			setUsername(location.state.username);
		}
		if (location.state?.password) {
			setPassword(location.state.password);
		}

		// Get token
		const authTokenUrl = "https://auth.fhtl.org/get_token";
		axios
			.post(authTokenUrl)
			.then((response) => {
				const token = response.data.access_token;
				sessionStorage.setItem("yourKey", token);
			})
			.catch((error) => {
				console.error("Error fetching token:", error);
			});
	}, [location.state]);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!sessionStorage.getItem("yourKey")) {
			alert("Missing FamilySearch token");
			return;
		}

		try {
			const data = await FsService.searchForAncestor(formData);
			setAncestors(data.entries);
		} catch (error) {
			console.error("Search error:", error);
			alert("There was an error while searching.");
		}
	};

	//const handleAncestorClick = (personData) => {
	const handleAncestorClick = async (personData) => {
		// Navigate to confirmation with all needed state
		navigate("/confirmation", {
			state: {
				person: personData,
				formData,
				ancestors,
				username,
				password,
				personId: personData.id,
			},
		});
	};
	// };

	function printAncestor(ancestor) {
		const p = ancestor.content.gedcomx.persons[0].display;
		p.id = ancestor.content.gedcomx.persons[0].id;

		const birthYear = p.birthDate ? new Date(p.birthDate).getUTCFullYear() : "";
		const deathYear = p.deathDate ? new Date(p.deathDate).getUTCFullYear() : "";
		const age = birthYear && deathYear ? `(Age ${deathYear - birthYear})` : "";
		const portrait = `https://api.familysearch.org/platform/tree/persons/${
			p.id
		}/portrait?default=https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png&access_token=${sessionStorage.getItem(
			"yourKey"
		)}`;

		return (
			<li
				className="search-result"
				onClick={() => handleAncestorClick(p)}
				style={{ cursor: "pointer" }}
			>
				<div style={{ margin: "auto", width: "fit-content" }}>
					<img className="portrait" src={portrait} alt="Portrait" />
				</div>
				<div className="person-name">
					<div className="overflowDiv">{p.name}</div>
				</div>
				<div className="lifespan">
					{birthYear} - {deathYear} {age}
				</div>
				<div className="birth">
					<div className="overflow-div">
						Birth
						<br />
						{p.birthPlace}
					</div>
				</div>
				<div className="death">
					<div className="overflow-div">
						Death
						<br />
						{p.deathPlace}
					</div>
				</div>
			</li>
		);
	}

	return (
		<div className="find-relative">
			<div className="title">
				<h1>Find a Relative</h1>
			</div>

			<form onSubmit={handleSubmit}>
				<div className="form-row">
					<div className="form-col">
						<label className="form-label">First Name</label>
						<input
							type="text"
							name="firstName"
							value={formData.firstName}
							onChange={handleChange}
							className={formData.firstName ? "black-text" : "gray-text"}
							placeholder="Enter text here"
						/>
					</div>
					<div className="form-col">
						<label className="form-label">
							Last Name <span className="form-required">(Required)</span>
						</label>
						<input
							type="text"
							name="lastName"
							value={formData.lastName}
							onChange={handleChange}
							className={formData.lastName ? "black-text" : "gray-text"}
							placeholder="Enter text here"
							required
						/>
					</div>
				</div>

				<div className="form-row">
					<div className="form-col">
						<label className="form-label">Birth Place</label>
						<input
							type="text"
							name="birthPlace"
							value={formData.birthPlace}
							onChange={handleChange}
							className={formData.birthPlace ? "black-text" : "gray-text"}
							placeholder="Enter text here"
						/>
					</div>
					<div className="form-col">
						<label className="form-label">Birth Year</label>
						<input
							type="text"
							name="birthYear"
							value={formData.birthYear}
							onChange={handleChange}
							className={formData.birthYear ? "black-text" : "gray-text"}
							placeholder="Enter text here"
						/>
					</div>
				</div>

				<div className="form-row">
					<div className="form-col">
						<label className="form-label">Death Place</label>
						<input
							type="text"
							name="deathPlace"
							value={formData.deathPlace}
							onChange={handleChange}
							className={formData.deathPlace ? "black-text" : "gray-text"}
							placeholder="Enter text here"
						/>
					</div>
					<div className="form-col">
						<label className="form-label">Death Year</label>
						<input
							type="text"
							name="deathYear"
							value={formData.deathYear}
							onChange={handleChange}
							className={formData.deathYear ? "black-text" : "gray-text"}
							placeholder="Enter text here"
						/>
					</div>
				</div>

				<div className="form-col">
					<button type="submit" className="form-search">
						Search
					</button>
				</div>
			</form>

			{ancestors.length > 0 && (
				<div className="results">
					{ancestors.map((ancestor, index) => (
						<div key={index}>{printAncestor(ancestor)}</div>
					))}
				</div>
			)}
		</div>
	);
}
