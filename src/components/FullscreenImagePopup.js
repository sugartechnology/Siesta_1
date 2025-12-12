import { useEffect, useState } from "react";
import "./FullscreenImagePopup.css";

const FullscreenImagePopup = ({
  imageUrl, // Tek resim için backward compatibility
  images, // Birden fazla resim için array
  initialIndex = 0, // Başlangıç index'i
  isVisible,
  onClose,
}) => {
  // images array'i varsa onu kullan, yoksa imageUrl'i array'e çevir
  const imageArray =
    images && images.length > 0 ? images : imageUrl ? [imageUrl] : [];
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1); // Zoom state
  const [lastDistance, setLastDistance] = useState(0); // For pinch zoom tracking
  const [offsetX, setOffsetX] = useState(0); // Drag offset X
  const [offsetY, setOffsetY] = useState(0); // Drag offset Y
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);

  // isVisible değiştiğinde currentIndex'i sıfırla
  useEffect(() => {
    if (isVisible) {
      setCurrentIndex(initialIndex);
      setZoomLevel(1); // Reset zoom when modal opens
      setOffsetX(0); // Reset drag offset
      setOffsetY(0);
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

  const handleDownload = async () => {
    try {
      if (
        window.webkit &&
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers.downloadImage
      ) {
        window.webkit.messageHandlers.downloadImage.postMessage({
          url: currentImageUrl,
        });
      } else {
        // Fallback: eski yöntem (web tarayıcıda)

        const link = document.createElement("a");
        link.href = currentImageUrl;
        link.download = `image-${currentIndex + 1}-${Date.now()}.jpg`;
        link.click();
      }
    } catch (error) {
      console.error("Download failed:", error);

      alert("Failed to download image. Please try again.");
    }
  };

  // Pinch zoom for touch devices
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      setLastDistance(distance);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );

      if (lastDistance > 0) {
        const scale = distance / lastDistance;
        setZoomLevel((prev) => {
          const newZoom = prev * scale;
          return Math.min(Math.max(newZoom, 1), 5); // Min 1x, Max 5x
        });
      }
      setLastDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    setLastDistance(0);
    setIsDragging(false);
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStartX(e.clientX - offsetX);
      setDragStartY(e.clientY - offsetY);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      e.preventDefault();
      setOffsetX(e.clientX - dragStartX);
      setOffsetY(e.clientY - dragStartY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag handlers for mobile
  const handleTouchDragStart = (e) => {
    if (e.touches.length === 1 && zoomLevel > 1) {
      setIsDragging(true);
      setDragStartX(e.touches[0].clientX - offsetX);
      setDragStartY(e.touches[0].clientY - offsetY);
    }
  };

  const handleTouchDragMove = (e) => {
    if (isDragging && e.touches.length === 1 && zoomLevel > 1) {
      e.preventDefault();
      setOffsetX(e.touches[0].clientX - dragStartX);
      setOffsetY(e.touches[0].clientY - dragStartY);
    }
  };

  // Mouse wheel zoom for desktop
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1; // Zoom out if scroll down, zoom in if scroll up
    setZoomLevel((prev) => {
      const newZoom = prev * delta;
      return Math.min(Math.max(newZoom, 1), 5); // Min 1x, Max 5x
    });
  };

  useEffect(() => {
    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.overflow = "unset";
    };
  }, [
    isVisible,
    imageArray.length,
    isDragging,
    dragStartX,
    dragStartY,
    offsetX,
    offsetY,
    zoomLevel,
  ]);

  if (!isVisible || imageArray.length === 0) {
    console.warn(
      "FullscreenImagePopup: NOT RENDERING - isVisible =",
      isVisible,
      "imageArray.length =",
      imageArray.length
    );
    return null;
  }

  const currentImageUrl = imageArray[currentIndex] || "/assets/logo_big.png";
  const hasMultipleImages = imageArray.length > 1;

  console.log(
    "FullscreenImagePopup: RENDERING MODAL - isVisible =",
    isVisible,
    "URL =",
    currentImageUrl
  );

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

        <div
          className="fullscreen-popup-image-container"
          onTouchStart={handleTouchStart}
          onTouchMove={(e) => {
            if (e.touches.length === 2) {
              handleTouchMove(e);
            } else if (e.touches.length === 1) {
              handleTouchDragMove(e);
            }
          }}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
        >
          <img
            src={currentImageUrl}
            alt={`Fullscreen view ${currentIndex + 1} of ${imageArray.length}`}
            className="fullscreen-popup-image"
            style={{
              transform: `scale(${zoomLevel}) translate(${offsetX}px, ${offsetY}px)`,
              transition: isDragging ? "none" : "transform 0.1s ease-out",
              cursor:
                zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "pointer",
            }}
            onError={(e) => {
              console.log("Fullscreen image error:", e.target.src);
              e.target.src = "/assets/logo_big.png";
            }}
            onTouchStart={handleTouchDragStart}
          />
        </div>
        <div className="fullscreen-download-btn">
          <button
            className="fullscreen-download-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            aria-label="Download image"
            title="Download this image"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
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
