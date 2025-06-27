import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FuneralMemoryService } from "../service/FuneralMemoryService";
import "./Wall.css";
import imageCompression from "browser-image-compression";
import TabbedMemoryWall from "./TabbedWall";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Memory } from "../model/Memory";
import Publish from "./Publish";
import { useFamilySearchResumePublish } from "./Publishing"; // or wherever you put it

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
  useFamilySearchResumePublish();
  const navigate = useNavigate();
  const location = useLocation();

  const handlePublish = async () => {
    const token = localStorage.getItem("fstoken");
    if (!token || !person?.id || !groupId)
      return alert("Missing token/person/group");
    try {
      const results = await service.publishMemoriesToFamilySearch(
        groupId as string,
        person.id,
        token
      );
      console.log("Publish results:", results);
      alert(`Published ${results.filter((r) => r.success).length} memories!`);
    } catch (e) {
      console.error("Publish failed:", e);
      alert("Publish failed");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("fstoken");

    if (token) {
      localStorage.setItem("fstoken", token);
      console.log(token);

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
    const handleScroll = () => {
      const footer = document.querySelector("footer");
      const button = document.querySelector(".fixed-add-button") as HTMLElement;

      if (!button) return;

      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (footerRect.top < windowHeight) {
          const overlap = windowHeight - footerRect.top + 16;
          button.style.bottom = `${overlap}px`;
        } else {
          button.style.bottom = "24px";
        }
      } else {
        // No footer — just default position
        button.style.bottom = "24px";
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
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

    // Admin checker effect (add this at the bottom of your useEffects

    const fetchMemories = async () => {
      try {
        const data = await service.getMemories(groupId);
        setMemoryList(data);
        const mine = data.filter(
          (m: Memory) => m.sessionId === sessionId.current
        );

        setMyMemories(mine); // you'll display this separately
        setMemoryList(data);
      } catch (error) {
        console.error("Error fetching memories:", error);
      }
    };

    fetchMemories();

    const intervalId = setInterval(fetchMemories, 10000);

    return () => clearInterval(intervalId);
  }, [groupId, navigate]);

  useEffect(() => {
    alert(`groupId: ${groupId}, sessionId: ${sessionId.current}`);
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

        if (imageFile) {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const result1 = reader.result;
            if (typeof result1 === "string") {
              memoryData.image = result1;
            } else {
              memoryData.image = null;
            }
            console.log("Memory being submitted:", memoryData);
            const result = await service.addMemory(memoryData);
            setMyMemories((prev) => [...prev, result]);
            resetFormFields();
            setIsSubmitting(false);
          };
          reader.readAsDataURL(imageFile);
          return;
        } else {
          console.log("Memory being submitted:", memoryData);

          const result = await service.addMemory(memoryData);
          setMyMemories((prev) => [...prev, result]);
        }
      }

      // Refresh after edit or add
      const refreshed = await service.getMemories(groupId);
      setMemoryList(refreshed);
      setMyMemories(
        refreshed.filter((m: Memory) => m.sessionId === sessionId.current)
      );
      resetFormFields();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to submit:", error.message);
      } else {
        console.error("Failed to submit:", String(error));
        alert("Submission failed.");
      }
    } finally {
      setIsSubmitting(false);
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
      <div className="pt-3 pb-3 text-center">
        <h2
          className="text-center"
          style={{ fontFamily: "Merriweather, serif", fontWeight: 600 }}
        >
          {person ? `Memory Wall for ${person.name}` : "Memory Wall"}
        </h2>

        {person && (
          <img
            src={portraitUrl}
            alt="Portrait"
            className="img-fluid mt-2"
            style={{ height: "100px", borderRadius: "10%" }}
          />
        )}

        <p className="text-muted mt-2" style={{ fontSize: "0.9rem" }}>
          Group ID: {groupId}
        </p>
      </div>

      {isAdmin && (
        <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
          <Publish
            groupId={groupId}
            personId={person.id}
            token={localStorage.getItem("fstoken") || ""}
          />
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
                  type="file"
                  className="form-control"
                  accept="image/*"
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

            <h4 className="fw-bold">{selectedMemory.title}</h4>
            {selectedMemory.author && (
              <p className="fst-italic text-secondary">
                Shared by: {selectedMemory.author}
              </p>
            )}
            {selectedMemory.image && (
              <img
                src={selectedMemory.image}
                alt="Memory"
                className="img-fluid mb-3"
                style={{ maxHeight: "200px", borderRadius: "8px" }}
              />
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
              {selectedMemory.place && <>📍 {selectedMemory.place} &nbsp;</>}
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
    </div>
  );
}
