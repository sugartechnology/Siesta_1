import React from "react";
import "./SectionPopup.css";

const SectionPopup = ({
  section,
  position,
  onClose,
  onViewDetails,
  onRemove,
  isVisible,
}) => {
  if (!isVisible || !section) return null;

  return (
    <div
      className="section-popup"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1000,
        width: "100vw",
        height: "100vh",
        background: "#0000004a",
        display: "flex",
        alignContent: "center",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="popup-content">
        <div className="popup-header">
          <h3 className="popup-title">{section.title}</h3>
          <div className="popup-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        <div className="popup-body">
          <div className="popup-image">
            <img
              src={
                section.thumbnailUrl ||
                section.resultImageUrl ||
                section.rootImageUrl ||
                "/assets/logo_big.png"
              }
              alt={section.title}
              onError={(e) => {
                e.target.src = "/assets/logo_big.png";
              }}
            />
          </div>
          <div className="popup-info">
            <div className="popup-item">
              <span className="popup-label">Room Type:</span>
              <span className="popup-value">{section.type || "Not set"}</span>
            </div>
            <div className="popup-item">
              <span className="popup-label">Products:</span>
              <span className="popup-value">
                {section.productIds ? section.productIds.length : 0} items
              </span>
            </div>
            <div className="popup-item">
              <span className="popup-label">Status:</span>
              <span className="popup-value">{section.status || "Active"}</span>
            </div>
          </div>
        </div>
        <div className="popup-footer">
          <div className="popup-actions">
            <button
              className="popup-action-btn secondary"
              onClick={() => {
                onRemove(section);
                onClose();
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M12 4L4 12M4 4L12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Remove
            </button>
            {/*<button
              className="popup-action-btn primary"
              onClick={() => {
                onViewDetails(section);
                onClose();
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 8H14M8 2V14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              View Details
            </button>*/}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionPopup;
