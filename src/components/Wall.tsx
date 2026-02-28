import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FuneralMemoryService } from "../service/FuneralMemoryService";
import "../styles/Wall.css";
import imageCompression from "browser-image-compression";
import TabbedMemoryWall from "./TabbedWall";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Memory } from "../model/Memory";
import { useFamilySearchResumePublish } from "./Publishing"; // or wherever you put it
import { exportMemoriesAsPDF } from "../service/exportMemoriesAsPDF";
import QRCode from "react-qr-code";
import Lightbox, { label } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Instructions from "./Instructions";
import heic2any from "heic2any";
import { fontWeight } from "html2canvas/dist/types/css/property-descriptors/font-weight";

// Simple icon components to replace react-bootstrap-icons
const ClipboardIcon = () => (
	<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ display: "inline-block", verticalAlign: "middle" }}>
		<path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
		<path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
	</svg>
);

const ClipboardCheckIcon = () => (
	<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ display: "inline-block", verticalAlign: "middle" }}>
		<path fillRule="evenodd" d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
		<path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
		<path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
	</svg>
);

const ThreeDotsIcon = () => (
	<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ display: "inline-block", verticalAlign: "middle" }}>
		<path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
	</svg>
);

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
			className={`copyable-group-id ${copied ? "copied" : ""}`}
			title={copied ? "Copied!" : "Click to copy"}
			onClick={handleCopy}
		>
			Group ID:{" "}
			<strong>{groupId}</strong>
			<span className="icon">
				{copied ? <ClipboardCheckIcon /> : <ClipboardIcon />}
			</span>
			{copied && (
				<span className="copied-text">
					Copied!
				</span>
			)}
		</span>
	);
}

interface MemErrors {
	author: string;
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
	const [showConfirmDelete, setShowConfirmDelete] = useState(false);
	const [showSecondConfirm, setShowSecondConfirm] = useState(false);
	const [isLightboxOpen, setIsLightboxOpen] = useState(false);
	const [showButton, setShowButton] = useState(false);
	const [isQRLightboxOpen, setIsQRLightboxOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const qrWrapperRef = useRef<HTMLDivElement>(null);
	const [showHelp, setShowHelp] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	localStorage.removeItem("hasConfirmed");

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
			await service.deleteMemory(groupId, selectedMemory.memoryId);
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

		let newErrors: MemErrors = { author: "", title: "", memory: "" };
		if (!author.trim()) newErrors.author = "Your name is required.";
		if (!title.trim()) newErrors.title = "Title is required.";
		if (!memory.trim()) newErrors.memory = "Story is required.";
		if (newErrors.author || newErrors.title || newErrors.memory) {
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

				let mem: Memory = myMemories.find((m) => m.memoryId === editingId)!;
				await service.updateMemory({
					memoryId: editingId,
					groupId: groupId!,
					title: title,
					memory: memory,
					place: place,
					date: date ? date.toISOString().split("T")[0] : "",
					image: imageBase64,
					author: author,
					createdAt: mem.createdAt,
					sessionId: mem.sessionId,
				});
			} else {
				// ADD MODE
				const memoryData: Memory = {
					memoryId: crypto.randomUUID(),
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

				setMyMemories((prev) => [...prev, memoryData]); //TODO::might need to debug (was submittedData)
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
		setEditingId(selectedMemory.memoryId); // Track that we're editing
	};

	return (
		<div className="wall-container">
			{/* Title + dropdown */}
			{groupId && (
				<div className="wall-info-div-div">
					{/* Hero Section */}
					<div className="wall-person-div">
						{person && (
							<div className="portrait-container">
								<img
									src={portraitUrl}
									alt="Portrait"
								/>
							</div>
						)}
						<div className="wall-name-div">
							<h1>{person.name}</h1>
							<h2>Memory Wall</h2>
						</div>
					</div>

					{/* QR + Group Info Card */}
					<div className="wall-share-div">
						{madeGroup?.expirationDate && (
							<p className="wall-warning-text">
								This Memory Wall will expire on{" "}
								<strong>
									{new Date(madeGroup.expirationDate).toLocaleDateString(
										undefined,
										{ year: "numeric", month: "long", day: "numeric" }
									)}
									{" at "}
									{new Date(madeGroup.expirationDate).toLocaleTimeString(
										undefined,
										{ hour: "2-digit", minute: "2-digit", hour12: true, timeZoneName: "short" }
									)}
								</strong>.
							</p>
						)}

						<div className="qr-info-card">
							{/* Left: QR Code */}
							<div
								className="qr-code-wrapper"
								onClick={() => setIsQRLightboxOpen(true)}
							>
								<QRCode
									value={`${window.location.origin}/join?groupId=${groupId}`}
									size={128}
									bgColor="#F5F5E6"
									fgColor="#1C495E"
								/>
								<small className="qr-helper-text">
									Click to enlarge/download<br />and share QR code
								</small>
							</div>

							{/* Right: Group ID + Settings */}
							<div className="qr-right-content">
								<CopyableGroupId groupId={groupId} />
								{isAdmin && (
									<div className="dropdown">
										<button
											className="btn btn-primary btn-sm settings-btn"
											type="button"
											onClick={() => setDropdownOpen(!dropdownOpen)}
										>
											Settings
										</button>
										<ul className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
											<li>
												<button
													className="dropdown-item"
													onClick={() => {
														setShowConfirmPublish(true);
														setDropdownOpen(false);
													}}
												>
													Publish Memories to FamilySearch
												</button>
											</li>
											<li>
												<button
													className="dropdown-item"
													onClick={async () => {
														await exportMemoriesAsPDF(person.name, memoryList);
														setDropdownOpen(false);
													}}
												>
													Export Memories
												</button>
											</li>
											<li>
												<button
													className="dropdown-item"
													onClick={() => setShowConfirmDelete(true)}
												>
													Delete Group
												</button>
											</li>
										</ul>
									</div>
								)}
							</div>
						</div>

						{/* QR Lightbox */}
						{isQRLightboxOpen && (
							<div
								className="popup-overlay qr-lightbox-overlay"
								onClick={() => setIsQRLightboxOpen(false)}
							>
								<div
									className="qr-lightbox-popup"
									onClick={(e) => e.stopPropagation()}
								>
									<div ref={qrWrapperRef}>
										<QRCode
											value={`${window.location.origin}/join?groupId=${groupId}`}
											size={320}
											bgColor="white"
											fgColor="black"
										/>
									</div>
									<small className="qr-lightbox-text">
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
												navigator.share({
													title: "Join Memory Wall Group",
													text: `Join our Memory Wall group for ${person.name}!`,
													url: shareUrl,
												});
											} else {
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
					</div>
				</div>
			)}

			<button
				className="btn btn-primary fixed-add-button"
				onClick={() => setShowPopup(true)}
			>
				Add Memory
			</button>

			<div className="wall-memory-section">
				<TabbedMemoryWall
					myMemories={myMemories}
					otherMemories={memoryList}
					setSelectedMemory={setSelectedMemory}
					setShowDetail={setShowDetail}
					isAdmin={isAdmin}
				/>
			</div>

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
									//accept=".jpg,.jpeg,.png,image/jpeg,image/png"
									accept="image/*"
									//capture="environment"
									onChange={async (e) => {
										const files = e.target.files;
										if (!files || files.length === 0) return;
										let file = files[0];

										try {
											if (
												file.type === "image/heic" ||
												file.type === "image/heif"
											) {
												const convertedBlob = await heic2any({
													blob: file,
													toType: "image/jpeg",
													quality: 0.9,
												});

												file = new File(
													[convertedBlob as Blob],
													file.name.replace(/\.[^.]+$/, ".jpg"), // rename extension
													{ type: "image/jpeg" }
												);
											}

											if (!["image/jpeg", "image/png"].includes(file.type)) {
												alert("Only JPG and PNG images are allowed.");
												return;
											}

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
									<div className="image-preview-container">
										<img
											src={imagePreview}
											alt="Preview"
											className="image-preview"
										/>
										<button
											type="button"
											className="btn btn-sm btn-danger remove-image-btn"
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
								<label className="form-label">
									Your Name
									<span className="text-danger small">* (required)</span>
								</label>
								<input
									type="text"
									className={`form-control ${
										errors && errors.author ? "is-invalid" : ""
									}`}
									placeholder="Enter your full name"
									value={author}
									onChange={(e) => setAuthor(e.target.value)}
								/>
								{errors && errors.author && (
									<div className="invalid-feedback">{errors.author}</div>
								)}
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

							<div className="form-actions">
								<button
									type="button"
									className="btn btn-outline-secondary"
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
												className="spinner"
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
						<div className="detail-buttons">
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
						<div className="detail-content">
							<h4 className="fw-bold">{selectedMemory.title}</h4>
						</div>
						{selectedMemory.author && (
							<div className="detail-content">
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
									className="detail-image"
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

						<div className="detail-content">
							{selectedMemory.memory}
						</div>
						<small className="detail-meta">
							{selectedMemory.place && (
								<div className="detail-content">
									<span className="place-pin">
										<span
											aria-label="place pin"
											role="img"
											className="place-pin-icon"
										>
											📍
										</span>
										<span className="place-pin-text">
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
				<div className="popup-overlay">
					<div className="popup publish-popup text-center">
						<h5>Are you sure you want to publish?</h5>
						<p className="text-danger">
							After publishing, this group will be deleted with all associated
							memories. This is your last chance to export the memories as a
							PDF. If you would like to do so, exit and do so now.
						</p>
						<p className="text-muted">
							You’ll be redirected to sign in with FamilySearch.
						</p>
						<div className="confirm-actions">
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
						<div className="popup-overlay">
							<div className="popup publish-popup text-center">
								<h5 className="text-danger">
									After publishing, this group and all associated memories will
									be permanently deleted. This is your last chance to export the
									memories as a PDF. If you would like to do so, exit and do so
									now.
								</h5>
								<p>
									Are you <strong>really</strong> sure you want to publish?
								</p>
								<p className="text-muted">
									You’ll be redirected to sign in with FamilySearch.
								</p>
								<div className="confirm-actions">
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
			{showConfirmDelete && (
				<div className="popup-overlay">
					<div className="popup publish-popup text-center">
						<h5>Are you sure you want to delete?</h5>
						<p className="text-danger">
							This group will be deleted with all associated memories. If you
							would like to publish the memories to Family Search or export them
							to a PDF, exit and do so now.
						</p>
						<div className="confirm-actions">
							<button
								className="btn btn-outline-secondary"
								onClick={() => setShowConfirmDelete(false)}
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
						<div className="popup-overlay">
							<div className="popup publish-popup text-center">
								<h5 className="text-danger">
									This group and all associated memories will be permanently
									deleted. This is your last chance to publish them to Family
									Search or export them as a PDF. If you would like to do so,
									exit and do so now.
								</h5>
								<p>
									Are you <strong>really</strong> sure you want to delete the
									group?
								</p>
								<div className="confirm-actions">
									<button
										className="btn btn-outline-secondary"
										onClick={() => {
											setShowSecondConfirm(false);
											setShowConfirmDelete(false);
										}}
									>
										Cancel
									</button>
									<button
										className="btn btn-primary"
										onClick={() => {
											setShowSecondConfirm(false);
											setShowConfirmDelete(false);
											service.deleteGroup(groupId);
											navigate("/");
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
			)}

			{showHelp && (
				<div
					className="popup-overlay"
					onClick={() => setShowHelp(false)}
				>
					<div
						className="popup text-start"
						onClick={(e) => e.stopPropagation()}
					>
						<Instructions isPopup />
						<div className="text-end">
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