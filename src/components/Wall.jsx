import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FuneralMemoryService } from "../service/FuneralMemoryService";
import "./Wall.css";

export default function Wall() {
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
  const socketRef = useRef(null);
  const service = new FuneralMemoryService();
  //const username = location.state?.username;
  //
  const madeGroup = location.state?.madeGroup;
  const person = madeGroup?.ancestor;

  //const queryParams = new URLSearchParams(location.search);
  // const groupId = location.state?.groupId;
  //   const portraitUrl = `https://api.familysearch.org/platform/tree/persons/${
  //     person.id
  //   }/portrait?default=https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png&access_token=${sessionStorage.getItem(
  //     "yourKey"
  //   )}`;

  //const [refreshKey, setRefreshKey] = useState(0);

  const groupId = madeGroup?.groupId;
  //console.log("Wall loaded with:", { groupId, username, password, person });

  useEffect(() => {
    console.log("check for group ID", groupId);
    if (!groupId) {
      navigate("/");
      return;
    }
    console.log("got groupID", groupId);

    const fetchMemories = async () => {
      try {
        const data = await service.getMemories(groupId);
        setMemoryList(data);
      } catch (error) {
        console.error("Error fetching memories:", error);
      }
    };

    fetchMemories();

    const intervalId = setInterval(fetchMemories, 10000);

    return () => clearInterval(intervalId);

    // const protocol = window.location.protocol === "http:" ? "ws" : "wss";
    // const socketUrl = `${protocol}://${window.location.host}/ws`;
    // console.log("🛰️ Connecting to WebSocket at:", socketUrl);

    // const socket = new WebSocket(socketUrl);
    // socketRef.current = socket;

    // socket.onopen = () => {
    //   console.log("✅ WebSocket connected");
    //   socket.send(JSON.stringify({ action: "join", groupId }));
    // };

    // socket.onmessage = (event) => {
    //   console.log("📨 Message received:", event.data);
    //   const receivedMemory = JSON.parse(event.data);
    //   if (receivedMemory.pastMemories) {
    //     setMemoryList(receivedMemory.pastMemories);
    //   } else {
    //     setMemoryList((prev) => [...prev, receivedMemory]);
    //   }
    // };

    // socket.onerror = (err) => {
    //   console.error("❌ WebSocket error:", err);
    // };

    // socket.onclose = (event) => {
    //   console.log("🛑 WebSocket closed:", event.code, event.reason);
    // };

    // return () => {
    //   console.log("🔌 Cleaning up WebSocket connection");
    //   socket.close();
    // };
  }, [groupId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!memory.trim()) newErrors.memory = "Story is required.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const memoryData = {
      groupId,
      title,
      memory,
      place,
      date,
      image: null,
      author,
      createdAt: new Date(),
    };

    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        memoryData.image = reader.result;
        socketRef.current.send(JSON.stringify(memoryData));
        resetFormFields();
      };
      reader.readAsDataURL(imageFile);
    } else {
      socketRef.current.send(JSON.stringify(memoryData));
      resetFormFields();
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
  };

  return (
    <div>
      <div className="pt-3 pb-3 text-center">
        <h2
          className="text-center"
          style={{ fontFamily: "Merriweather, serif", fontWeight: 600 }}
        >
          Memory Wall for
          {/*{person.name}*/}
        </h2>

        {/* Show portrait image with rounded corners */}
        {person && (
          <img
            src={portraitUrl}
            alt="Portrait"
            className="img-fluid mt-2"
            style={{ height: "100px", borderRadius: "10%" }}
          />
        )}

        {/* Smaller group ID below */}
        <p className="text-muted mt-2" style={{ fontSize: "0.9rem" }}>
          Group ID: {groupId}
        </p>
      </div>

      <ul className="memory-wall d-flex flex-wrap justify-content-center">
        {memoryList.map((mem, index) => (
          <li
            className="memory border rounded m-2 d-flex align-items-center justify-content-center text-center"
            key={index}
            onClick={() => {
              setSelectedMemory(mem);
              setShowDetail(true);
            }}
            style={{
              cursor: "pointer",
              height: "250px",
              width: "300px",
              padding: "1rem",
              backgroundColor: "#f0f0f0",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div>
              <h5 className="fw-bold">{mem.title || "Untitled"}</h5>
              {mem.author && (
                <p className="fst-italic mb-1 text-secondary">
                  Shared by: {mem.author}
                </p>
              )}
              {mem.image && (
                <img
                  src={mem.image}
                  alt="Memory"
                  className="img-fluid mb-2"
                  style={{
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              )}
              {mem.memory && (
                <p
                  className="memory-preview mb-0"
                  style={{
                    maxHeight: "3.6em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {mem.memory}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="pt-3 pb-3 px-3">
        <button className="btn btn-primary" onClick={() => setShowPopup(true)}>
          Add Memory
        </button>
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
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setImageFile(file);
                    const reader = new FileReader();
                    reader.onloadend = () => setImagePreview(reader.result);
                    if (file) reader.readAsDataURL(file);
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
                  className={`form-control ${errors.title ? "is-invalid" : ""}`}
                  placeholder="Story Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {errors.title && (
                  <div className="invalid-feedback">{errors.title}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Story<span className="text-danger small">* (required)</span>
                </label>
                <textarea
                  className={`form-control ${
                    errors.memory ? "is-invalid" : ""
                  }`}
                  placeholder="I remember a time when…"
                  rows={4}
                  value={memory}
                  onChange={(e) => setMemory(e.target.value)}
                />
                {errors.memory && (
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
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-between mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary me-2"
                  onClick={() => setShowPopup(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Memory
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
            <div className="mt-3">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDetail(false)}
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
