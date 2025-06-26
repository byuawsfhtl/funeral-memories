// PublishButton.tsx

interface PublishProps {
  groupId: string;
  personId: string;
  token: string;
}
import React, { useState } from "react";
import { FuneralMemoryService } from "../service/FuneralMemoryService";

export const signin = () => {
  const redirectUri = `${window.location.origin}${location.pathname}`;
  window.location.href = `https://auth.fhtl.org?redirect=${redirectUri}`;
};

export default function PublishButton(props: PublishProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const service = new FuneralMemoryService();

  const handlePublishClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);

    const token = localStorage.getItem("fs_access_token");
    localStorage.setItem("groupId", props.groupId);
    localStorage.setItem("personId", props.personId);

    // Save groupId for after redirect

    const redirectUri = `${window.location.origin}${location.pathname}`;
    window.location.href = `https://auth.fhtl.org?redirect=${redirectUri}`;
    return;
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <div className="text-end p-3">
        <button className="btn btn-success" onClick={handlePublishClick}>
          Publish
        </button>
      </div>
      {showConfirm && (
        <div className="popup-overlay" style={overlayStyle}>
          <div className="popup text-center" style={popupStyle}>
            <h5>Are you sure you want to publish?</h5>
            <p className="text-muted">
              You’ll be redirected to sign in with FamilySearch.
            </p>
            <div className="d-flex justify-content-center gap-3 mt-3">
              <button
                className="btn btn-outline-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirm}>
                Yes, Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
  padding: "2rem",
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
  maxWidth: "400px",
  width: "90%",
};
