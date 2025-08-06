import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ClipboardCheck, Clipboard } from "react-bootstrap-icons";
import { FuneralMemoryService } from "../service/FuneralMemoryService";
import "./Wall.css";
import imageCompression from "browser-image-compression";
import TabbedMemoryWall from "./TabbedWall";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Memory } from "../model/Memory";
import { useFamilySearchResumePublish } from "./Publishing"; // or wherever you put it
import { exportMemoriesAsPDF } from "../service/exportMemoriesAsPDF";
import QRCode from "react-qr-code";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Instructions from "./Instructions";

type CopyableGroupIdProps = {
	groupId: string;
};

function CopyableGroupId({ groupId }: CopyableGroupIdProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		if (groupId) {
			try {
				await navigator.clipboard.writeText(groupId);
				setCopied(true);
				setTimeout(() => setCopied(false), 1500);
			} catch (err) {
				setCopied(false);
				alert("Failed to copy Group ID");
			}
		}
	};

	return (
		<span
			className="text-muted small mb-0 d-flex align-items-center"
			style={{
				cursor: "pointer",
				padding: "6px 10px",
				transition: "background 0.15s",
				background: copied ? "#e6ffee" : "transparent",
				color: copied ? "#177e5b" : undefined,
			}}
			title={copied ? "Copied!" : "Click to copy"}
			onClick={handleCopy}
		>
			Group ID:{" "}
			<strong style={{ fontSize: "1em", marginLeft: 6 }}>{groupId}</strong>
			<span style={{ marginLeft: 8, fontSize: 18 }}>
				{copied ? <ClipboardCheck color="#177e5b" /> : <Clipboard />}
			</span>
			{copied && (
				<span
					style={{
						marginLeft: 10,
						color: "#177e5b",
						fontWeight: 600,
						fontSize: "0.93em",
						letterSpacing: 0.3,
					}}
				>
					Copied!
				</span>
			)}
		</span>
	);
}

interface MemErrors {
	title: string;
	memory: string;
}

export default function Wall() {
	const [myMemories, setMyMemories] = useState<Memory[]>([]);
	const [memoryList, setMemoryList] = useState<Memory[]>([]);
	const [memory, setMemory] = useState("");
	const [showPopup, setShowPopup] = useState(false);
	const [title, setTitle] = useState("");
	const [place, setPlace] = useState("");
	const [date, setDate] = useState<Date | null>(null);
	const [errors, setErrors] = useState<MemErrors | null>(null);
	const [author, setAuthor] = useState("");
	const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
	const [showDetail, setShowDetail] = useState(false);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showConfirmPublish, setShowConfirmPublish] = useState(false);
	const [showSecondConfirm, setShowSecondConfirm] = useState(false);
	const [isLightboxOpen, setIsLightboxOpen] = useState(false);
	const [showButton, setShowButton] = useState(false);
	const [isQRLightboxOpen, setIsQRLightboxOpen] = useState(false);
	const qrWrapperRef = useRef<HTMLDivElement>(null);
	const [showHelp, setShowHelp] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const downloadQR = () => {
		const svg = qrWrapperRef.current?.querySelector("svg");
		if (!svg) return;

		const serializer = new XMLSerializer();
		const svgStr = serializer.serializeToString(svg);

		const img = new window.Image();
		const svg64 = btoa(unescape(encodeURIComponent(svgStr)));
		img.src = "data:image/svg+xml;base64," + svg64;

		img.onload = function () {
			const canvas = document.createElement("canvas");
			canvas.width = 512;
			canvas.height = 512;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.fillStyle = "#fff";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

			const pngUrl = canvas.toDataURL("image/png");
			const link = document.createElement("a");
			link.href = pngUrl;
			link.download = `${person.name.replace(
				/\s+/g,
				"_"
			)}'s_Funeral_Wall_QR.png`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		};
	};

	useEffect(() => {
		const handleScroll = () => {
			setShowButton(window.scrollY > 300);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useFamilySearchResumePublish();
	const navigate = useNavigate();
	const location = useLocation();
	const message = location.state?.message;
	const [showOverlay, setShowOverlay] = useState(!!message);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get("fstoken");

		if (token) {
			localStorage.setItem("fstoken", token);

			// Optionally clean up the URL for aesthetics
			const cleanUrl = window.location.origin + window.location.pathname;
			window.history.replaceState({}, document.title, cleanUrl);
		}
	}, []);

	const service = new FuneralMemoryService();
	const rawGroup =
		location.state?.madeGroup || localStorage.getItem("madeGroup");
	const madeGroup =
		typeof rawGroup === "string" ? JSON.parse(rawGroup) : rawGroup;

	// 🎯 Key extracted values
	const person = madeGroup?.ancestor;
	const groupId = madeGroup?.groupId || localStorage.getItem("groupId");
	const portraitUrl = madeGroup?.portrait;

	// 🧠 Save to localStorage on first load
	useEffect(() => {
		if (location.state?.madeGroup) {
			localStorage.setItem(
				"madeGroup",
				JSON.stringify(location.state.madeGroup)
			);
		}
	}, [location.state?.madeGroup]);
	const sessionId = useRef(
		localStorage.getItem("sessionId") || crypto.randomUUID()
	);
	const [isAdmin, setIsAdmin] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	const checkAdmin = async () => {
		const sessions = await service.getAdminSessions(groupId);
		console.log(sessions);
		if (sessions.includes(sessionId.current)) {
			setIsAdmin(true);
		}
	};

	useEffect(() => {
		localStorage.setItem("sessionId", sessionId.current);
	}, []);

	useEffect(() => {
		const button = document.querySelector(".fixed-add-button") as HTMLElement;
		const footer = document.querySelector("footer");

		if (!button || !footer) return;

		const updatePosition = (isIntersecting: boolean, height: number = 0) => {
			button.style.bottom = isIntersecting ? `${height + 16}px` : "24px";
		};

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					updatePosition(entry.isIntersecting, entry.intersectionRect.height);
				});
			},
			{
				root: null,
				threshold: 0,
			}
		);

		observer.observe(footer);

		// Bonus: trigger manual update on resize
		const handleResize = () => {
			const rect = footer.getBoundingClientRect();
			updatePosition(rect.top < window.innerHeight, rect.height);
		};

		window.addEventListener("resize", handleResize);

		return () => {
			observer.disconnect();
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	useEffect(() => {
		if (showPopup) {
			document.body.classList.add("popup-open");
		} else {
			document.body.classList.remove("popup-open");
		}

		// Cleanup on unmount
		return () => {
			document.body.classList.remove("popup-open");
		};
	}, [showPopup]);

	useEffect(() => {
		if (!groupId) {
			navigate("/");
			return;
		}

		const fetchMemoriesAndVerify = async () => {
			try {
				// Check if group still exists
				await service.getGroup(groupId); // This throws if deleted

				// Then fetch memories
				const data = await service.getMemories(groupId);
				setMemoryList(data);
				const mine = data.filter(
					(m: Memory) => m.sessionId === sessionId.current
				);
				setMyMemories(mine);
			} catch (error) {
				console.error("Group no longer exists or fetch failed:", error);
				// ✅ Only kick out if not admin
				if (!isAdmin) {
					navigate("/", { replace: true });
				}
			}
		};

		fetchMemoriesAndVerify();
		const intervalId = setInterval(fetchMemoriesAndVerify, 5000);

		return () => clearInterval(intervalId);
	}, [groupId, navigate, isAdmin]);

	useEffect(() => {
		if (groupId && sessionId.current) {
			checkAdmin();
		}
	}, [groupId, sessionId.current]);

	const handleDeleteDetail = async () => {
		if (!window.confirm("Are you sure you want to delete this memory?")) return;

		if (!selectedMemory) return;
		try {
			await service.deleteMemory(selectedMemory._id);
			setShowDetail(false);
			const refreshed = await service.getMemories(groupId);
			setMemoryList(refreshed);
			setMyMemories(
				refreshed.filter((m: Memory) => m.sessionId === sessionId.current)
			);
		} catch (err) {
			if (err instanceof Error) {
				console.error("Error deleting memory:", err.message);
			} else {
				console.error("Error deleting memory:", err);
			}
			alert("Failed to delete memory.");
		}
	};

	const handleSubmit = async (e: any) => {
		e.preventDefault();

		if (isSubmitting) return;
		setIsSubmitting(true);

		let newErrors: MemErrors = { title: "", memory: "" };
		if (!title.trim()) newErrors.title = "Title is required.";
		if (!memory.trim()) newErrors.memory = "Story is required.";
		if (newErrors.title || newErrors.memory) {
			setErrors(newErrors);
			setIsSubmitting(false);
			return;
		}

		try {
			if (editingId) {
				// EDIT MODE
				const imageBase64: string | null = imageFile
					? await new Promise((resolve, reject) => {
							const reader = new FileReader();
							reader.onloadend = () => {
								if (
									typeof reader.result === "string" ||
									reader.result === null
								) {
									resolve(reader.result);
								} else {
									resolve(null);
								}
							};
							reader.onerror = reject;
							reader.readAsDataURL(imageFile);
					  })
					: imagePreview || null;

				console.log("Submitting update:", {
					memoryId: editingId,
					title,
					story: memory,
					place,
					date,
					image: imageFile || imagePreview,
				});

				await service.updateMemory({
					memoryId: editingId,
					title,
					story: memory,
					place,
					date: date ? date.toISOString().split("T")[0] : "",
					image: imageBase64,
					author,
				});
			} else {
				// ADD MODE
				const memoryData: {
					groupId: string;
					title: string;
					memory: string;
					place: string;
					date: string;
					image: string | null; // ✅ this is the fix
					author: string;
					createdAt: Date;
					sessionId: string;
				} = {
					groupId,
					title,
					memory,
					place,
					date: date ? date.toISOString().split("T")[0] : "",
					image: null,
					author,
					createdAt: new Date(),
					sessionId: sessionId.current,
				};
				let submittedData = null;

				if (imageFile) {
					// 💡 1. Promisify the reader so we can await it!
					const imageBase64: string = await new Promise((resolve, reject) => {
						const reader = new FileReader();
						reader.onloadend = () => {
							if (typeof reader.result === "string") {
								resolve(reader.result);
							} else {
								reject(new Error("Could not read image file"));
							}
						};
						reader.onerror = (err) => reject(err);
						reader.readAsDataURL(imageFile);
					});

					memoryData.image = imageBase64;
					submittedData = await service.addMemory(memoryData);
				} else {
					submittedData = await service.addMemory(memoryData);
				}

				setMyMemories((prev) => [...prev, submittedData]);
				const refreshed = await service.getMemories(groupId);
				setMemoryList(refreshed);
				setMyMemories(
					refreshed.filter((m: Memory) => m.sessionId === sessionId.current)
				);
				resetFormFields();
			}
		} catch (error) {
			if (error instanceof Error) {
				console.error("Failed to submit:", error.message);
			} else {
				console.error("Failed to submit:", String(error));
				alert("Submission failed.");
			}
		} finally {
			setIsSubmitting(false);
			resetFormFields();
		}
	};

	const resetFormFields = () => {
		setMemory("");
		setTitle("");
		setPlace("");
		setDate(null);
		setImageFile(null);
		setImagePreview(null);
		setAuthor("");
		setShowPopup(false);
		setEditingId(null);
	};

	const handleEdit = () => {
		if (!selectedMemory) return;
		setTitle(selectedMemory.title || "");
		setMemory(selectedMemory.memory || "");
		setPlace(selectedMemory.place || "");
		try {
			if (selectedMemory.date) {
				// Assume it's in "YYYY-MM-DD" format — parse as local time
				const [year, month, day] = selectedMemory.date.split("-").map(Number);
				if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
					setDate(new Date(year, month - 1, day)); // <-- local midnight
				} else {
					setDate(null);
				}
			} else {
				setDate(null);
			}
		} catch {
			setDate(null);
		}

		setAuthor(selectedMemory.author || "");
		setImagePreview(selectedMemory.image || null);
		setShowDetail(false); // Close the detail view
		setShowPopup(true); // Open the form
		setEditingId(selectedMemory._id); // Track that we're editing
	};

	return (
		<div>
			{/* Title + dropdown */}
			<div className="container py-3">
				<div className="d-flex justify-content-center align-items-center gap-2 flex-wrap mb-2">
					<h2
						className="mb-0 text-center w-100"
						style={{ fontFamily: "Merriweather, serif", fontWeight: 600 }}
					>
						{person ? `Memory Wall for ${person.name}` : "Memory Wall"}
					</h2>
					{madeGroup?.expirationDate && (
						<p
							className="mb-0 text-center w-100 text-danger"
							style={{ fontWeight: 400, fontSize: "0.85rem" }}
						>
							This Memory Wall will Expire On{" "}
							{new Date(madeGroup.expirationDate).toLocaleDateString(
								undefined,
								{
									year: "numeric",
									month: "long",
									day: "numeric",
								}
							)}
							{" at "}
							{new Date(madeGroup.expirationDate).toLocaleTimeString(
								undefined,
								{
									hour: "2-digit",
									minute: "2-digit",
									hour12: true, // or false for 24-hour time
									timeZoneName: "short", // optional, shows "MDT" etc.
								}
							)}
						</p>
					)}{" "}
					<p
						className="mb-0 text-center w-100 text-danger"
						style={{
							fontSize: "0.75rem",
							color: "#b22222",
							fontWeight: 400,
							marginLeft: 8,
						}}
					>
						(This group and all memories will be deleted on this date or when
						admin publishes the memories to FamilySearch)
					</p>
				</div>

				{/* Portrait on its own row below */}
				{person && (
					<div className="d-flex justify-content-center mt-2">
						<img
							src={portraitUrl}
							alt="Portrait"
							className="img-fluid"
							style={{ height: "100px", borderRadius: "10%" }}
						/>
					</div>
				)}
			</div>

			{groupId && (
				<div className="d-flex flex-column align-items-center mt-1 gap-2">
					<div
						style={{ cursor: "pointer" }}
						onClick={() => setIsQRLightboxOpen(true)}
						className="text-center"
					>
						<QRCode
							value={`${window.location.origin}/join?groupId=${groupId}`}
							size={128}
							bgColor="white"
							fgColor="black"
							style={{ borderRadius: 8 }}
						/>
						<small className="text-muted d-block mt-1">
							Click to enlarge/download and share QR Code
						</small>
					</div>

					{isQRLightboxOpen && (
						<div
							className="popup-overlay"
							style={{ zIndex: 20000 }}
							onClick={() => setIsQRLightboxOpen(false)}
						>
							<div
								className="popup"
								style={{
									background: "white",
									borderRadius: 12,
									padding: 32,
									maxWidth: 420,
									boxShadow: "0 8px 28px rgba(0,0,0,0.22)",
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									cursor: "default",
								}}
								onClick={(e) => e.stopPropagation()}
							>
								<div ref={qrWrapperRef}>
									<QRCode
										value={`${window.location.origin}/join?groupId=${groupId}`}
										size={320}
										bgColor="white"
										fgColor="black"
										style={{ borderRadius: 8 }}
									/>
								</div>
								<small className="mt-3 mb-0" style={{ fontSize: "1.5rem" }}>
									Scan to join this group
								</small>
								<button
									type="button"
									className="btn btn-outline-primary mt-4"
									onClick={downloadQR}
								>
									Download QR as Image
								</button>
								<button
									type="button"
									className="btn btn-outline-secondary btn-sm mt-2"
									onClick={() => {
										const shareUrl = `${window.location.origin}/join?groupId=${groupId}`;
										if (navigator.share) {
											// Use the Web Share API if available (on most modern mobile browsers)
											navigator.share({
												title: "Join Memory Wall Group",
												text: `Join our Memory Wall group for ${person.name}!`,
												url: shareUrl,
											});
										} else {
											// Fallback: copy to clipboard
											navigator.clipboard.writeText(shareUrl);
											alert("Link copied to clipboard!");
										}
									}}
								>
									Share Link
								</button>
								<button
									type="button"
									className="btn btn-secondary mt-2"
									onClick={() => setIsQRLightboxOpen(false)}
								>
									Close
								</button>
							</div>
						</div>
					)}

					<div className="d-flex align-items-center justify-content-center gap-2">
						<CopyableGroupId groupId={groupId} />

						{isAdmin && (
							<div className="dropdown">
								<button
									className="btn btn-light btn-sm"
									type="button"
									id="adminDropdown"
									data-bs-toggle="dropdown"
									aria-expanded="false"
								>
									<i className="bi bi-three-dots-vertical"></i>
								</button>
								<ul className="dropdown-menu" aria-labelledby="adminDropdown">
									<li>
										<button
											className="dropdown-item"
											onClick={() => setShowConfirmPublish(true)}
										>
											Publish Memories to FamilySearch
										</button>
									</li>
									<li>
										<button
											className="dropdown-item"
											onClick={async () => {
												await exportMemoriesAsPDF(person.name, memoryList);
											}}
										>
											Export Memories
										</button>
									</li>
								</ul>
							</div>
						)}
					</div>
				</div>
			)}

			<button
				className="btn btn-primary fixed-add-button"
				onClick={() => setShowPopup(true)}
			>
				Add Memory
			</button>

			<TabbedMemoryWall
				myMemories={myMemories}
				otherMemories={memoryList}
				setSelectedMemory={setSelectedMemory}
				setShowDetail={setShowDetail}
				isAdmin={isAdmin}
			/>

			{showPopup && (
				<div className="popup-overlay">
					<div className="popup text-start">
						<h5>Write a Memory</h5>
						<form onSubmit={handleSubmit}>
							{/* Image Upload */}
							<div className="mb-3">
								<label className="form-label">
									Image <span className="text-muted small">(optional)</span>
								</label>
								<input
									ref={fileInputRef}
									type="file"
									className="form-control"
									accept=".jpg,.jpeg,.png,image/jpeg,image/png"
									onChange={async (e) => {
										const files = e.target.files;
										if (!files || files.length === 0) return;
										const file = files[0];

										try {
											const compressedFile = await imageCompression(file, {
												maxSizeMB: 1.5,
												maxWidthOrHeight: 1024,
												useWebWorker: true,
											});

											setImageFile(compressedFile);

											const reader = new FileReader();
											reader.onloadend = () => {
												const result = reader.result;
												if (typeof result === "string") {
													setImagePreview(result); // ✅ Safe
												} else {
													setImagePreview(null); // or handle error
												}
											};
											reader.readAsDataURL(compressedFile);
										} catch (error) {
											console.error("Image compression failed:", error);
										}
									}}
								/>
								{imagePreview && (
									<div className="position-relative mt-2">
										<img
											src={imagePreview}
											alt="Preview"
											className="img-fluid"
											style={{ maxHeight: "150px", borderRadius: "8px" }}
										/>
										<button
											type="button"
											className="btn btn-sm btn-danger position-absolute top-0 end-0"
											style={{ transform: "translate(50%, -50%)" }}
											onClick={() => {
												setImagePreview(null);
												setImageFile(null);
												if (fileInputRef.current)
													fileInputRef.current.value = "";
											}}
										>
											&times;
										</button>
									</div>
								)}
							</div>

							{/* Form Fields */}
							<div className="mb-3">
								<label className="form-label">Your Name</label>
								<input
									type="text"
									className="form-control"
									placeholder="Enter your full name"
									value={author}
									onChange={(e) => setAuthor(e.target.value)}
								/>
							</div>

							<div className="mb-3">
								<label className="form-label">
									Title<span className="text-danger small">* (required)</span>
								</label>
								<input
									type="text"
									className={`form-control ${
										errors && errors.title ? "is-invalid" : ""
									}`}
									placeholder="Story Title"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
								/>
								{errors && errors.title && (
									<div className="invalid-feedback">{errors.title}</div>
								)}
							</div>

							<div className="mb-3">
								<label className="form-label">
									Story<span className="text-danger small">* (required)</span>
								</label>
								<textarea
									className={`form-control ${
										errors && errors.memory ? "is-invalid" : ""
									}`}
									placeholder="I remember a time when…"
									rows={4}
									value={memory}
									onChange={(e) => setMemory(e.target.value)}
								/>
								{errors && errors.memory && (
									<div className="invalid-feedback">{errors.memory}</div>
								)}
							</div>

							<div className="mb-3">
								<label className="form-label">Place</label>
								<input
									type="text"
									className="form-control"
									placeholder="Enter a place"
									value={place}
									onChange={(e) => setPlace(e.target.value)}
								/>
							</div>

							<div className="mb-3">
								<label className="form-label">Date</label>
								<br></br>
								<DatePicker
									selected={date}
									onChange={(d: Date | null) => {
										setDate(d);
									}}
									className="form-control"
									placeholderText="Select a date"
									showMonthDropdown
									showYearDropdown
									dropdownMode="select" // Makes month/year dropdown scrollable!
									maxDate={new Date()}
								/>
							</div>

							<div className="d-flex justify-content-between mt-4">
								<button
									type="button"
									className="btn btn-outline-secondary me-2"
									onClick={() => resetFormFields()}
								>
									Cancel
								</button>
								<button
									type="submit"
									className="btn btn-primary"
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<>
											<span
												className="spinner-border spinner-border-sm me-2"
												role="status"
												aria-hidden="true"
											></span>
											{editingId ? "Updating..." : "Submitting..."}
										</>
									) : editingId ? (
										"Update Memory"
									) : (
										"Submit Memory"
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{showDetail && selectedMemory && (
				<div className="popup-overlay" onClick={() => setShowDetail(false)}>
					<div
						className="popup text-start"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Buttons at top */}
						<div className="d-flex justify-content-end align-items-start gap-2 mb-3">
							<button
								className="btn btn-secondary"
								onClick={() => setShowDetail(false)}
							>
								Close
							</button>

							{(isAdmin || selectedMemory.sessionId === sessionId.current) && (
								<button className="btn btn-danger" onClick={handleDeleteDetail}>
									Delete
								</button>
							)}

							{selectedMemory.sessionId === sessionId.current && (
								<button className="btn btn-success" onClick={handleEdit}>
									Edit
								</button>
							)}
						</div>
						<div
							style={{
								maxHeight: "200px",
								overflowX: "auto",
								whiteSpace: "pre-wrap",
								paddingRight: "0.5rem",
							}}
						>
							<h4 className="fw-bold">{selectedMemory.title}</h4>
						</div>
						{selectedMemory.author && (
							<div
								style={{
									maxHeight: "200px",
									overflowX: "auto",
									whiteSpace: "pre-wrap",
									paddingRight: "0.5rem",
								}}
							>
								<p className="fst-italic text-secondary">
									Shared by: {selectedMemory.author}
								</p>
							</div>
						)}
						{selectedMemory.image && (
							<>
								<img
									src={selectedMemory.image}
									alt="Memory"
									className="img-fluid mb-3"
									style={{
										maxHeight: "200px",
										borderRadius: "8px",
										cursor: "zoom-in",
									}}
									onClick={() => setIsLightboxOpen(true)}
								/>
								{isLightboxOpen && (
									<Lightbox
										open={isLightboxOpen}
										close={() => setIsLightboxOpen(false)}
										slides={[{ src: selectedMemory.image }]}
										carousel={{ finite: true }}
										render={{
											buttonPrev: () => null, // Hide left arrow
											buttonNext: () => null, // Hide right arrow
										}}
									/>
								)}
							</>
						)}

						<div
							style={{
								maxHeight: "200px",
								overflowY: "auto",
								whiteSpace: "pre-wrap",
								paddingRight: "0.5rem",
							}}
						>
							{selectedMemory.memory}
						</div>
						<small className="text-muted d-block mt-2">
							{selectedMemory.place && (
								<div
									style={{
										maxHeight: "200px",
										overflowX: "auto",
										whiteSpace: "pre-wrap",
										paddingRight: "0.5rem",
									}}
								>
									<span
										style={{
											display: "inline-flex",
											alignItems: "center",
											verticalAlign: "middle",
											whiteSpace: "nowrap",
											lineHeight: "1.2",
										}}
									>
										<span
											aria-label="place pin"
											role="img"
											style={{
												marginRight: 4,
												lineHeight: 1,
												verticalAlign: "middle",
											}}
										>
											📍
										</span>
										<span style={{ overflowWrap: "break-word" }}>
											{selectedMemory.place}
										</span>
									</span>
								</div>
							)}
							{selectedMemory.date && (
								<>
									📅{" "}
									{new Date(
										selectedMemory.date + "T00:00:00"
									).toLocaleDateString()}
								</>
							)}
						</small>
					</div>
				</div>
			)}
			{showConfirmPublish && (
				<div className="popup-overlay" style={overlayStyle}>
					<div className="popup text-center" style={publishPopupStyle}>
						<h5>Are you sure you want to publish?</h5>
						<p className="text-danger">
							After publishing, this group will be deleted with all associated
							memories.
						</p>
						<p className="text-muted">
							You’ll be redirected to sign in with FamilySearch.
						</p>
						<div className="d-flex justify-content-center gap-3 mt-3">
							<button
								className="btn btn-outline-secondary"
								onClick={() => setShowConfirmPublish(false)}
							>
								Cancel
							</button>
							<button
								className="btn btn-primary"
								onClick={() => {
									setShowSecondConfirm(true);
								}}
							>
								Yes, Continue
							</button>
						</div>
					</div>
					{showSecondConfirm && (
						<div className="popup-overlay" style={overlayStyle}>
							<div className="popup text-center" style={publishPopupStyle}>
								<h5 className="text-danger">
									After publishing, this group will be deleted with all
									associated memories.
								</h5>
								<p>
									Are you <strong>really</strong> sure you want to publish?
								</p>
								<p className="text-muted">
									You’ll be redirected to sign in with FamilySearch.
								</p>
								<div className="d-flex justify-content-center gap-3 mt-3">
									<button
										className="btn btn-outline-secondary"
										onClick={() => {
											setShowSecondConfirm(false);
											setShowConfirmPublish(false);
										}}
									>
										Cancel
									</button>
									<button
										className="btn btn-primary"
										onClick={() => {
											setShowSecondConfirm(false);
											setShowConfirmPublish(false);
											localStorage.setItem("groupId", groupId);
											localStorage.setItem("personId", person.id);
											const redirectUri = `${window.location.origin}${location.pathname}`;
											window.location.href = `https://auth.fhtl.org?redirect=${redirectUri}`;
										}}
									>
										Yes, Continue
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			)}
			{showButton && (
				<button
					className="btn btn-secondary fixed-return-top"
					onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
					aria-label="Return to top"
				>
					<i className="bi bi-arrow-up"></i> {/* Bootstrap icon if you want */}
				</button>
			)}

			{!(
				showPopup ||
				showDetail ||
				showConfirmPublish ||
				isQRLightboxOpen ||
				showHelp
			) && (
				<button
					className="help-button"
					style={{
						position: "fixed",
						top: 44,
						right: 24,
						zIndex: 10010,
						width: 48,
						height: 48,
						borderRadius: "50%",
						background: "#3574d5",
						color: "white",
						fontWeight: "bold",
						fontSize: 26,
						border: "none",
						boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
						cursor: "pointer",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
					aria-label="Help"
					title="Show instructions"
					onClick={() => setShowHelp(true)}
				>
					<i className="bi bi-question-circle"></i>
				</button>
			)}

			{showHelp && (
				<div
					className="popup-overlay"
					style={overlayStyle}
					onClick={() => setShowHelp(false)}
				>
					<div
						className="popup text-start"
						style={popupStyle}
						onClick={(e) => e.stopPropagation()}
					>
						<Instructions isPopup />
						<div style={{ textAlign: "right" }}>
							<button
								type="button"
								className="btn btn-secondary mt-2"
								onClick={() => setShowHelp(false)}
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

const overlayStyle: React.CSSProperties = {
	position: "fixed",
	top: 0,
	left: 0,
	height: "100vh",
	width: "100vw",
	backgroundColor: "rgba(0, 0, 0, 0.5)",
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	zIndex: 9999,
};

const popupStyle: React.CSSProperties = {
	backgroundColor: "#fff",
	padding: "0rem 2rem 2rem 2rem",
	borderRadius: "8px",
	boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
	maxWidth: "400px",
	width: "90%",
};

const messageBoxStyle: React.CSSProperties = {
	backgroundColor: "#fff",
	padding: "2rem",
	borderRadius: "8px",
	boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
	maxWidth: "400px",
	width: "90%",
	textAlign: "center",
};

const publishPopupStyle: React.CSSProperties = {
	...popupStyle,
	paddingTop: "3rem", // increase as desired for extra top padding
};
