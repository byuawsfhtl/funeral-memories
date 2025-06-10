import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FuneralMemoryService } from "../service/FuneralMemoryService";
import "./Wall.css";
import imageCompression from "browser-image-compression";
import Memory from "./Memory";
import TabbedMemoryWall from "./TabbedWall";

export default function Wall() {
  const [myMemories, setMyMemories] = useState([]);
  const [memoryList, setMemoryList] = useState([]);
  const [memory, setMemory] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState({});
  const [author, setAuthor] = useState("");
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const service = new FuneralMemoryService();
  const madeGroup = location.state?.madeGroup;
  const person = madeGroup?.ancestor;
  const groupId = madeGroup?.groupId;
  const portraitUrl = madeGroup?.portrait;
  const sessionId = useRef(
    localStorage.getItem("sessionId") || crypto.randomUUID()
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const checkAdmin = async () => {
    const sessions = await service.getAdminSessions(groupId);
    if (sessions.includes(sessionId.current)) {
      setIsAdmin(true);
    }
  };

  useEffect(() => {
    localStorage.setItem("sessionId", sessionId.current);
  }, []);

  useEffect(() => {
    if (showPopup) {
      document.body.classList.add("popup-open");
    } else {
      document.body.classList.remove("popup-open");
    }
    return () => {
      document.body.classList.remove("popup-open");
    };
  }, [showPopup]);

  useEffect(() => {
    if (!groupId) {
      navigate("/");
      return;
    }

    const fetchMemories = async () => {
      try {
        const data = await service.getMemories(groupId);
        setMemoryList(data);
        const mine = data.filter((m) => m.sessionId === sessionId.current);
        setMyMemories(mine);
      } catch (error) {
        console.error("Error fetching memories:", error);
      }
    };

    fetchMemories();
    const intervalId = setInterval(fetchMemories, 10000);
    return () => clearInterval(intervalId);
  }, [groupId, navigate]);

  useEffect(() => {
    if (groupId && sessionId.current) {
      checkAdmin();
    }
  }, [groupId, sessionId.current]);

  const handleDeleteDetail = async () => {
    if (!window.confirm("Are you sure you want to delete this memory?")) return;
    try {
      await service.deleteMemory(selectedMemory._id);
      setShowDetail(false);
      const refreshed = await service.getMemories(groupId);
      setMemoryList(refreshed);
      setMyMemories(refreshed.filter((m) => m.sessionId === sessionId.current));
    } catch (err) {
      console.error("Error deleting memory:", err.message);
      alert("Failed to delete memory.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!memory.trim()) newErrors.memory = "Story is required.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editingId) {
        const imageBase64 = imageFile
          ? await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(imageFile);
            })
          : imagePreview || null;

        await service.updateMemory(
          editingId,
          title,
          memory,
          place,
          date,
          imageBase64
        );
      } else {
        const memoryData = {
          groupId,
          title,
          memory,
          place,
          date,
          image: null,
          author,
          createdAt: new Date(),
          sessionId: sessionId.current,
        };

        if (imageFile) {
          const reader = new FileReader();
          reader.onloadend = async () => {
            memoryData.image = reader.result;
            const result = await service.addMemory(memoryData);
            setMyMemories((prev) => [...prev, result]);
            resetFormFields();
          };
          reader.readAsDataURL(imageFile);
          return;
        } else {
          const result = await service.addMemory(memoryData);
          setMyMemories((prev) => [...prev, result]);
        }
      }

      const refreshed = await service.getMemories(groupId);
      setMemoryList(refreshed);
      setMyMemories(refreshed.filter((m) => m.sessionId === sessionId.current));
      resetFormFields();
    } catch (error) {
      console.error("Failed to submit:", error.message);
      alert("Submission failed.");
    }
  };

  const resetFormFields = () => {
    setMemory("");
    setTitle("");
    setPlace("");
    setDate("");
    setImageFile(null);
    setImagePreview(null);
    setAuthor("");
    setShowPopup(false);
    setEditingId(null);
  };

  const handleEdit = () => {
    setTitle(selectedMemory.title || "");
    setMemory(selectedMemory.memory || "");
    setPlace(selectedMemory.place || "");
    setDate(selectedMemory.date || "");
    setAuthor(selectedMemory.author || "");
    setImagePreview(selectedMemory.image || null);
    setShowDetail(false);
    setShowPopup(true);
    setEditingId(selectedMemory._id);
  };

  return (
    <div>
      {/* ...header and add button... */}

      <TabbedMemoryWall
        myMemories={myMemories}
        otherMemories={memoryList}
        setSelectedMemory={setSelectedMemory}
        setShowDetail={setShowDetail}
        isAdmin={isAdmin}
      />

      {showDetail && selectedMemory && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div
            className="popup text-start"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Buttons at the top */}
            <div className="d-flex justify-content-end align-items-center gap-2 mb-3">
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
            <p>{selectedMemory.memory}</p>
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
