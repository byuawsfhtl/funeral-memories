import React from "react";
import { FuneralMemoryService } from "../service/FuneralMemoryService";

export default function Memory({
  mem,
  setSelectedMemory,
  setShowDetail,
  canDelete,
}) {
  const service = new FuneralMemoryService();

  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent click from opening detail
    if (!window.confirm("Are you sure you want to delete this memory?")) return;

    try {
      await service.deleteMemory(mem._id);
      window.location.reload(); // simplest way to refresh (or lift state update up)
    } catch (err) {
      console.error("Error deleting memory:", err.message);
      alert("Failed to delete memory.");
    }
  };

  return (
    <li
      className="memory border rounded m-2 d-flex align-items-center justify-content-center text-center position-relative"
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
  );
}
