import React, {
	useState,
	useRef,
	ChangeEvent,
	FormEvent,
	useEffect,
} from "react";
import { uploadPersonAndPortrait } from "../service/uploadPerson";
import axios from "axios";

import { useLocation, useNavigate } from "react-router";
import { FuneralMemoryService } from "../service/FuneralMemoryService";
import imageCompression from "browser-image-compression";
import { ProgressBar } from "react-step-progress-bar";
import "react-circular-progressbar/dist/styles.css";

export default function AddPerson() {
	const service = new FuneralMemoryService();
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [photo, setPhoto] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [sex, setSex] = useState<string>("");
	const [birthDate, setBirthDate] = useState("");
	const [birthPlace, setBirthPlace] = useState("");
	const [deathDate, setDeathDate] = useState("");
	const [marriageDate, setMarriageDate] = useState("");
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [loading, setLoading] = useState(false);
	const location = useLocation();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [expirationDateTime, setExpirationDateTime] = useState("");
	const [hasConfirmed, setHasConfirmed] = useState(false);
	const percentage = 75;

	console.log(
		"expireDate username and Pass: ",
		username,
		password,
		expirationDateTime
	);

	useEffect(() => {
		if (location.state?.username) {
			setUsername(location.state.username);
		}
		if (location.state?.password) {
			setPassword(location.state.password);
		}
		if (location.state?.expirationDateTime) {
			setExpirationDateTime(location.state.expirationDateTime);
		}
	}, [location.state]);

	useEffect(() => {
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
	}, []); // Empty dependency array to run once on mount

	// Modal state
	const [showConfirm, setShowConfirm] = useState(false);
	const handleConfirmOpen = () => setShowConfirm(true);
	const handleConfirmClose = () => setShowConfirm(false);

	function toDateOrNull(dateStr: string): Date | null {
		if (!dateStr) return null;
		const d = new Date(dateStr);
		return isNaN(d.getTime()) ? null : d;
	}

	function dateToPartialDate(
		date: Date | null | undefined
	): { year?: string; month?: string; day?: string } | null {
		if (!date) return null;
		const year = date.getUTCFullYear().toString();
		const month = (date.getUTCMonth() + 1).toString();
		const day = date.getUTCDate().toString();
		return { year, month, day };
	}

	useEffect(() => {
		const confirmed = localStorage.getItem("hasConfirmed");
		if (confirmed === "true") {
			setHasConfirmed(true);
			setLoading(true);
			localStorage.removeItem("hasConfirmed");

			// or set depending on your loading flow
		}
	}, []);

	useEffect(() => {
		const run = async () => {
			const params = new URLSearchParams(location.search);
			const fstoken = params.get("fstoken");
			if (!fstoken) return;

			const storedName = localStorage.getItem("addName") || "";
			const storedSex = localStorage.getItem("addSex") || "";
			const storedBirthDate = localStorage.getItem("addBirthDate") || "";
			const storedDeathDate = localStorage.getItem("addDeathDate") || "";
			const storedMarriageDate = localStorage.getItem("addMarriageDate") || "";
			const storedBirthPlace = localStorage.getItem("addBirthPlace") || "";
			const base64Photo = localStorage.getItem("addPhotoBase64") || "";
			const fileName = localStorage.getItem("addPhoto") || "";
			const storedUsername = localStorage.getItem("username") || "";
			const storedPassword = localStorage.getItem("password") || "";
			const storedExpiration = localStorage.getItem("expirationDateTime") || "";
			const defaultPortraitUrl =
				"https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png";

			const portraitBase64 = await service.fetchPortrait(defaultPortraitUrl);

			//const expiration = storedExpiration ? JSON.parse(storedExpiration) : {};

			// Use these to replace location.state values
			setUsername(storedUsername);
			setPassword(storedPassword);
			setExpirationDateTime(storedExpiration);

			setName(storedName);
			setSex(storedSex);
			setBirthDate(storedBirthDate);
			setDeathDate(storedDeathDate);
			setMarriageDate(storedMarriageDate);
			setBirthPlace(storedBirthPlace);
			if (base64Photo) {
				const file = base64ToFile(base64Photo, fileName);
				setPhoto(file);
				setPreviewUrl(base64Photo);
			}

			let token = await service.fetchAndStoreToken();

			const birthDateObj = dateToPartialDate(toDateOrNull(storedBirthDate));
			const deathDateObj = dateToPartialDate(toDateOrNull(storedDeathDate));
			const marriageDateObj = dateToPartialDate(
				toDateOrNull(storedMarriageDate)
			);

			const { pid } = await uploadPersonAndPortrait({
				name: storedName,
				sex: storedSex,
				birthDate: birthDateObj,
				deathDate: deathDateObj,
				marriageDate: marriageDateObj,
				birthPlace: storedBirthPlace,
				photo: base64Photo ? base64ToFile(base64Photo, fileName) : null!,
				token,
				fstoken,
			});

			//alert("Person and portrait uploaded successfully! PID: " + pid);

			const personResponse = await fetch(
				`https://api.familysearch.org/platform/tree/persons/${pid}`,
				{
					method: "GET",
					headers: {
						Accept: "application/x-gedcomx-v1+json",
						Authorization: `Bearer ${token}`,
					},
				}
			);
			const personData = await personResponse.json();

			const person = {
				name: storedName,
				id: pid,
			};

			console.log("person: ", personData);

			try {
				const group = {
					ancestor: person,
					portrait: base64Photo || portraitBase64,
					closed: "false",
					timestamp: Date.now(),
					expirationDate: storedExpiration,
				};

				console.log("group: ", group);

				const admin = { admin: storedUsername, password: storedPassword };

				console.log("admin: ", admin);

				const madeGroup = await service.addGroup(group, admin);

				console.log("madeGroup", madeGroup);

				const sessionId =
					localStorage.getItem("sessionId") || crypto.randomUUID();
				localStorage.setItem("sessionId", sessionId);

				console.log(
					"groupID: ",
					madeGroup.groupId,
					" username: ",
					storedUsername,
					" password: ",
					storedPassword,
					" sessionId: ",
					sessionId
				);

				// const loginRes = await fetch("/api/login", {
				// 	method: "POST",
				// 	headers: { "Content-Type": "application/json" },
				// 	body: JSON.stringify({
				// 		groupId: madeGroup.groupId,
				// 		username: storedUsername,
				// 		password: storedPassword,
				// 		sessionId: sessionId,
				// 	}),
				// });
				const loginRes = await service.login({
					groupId: madeGroup.groupId,
					username: storedUsername,
					password: storedPassword,
					sessionId: sessionId,
				});

				if (!loginRes || !loginRes.sessionId) {
					console.error("Failed to record session as admin");
					alert("Group made, but admin session failed.");
				}

				navigate("/wall", { state: { madeGroup } });
			} catch (err) {
				console.error("Error during confirmation:", err);
				localStorage.removeItem("hasConfirmed");
				alert("Something went wrong. Could not confirm group setup.");
			} finally {
				setLoading(false);
				localStorage.removeItem("hasConfirmed");
			}

			setName("");
			setPhoto(null);
			setPreviewUrl(null);
			setSex("");
			setBirthDate("");
			setDeathDate("");
			setMarriageDate("");
		};

		run();
	}, []);

	function base64ToFile(base64: string, filename: string): File {
		const arr = base64.split(",");
		const mime = arr[0].match(/:(.*?);/)?.[1] || "";
		const bstr = atob(arr[1]);
		let n = bstr.length;
		const u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new File([u8arr], filename, { type: mime });
	}

	const handleNameChange = (e: ChangeEvent<HTMLInputElement>) =>
		setName(e.target.value);

	const handleBirthChange = (e: ChangeEvent<HTMLInputElement>) =>
		setBirthDate(e.target.value);

	const handleBirthPlaceChange = (e: ChangeEvent<HTMLInputElement>) =>
		setBirthPlace(e.target.value);

	const handleDeathChange = (e: ChangeEvent<HTMLInputElement>) =>
		setDeathDate(e.target.value);

	const handleMarriageChange = (e: ChangeEvent<HTMLInputElement>) =>
		setMarriageDate(e.target.value);

	const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files && e.target.files[0];
		if (file) {
			const options = {
				maxSizeMB: 1,
				maxWidthOrHeight: 1024,
				useWebWorker: true,
				initialQuality: Math.random() * (0.9 - 0.7) + 0.7,
			};
			try {
				const compressedFile = await imageCompression(file, options);
				setPhoto(compressedFile);
				const reader = new FileReader();
				reader.onloadend = () => {
					setPreviewUrl(reader.result as string);
				};
				reader.readAsDataURL(compressedFile);
			} catch (error) {
				alert("Image compression failed: " + error);
				setPhoto(null);
				setPreviewUrl(null);
			}
		} else {
			setPhoto(null);
			setPreviewUrl(null);
		}
	};

	// Show modal first
	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			alert("Please enter a name.");
			return;
		}

		handleConfirmOpen();
	};

	// Final confirm submit
	const handleConfirmSubmit = async () => {
		setLoading(true);
		setHasConfirmed(true);
		localStorage.setItem("hasConfirmed", "true");
		localStorage.setItem("loading", "true");
		try {
			localStorage.setItem("addName", name);
			localStorage.setItem("addSex", sex);
			localStorage.setItem("addBirthDate", birthDate);
			localStorage.setItem("addBirthPlace", birthPlace);
			localStorage.setItem("addDeathDate", deathDate);
			localStorage.setItem("addMarriageDate", marriageDate);
			if (photo) {
				localStorage.setItem("addPhoto", photo.name);
			} else {
				localStorage.removeItem("addPhoto"); // or set a default or empty string
			}

			const toBase64 = (file: File): Promise<string> =>
				new Promise((resolve, reject) => {
					const reader = new FileReader();
					reader.onload = () => resolve(reader.result as string);
					reader.onerror = reject;
					reader.readAsDataURL(file);
				});

			const base64Photo = photo ? await toBase64(photo) : "";
			localStorage.setItem("addPhotoBase64", base64Photo);
			localStorage.setItem("addPhotoBase64", base64Photo);

			localStorage.setItem("username", username);
			localStorage.setItem("password", password);
			localStorage.setItem("expirationDateTime", expirationDateTime);

			console.log("expirationDateTime: ", expirationDateTime);

			const redirectUri = `${window.location.origin}${location.pathname}`;
			window.location.href = `https://auth.fhtl.org?redirect=${redirectUri}`;
		} catch (error: any) {
			alert(error.message || "Error uploading person and portrait.");
		} finally {
			setLoading(false);
			setShowConfirm(false);
			setHasConfirmed(false);
		}
	};

	return (
		<main
			className="d-flex flex-grow-1 justify-content-center align-items-center flex-column"
			style={{ padding: "2rem" }}
		>
			<div style={{ width: "100%", maxWidth: "500px" }}>
				<small
					className="text-muted align-items-center"
					style={{ display: "block", textAlign: "center", marginBottom: "8px" }}
				>
					Progress toward creating your memory wall
				</small>
				<div style={{ display: "flex", justifyContent: "center" }}>
					<div style={{ marginBottom: "10px", width: 500, height: 20 }}>
						{" "}
						<ProgressBar
							percent={percentage}
							filledBackground="linear-gradient(to right, #fefb72, #f0bb31)"
							text={`${percentage}%`} // This shows the percent text inside the progress bar
						/>
					</div>
				</div>
				<h1 className="text-center mb-4">Add a Person</h1>
				<small className="text-muted text-center d-block">
					For some reason you are not redirected to a memory wall after
					submitting, please try submitting again.
				</small>
				<form onSubmit={handleSubmit}>
					<div className="mb-3">
						<label htmlFor="personName" className="form-label">
							Name<span className="text-danger">*</span>
						</label>
						<input
							type="text"
							id="personName"
							className="form-control"
							placeholder="Enter name"
							value={name}
							onChange={handleNameChange}
							required
						/>
					</div>

					<div className="mb-3">
						<label htmlFor="birthDate" className="form-label">
							Birth Date <span className="text-muted small">(optional)</span>
						</label>
						<input
							type="date"
							id="birthDate"
							className="form-control"
							value={birthDate}
							onChange={handleBirthChange}
						/>
					</div>

					<div className="mb-3">
						<label htmlFor="birthPlace" className="form-label">
							Birth Place <span className="text-muted small">(optional)</span>
						</label>
						<input
							type="text"
							id="birthPlace"
							className="form-control"
							value={birthPlace}
							onChange={handleBirthPlaceChange}
						/>
					</div>

					<div className="mb-3">
						<label htmlFor="deathDate" className="form-label">
							Death Date <span className="text-muted small">(optional)</span>
						</label>
						<input
							type="date"
							id="deathDate"
							className="form-control"
							value={deathDate}
							onChange={handleDeathChange}
						/>
					</div>

					<div className="mb-3">
						<label htmlFor="personPhoto" className="form-label">
							Add Portrait
						</label>
						<input
							type="file"
							id="personPhoto"
							accept=".jpg,.jpeg,.png,image/jpeg,image/png"
							className="form-control"
							onChange={handlePhotoChange}
							ref={fileInputRef}
						/>
					</div>

					{previewUrl && (
						<div
							className="position-relative mt-2"
							style={{ display: "inline-block" }}
						>
							<img
								src={previewUrl}
								alt="Preview"
								className="img-fluid"
								style={{ maxHeight: "150px", borderRadius: "8px" }}
							/>
							<button
								type="button"
								className="btn btn-sm btn-danger position-absolute"
								style={{
									top: 0,
									right: 0,
									transform: "translate(50%, -50%)",
									borderRadius: "50%",
									padding: 0,
									width: 28,
									height: 28,
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
								}}
								onClick={() => {
									setPreviewUrl(null);
									setPhoto(null);
									if (fileInputRef.current) fileInputRef.current.value = "";
								}}
								aria-label="Remove photo"
							>
								&times;
							</button>
						</div>
					)}

					<div className="mb-3">
						<label htmlFor="sex" className="form-label">
							Sex<span className="text-danger">*</span>
						</label>
						<div
							className="btn-group w-100"
							role="group"
							aria-label="Select sex"
						>
							<input
								type="radio"
								className="btn-check"
								name="sex"
								id="sexMale"
								autoComplete="off"
								value="Male"
								checked={sex === "Male"}
								onChange={() => setSex("Male")}
								required
							/>
							<label className="btn btn-outline-primary" htmlFor="sexMale">
								Male
							</label>

							<input
								type="radio"
								className="btn-check"
								name="sex"
								id="sexFemale"
								autoComplete="off"
								value="Female"
								checked={sex === "Female"}
								onChange={() => setSex("Female")}
								required
							/>
							<label className="btn btn-outline-primary" htmlFor="sexFemale">
								Female
							</label>
						</div>
					</div>

					<div className="d-grid mt-4">
						<button type="submit" className="btn btn-primary btn-lg">
							Add Person and Create Memory Wall
						</button>
					</div>
				</form>
			</div>

			{/* Confirmation Modal */}
			{showConfirm && (
				<div
					className="modal fade show d-block"
					tabIndex={-1}
					role="dialog"
					style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
				>
					<div className="modal-dialog modal-dialog-centered">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Confirm Person Details</h5>
								<button
									type="button"
									className="btn-close"
									onClick={handleConfirmClose}
								></button>
							</div>
							<div className="modal-body text-center">
								{previewUrl && (
									<img
										src={previewUrl}
										alt="Portrait Preview"
										className="img-fluid mb-3 rounded"
										style={{ maxHeight: "200px" }}
									/>
								)}
								<p>
									<strong>Name:</strong> {name}
								</p>
								<p>
									<strong>Sex:</strong> {sex}
								</p>
								{birthDate && (
									<p>
										<strong>Birth Date:</strong> {birthDate}
									</p>
								)}
								{birthPlace && (
									<p>
										<strong>Birth Place:</strong> {birthPlace}
									</p>
								)}
								{deathDate && (
									<p>
										<strong>Death Date:</strong> {deathDate}
									</p>
								)}
								{marriageDate && (
									<p>
										<strong>Marriage Date:</strong> {marriageDate}
									</p>
								)}
							</div>
							<div className="modal-footer">
								<button
									className="btn btn-secondary"
									onClick={handleConfirmClose}
								>
									Cancel
								</button>
								<button
									className="btn btn-primary"
									onClick={handleConfirmSubmit}
									disabled={loading}
								>
									{loading ? "Submitting..." : "Confirm & Submit"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{loading && hasConfirmed && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100vw",
						height: "100vh",
						backgroundColor: "rgba(0, 0, 0, 0.5)",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						color: "white",
						fontSize: "1.5rem",
						zIndex: 1050,
					}}
				>
					Creating person and taking you to memory wall...
				</div>
			)}
		</main>
	);
}
