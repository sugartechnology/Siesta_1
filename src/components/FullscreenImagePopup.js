import { useEffect } from "react";
import "./FullscreenImagePopup.css";

const FullscreenImagePopup = ({ imageUrl, isVisible, onClose }) => {
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isVisible]);

  if (!isVisible) return null;
  return (
    <div className="fullscreen-popup-backdrop" onClick={handleBackdropClick}>
      <div className="fullscreen-popup-container">
        <button className="fullscreen-popup-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="fullscreen-popup-image-container">
          <img
            src={imageUrl}
            alt="Fullscreen view"
            className="fullscreen-popup-image"
            onError={(e) => {
              console.log("Fullscreen image error:", e.target.src);
              e.target.src = "/assets/logo_big.png";
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FullscreenImagePopup;
