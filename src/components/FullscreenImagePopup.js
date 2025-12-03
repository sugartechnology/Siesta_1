import { useEffect, useState } from "react";
import "./FullscreenImagePopup.css";

const FullscreenImagePopup = ({ 
  imageUrl, // Tek resim için backward compatibility
  images, // Birden fazla resim için array
  initialIndex = 0, // Başlangıç index'i
  isVisible, 
  onClose 
}) => {
  // images array'i varsa onu kullan, yoksa imageUrl'i array'e çevir
  const imageArray = images && images.length > 0 ? images : (imageUrl ? [imageUrl] : []);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // isVisible değiştiğinde currentIndex'i sıfırla
  useEffect(() => {
    if (isVisible) {
      setCurrentIndex(initialIndex);
    }
  }, [isVisible, initialIndex]);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (imageArray.length > 1) {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? imageArray.length - 1 : prevIndex - 1
      );
    }
  };

  const handleNext = () => {
    if (imageArray.length > 1) {
      setCurrentIndex((prevIndex) => 
        prevIndex === imageArray.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      onClose();
    } else if (event.key === "ArrowLeft") {
      handlePrevious();
    } else if (event.key === "ArrowRight") {
      handleNext();
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
  }, [isVisible, imageArray.length]);

  if (!isVisible || imageArray.length === 0) return null;

  const currentImageUrl = imageArray[currentIndex] || "/assets/logo_big.png";
  const hasMultipleImages = imageArray.length > 1;

  return (
    <div className="fullscreen-popup-backdrop" onClick={handleBackdropClick}>
      <div className="fullscreen-popup-container">
        <button className="fullscreen-popup-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Previous Button */}
        {hasMultipleImages && (
          <button 
            className="fullscreen-popup-nav fullscreen-popup-nav-left" 
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            aria-label="Previous image"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* Next Button */}
        {hasMultipleImages && (
          <button 
            className="fullscreen-popup-nav fullscreen-popup-nav-right" 
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next image"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18L15 12L9 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        <div className="fullscreen-popup-image-container">
          <img
            src={currentImageUrl}
            alt={`Fullscreen view ${currentIndex + 1} of ${imageArray.length}`}
            className="fullscreen-popup-image"
            onError={(e) => {
              console.log("Fullscreen image error:", e.target.src);
              e.target.src = "/assets/logo_big.png";
            }}
          />
        </div>

        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="fullscreen-popup-counter">
            {currentIndex + 1} / {imageArray.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default FullscreenImagePopup;
