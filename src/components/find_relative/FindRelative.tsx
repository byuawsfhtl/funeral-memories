import React, { useState, useEffect, useRef } from "react";
import "./FindRelative.css";
import axios from "axios";
import FsService from "./FsService";
import { useNavigate, useLocation } from "react-router-dom";
import { FuneralMemoryService } from "../../service/FuneralMemoryService";
import Confirmation from "../Confirmation";

export default function FindRelative() {
	const location = useLocation();
	const navigate = useNavigate();
	const service = new FuneralMemoryService();
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [selectedPerson, setSelectedPerson] = useState<any>(null);
	const resultsRef = useRef<HTMLDivElement>(null);
	const [isLoading, setIsLoading] = useState(false);
	const expirationDateTime = location.state?.expirationDateTime || {};
	console.log(expirationDateTime);

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

	const handleChange = (event: any) => {
		const { name, value } = event.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async (event: any) => {
		event.preventDefault();

		if (!sessionStorage.getItem("yourKey")) {
			alert("Missing FamilySearch token\nPlease refresh the page.");
			return;
		}

		try {
			const data = await FsService.searchForAncestor(formData);
			setAncestors(data.entries);
		} catch (error) {
			console.error("Search error:", error);
			alert("Invalid search input. Please try again.");
		}
	};

	//const handleAncestorClick = (personData) => {
	const handleAncestorClick = async (personData: any) => {
		// Navigate to confirmation with all needed state
		console.log("Clicked person:", personData);
		setSelectedPerson(personData);
		setShowConfirmation(true);
	};
	// };

	function printAncestor(ancestor: any) {
		var p = ancestor.content.gedcomx.persons[0].display;
		p.id = ancestor.content.gedcomx.persons[0].id;

		if (p.birthPlace == undefined) p.birthPlace = "";
		if (p.deathPlace == undefined) p.deathPlace = "";

		var portrait =
			"https://api.familysearch.org/platform/tree/persons/" +
			p.id +
			"/portrait?default=https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png&access_token=" +
			sessionStorage.getItem("yourKey");
		var birthYear: any = p.birthDate
			? new Date(p.birthDate).getUTCFullYear()
			: "";
		var deathYear: any = p.deathDate
			? new Date(p.deathDate).getUTCFullYear()
			: "";
		var age =
			birthYear && deathYear
				? "(Age " + Math.abs(deathYear - birthYear) + ")"
				: "";

		function getName(pid: any) {
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
			<li
				className="search-result slide-in"
				onClick={() => handleAncestorClick(p)}
				style={{
					cursor: "pointer",
				}}
			>
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
			<div className="progress mb-3">
				<div
					className="progress-bar"
					role="progressbar"
					style={{ width: "75%" }}
					aria-valuenow={75}
					aria-valuemin={0}
					aria-valuemax={100}
				>
					75%
				</div>
			</div>

			<div className={`container ${isLoading ? "loading" : ""}`}>
				{isLoading}

				<div className="title">
					<h1>Search and Select a Relative for the Memory Wall</h1>
				</div>

				<p className="text-danger text-center mb-1">
					<strong>
						Note: Please ensure that the relative has been marked as deceased on
						Family Search.
					</strong>
				</p>

				<p className="text-muted text-center mb-4">
					It might take around an hour for the relative to be searchable after
					initially being marked as deceased
				</p>

				<form onSubmit={handleSubmit}>
					<div className="form-row">
						<div className="form-col">
							<label className="form-label">
								Ancestor's First Name
								<span className="form-optional"> (Optional)</span>
							</label>
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
								Ancestor's Last Name
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
						<button
							type="submit"
							className="form-search button button-green"
							style={{ width: "150px" }}
						>
							Search
						</button>
					</div>
				</form>

				<br />

				{/*This div is for the ancestors results*/}
				{ancestors.length > 0 && (
					<p className="results-hint">
						If you don't see your ancestor listed, please enter more information
						and search again.
					</p>
				)}
				{ancestors.length > 0 ? (
					<div className="results" ref={resultsRef} tabIndex={-1}>
						{ancestors.map((ancestor: any, index: any) => (
							<div key={index}>{printAncestor(ancestor)}</div>
						))}
					</div>
				) : (
					<p></p>
				)}
			</div>
			{showConfirmation && selectedPerson && (
				<Confirmation
					person={selectedPerson}
					formData={formData}
					ancestors={ancestors}
					username={username}
					password={password}
					personId={selectedPerson.id}
					onClose={() => setShowConfirmation(false)}
					expirationDate={expirationDateTime}
				/>
			)}
		</div>
	);
}
