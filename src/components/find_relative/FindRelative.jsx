import React, { useState, useContext } from "react";
import "./FindRelative.css";
import axios from "axios";
import FsService from "./FsService";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function FindRelative() {
	const location = useLocation();
	useEffect(() => {
		if (location.state?.formData) {
			setFormData(location.state.formData);
		}
		if (location.state?.ancestors) {
			setAncestors(location.state.ancestors);
		}
	}, [location.state]);

	const navigate = useNavigate();
	const handleAncestorClick = (personData) => {
		navigate("/confirmation", {state: {person: personData, formData: formData, ancestors: ancestors,}})
		console.log("Clicked person:", personData);
	};
	async function auth() {
		const authTokenUrl = "https://auth.fhtl.org/get_token";
		axios
			.post(authTokenUrl)
			.then((response) => {
				const data = response.data;
				console.log(data);
				sessionStorage.setItem(
					"yourKey",
					JSON.stringify(data.access_token).replace(/['"]+/g, "")
				);
			})
			.catch((error) => {
				console.error("Error fetching the token:", error);
			});
	}

	auth();
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		birthPlace: "",
		birthYear: "",
		deathPlace: "",
		deathYear: "",
	});

	const [ancestors, setAncestors] = useState([]);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		// Handle the form data here

		if (!sessionStorage.getItem("yourKey")) {
			alert("Error");
			return;
		} else {
			// alert("SUCCESS");
			console.log("Successfully found potential ancestors");
		}

		try {
			const data = await FsService.searchForAncestor(formData);
			console.log("data:", data);
			setAncestors(data.entries);
		} catch (error) {
			console.error("Error during ancestor search:", error);
			alert("There was an error while searching for ancestors.");
		}
	};

	function printAncestor(ancestor) {
		var p = ancestor.content.gedcomx.persons[0].display;
		p.id = ancestor.content.gedcomx.persons[0].id;

		if (p.birthPlace == undefined) p.birthPlace = "";
		if (p.deathPlace == undefined) p.deathPlace = "";

		var portrait =
			"https://api.familysearch.org/platform/tree/persons/" +
			p.id +
			"/portrait?default=https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png&access_token=" +
			sessionStorage.getItem("yourKey");
		var birthYear = p.birthDate ? new Date(p.birthDate).getUTCFullYear() : "";
		var deathYear = p.deathDate ? new Date(p.deathDate).getUTCFullYear() : "";
		var age =
			birthYear && deathYear
				? "(Age " + Math.abs(deathYear - birthYear) + ")"
				: "";

		function getName(pid) {
			for (let k = 0; k < ancestor.content.gedcomx.persons.length; k++) {
				if (ancestor.content.gedcomx.persons[k].id == pid) {
					return ancestor.content.gedcomx.persons[k].display.name;
				}
			}
		}

		var spouseId = "";
		var spouse = "";
		var spousePortrait =
			"https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png";
		var parent1 = "";
		var parent2 = "";
		var parentPortrait1 =
			"https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png";
		var parentPortrait2 =
			"https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png";
		if (ancestor.content.gedcomx.relationships) {
			for (let j = 0; j < ancestor.content.gedcomx.relationships.length; j++) {
				// Find spouse
				if (
					ancestor.content.gedcomx.relationships[j].type ==
					"http://gedcomx.org/Couple"
				) {
					spouseId =
						ancestor.content.gedcomx.relationships[j].person2.resourceId;
					if (
						p.id != ancestor.content.gedcomx.relationships[j].person1.resourceId
					) {
						spouseId =
							ancestor.content.gedcomx.relationships[j].person1.resourceId;
					} else {
						spouseId =
							ancestor.content.gedcomx.relationships[j].person2.resourceId;
					}
					spousePortrait =
						"https://api.familysearch.org/platform/tree/persons/" +
						spouseId +
						"/portrait?default=https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png&access_token=" +
						sessionStorage.getItem("yourKey");
					spouse = getName(spouseId);
				}
				// Find parent1
				if (
					ancestor.content.gedcomx.relationships[j].type ==
					"http://gedcomx.org/ParentChild"
				) {
					if (
						ancestor.content.gedcomx.relationships[j].person2.resourceId ==
							p.id &&
						parent1 == ""
					) {
						parent1 = getName(
							ancestor.content.gedcomx.relationships[j].person1.resourceId
						);
						continue;
					}
				}
				// Find parent2
				if (
					ancestor.content.gedcomx.relationships[j].type ==
					"http://gedcomx.org/ParentChild"
				) {
					if (
						ancestor.content.gedcomx.relationships[j].person2.resourceId ==
							p.id &&
						parent2 == ""
					) {
						parent2 = getName(
							ancestor.content.gedcomx.relationships[j].person1.resourceId
						);
						break;
					}
				}
			}
		}

		return (
			<li className="search-result" onClick={() => handleAncestorClick(p)} style={{cursor: "pointer"}}>
				<div style={{ margin: "auto", width: "fit-content" }}>
					<img className="portrait" src={portrait} />
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
				<div className="spouse">
					<div className="overflow-div">
						Spouse
						<br />
						<img className="spouse-portrait" src={spousePortrait} />
						{spouse}
					</div>
				</div>
				<div className="parent">
					<div className="overflow-div">
						Parents
						<br />
						<img className="parent-portrait" src={parentPortrait1} />
						{parent1}
					</div>
				</div>
				<div className="parent">
					<div className="overflow-div">
						<img className="parent-portrait" src={parentPortrait2} />
						{parent2}
					</div>
				</div>
			</li>
		);
	}

	return (
		<div>
			<div className="title">
				<h1>Find a Relative</h1>
			</div>

			<form onSubmit={handleSubmit}>
				<div className="form-row">
					<div className="form-col">
						<label className="form-label">Ancestor's First Name</label>
						<input
							type="text"
							name="firstName"
							value={formData.firstName}
							onChange={handleChange}
							placeholder="Enter text here"
							className={formData.firstName ? "black-text" : "gray-text"}
						/>
					</div>
					<div className="form-col">
						<label className="form-label">
							Ancestor's Last Name (or maiden name)
							<span className="form-required"> (Required)</span>
						</label>
						<input
							type="text"
							name="lastName"
							value={formData.lastName}
							onChange={handleChange}
							placeholder="Enter text here"
							className={formData.lastName ? "black-text" : "gray-text"}
							required
						/>
					</div>
				</div>
				<div className="form-row">
					<div className="form-col">
						<label className="form-label">
							Birth Place<span className="form-optional"> (Optional)</span>
						</label>
						<input
							type="text"
							name="birthPlace"
							value={formData.birthPlace}
							onChange={handleChange}
							placeholder="Enter text here"
							className={formData.birthPlace ? "black-text" : "gray-text"}
						/>
					</div>
					<div className="form-col">
						<label className="form-label">
							Birth Year<span className="form-optional"> (Optional)</span>
						</label>
						<input
							type="text"
							name="birthYear"
							value={formData.birthYear}
							onChange={handleChange}
							placeholder="Enter text here"
							className={formData.birthYear ? "black-text" : "gray-text"}
						/>
					</div>
				</div>
				<div className="form-row">
					<div className="form-col">
						<label className="form-label">
							Death Place<span className="form-optional"> (Optional)</span>
						</label>
						<input
							type="text"
							name="deathPlace"
							value={formData.deathPlace}
							onChange={handleChange}
							placeholder="Enter text here"
							className={formData.deathPlace ? "black-text" : "gray-text"}
						/>
					</div>
					<div className="form-col">
						<label className="form-label">
							Death Year<span className="form-optional"> (Optional)</span>
						</label>
						<input
							type="text"
							name="deathYear"
							value={formData.deathYear}
							onChange={handleChange}
							placeholder="Enter text here"
							className={formData.deathYear ? "black-text" : "gray-text"}
						/>
					</div>
				</div>
				<div className="form-col">
					<button type="submit" className="form-search">
						Search
					</button>
				</div>
			</form>

			<br />

			{/*This div is for the ancestors results*/}
			{ancestors.length > 0 ? (
				<div className="results">
					{ancestors.map((ancestor, index) => (
						<div key={index}>{printAncestor(ancestor)}</div>
					))}
				</div>
			) : (
				<p></p>
			)}
		</div>
	);
}
