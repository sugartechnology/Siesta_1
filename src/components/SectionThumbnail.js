import React, { useState, useRef } from "react";
import EditableTitle from "./EditableTitle";
import SectionPopup from "./SectionPopup";
import "./SectionThumbnail.css";

const SectionThumbnail = ({
  section,
  index,
  isActive,
  onSectionClick,
  onTitleChange,
  onRemove,
  onViewDetails,
  duration = 500,
}) => {
  const [hoveredSection, setHoveredSection] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [isPressed, setIsPressed] = useState(false);
  const pressTimer = useRef(null);
  const pressStartTime = useRef(0);

  const handleMouseDown = (event) => {
    setIsPressed(true);
    pressStartTime.current = Date.now();

    // duration ms basılı tutulursa popup aç
    pressTimer.current = setTimeout(() => {
      if (isPressed) {
        setHoveredSection(section);
        setPopupPosition({
          x: event.clientX,
          y: event.clientY,
        });
      }
    }, duration);
  };

  const handleTouchStart = (event) => {
    // Prevent default touch behavior (like scrolling)
    event.preventDefault();

    setIsPressed(true);
    pressStartTime.current = Date.now();

    // duration ms basılı tutulursa popup aç
    pressTimer.current = setTimeout(() => {
      if (isPressed) {
        const touch = event.touches[0];
        setHoveredSection(section);
        setPopupPosition({
          x: touch.clientX,
          y: touch.clientY,
        });
      }
    }, duration);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }

    // Kısa tıklama ise normal click
    const pressDuration = Date.now() - pressStartTime.current;
    if (pressDuration < duration && !hoveredSection) {
      if (index !== 0) {
        onSectionClick(section);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }

    // Kısa tıklama ise normal click
    const pressDuration = Date.now() - pressStartTime.current;
    if (pressDuration < duration && !hoveredSection) {
      if (index !== 0) {
        onSectionClick(section);
      }
    }
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleTouchCancel = () => {
    setIsPressed(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleMouseMove = (event) => {
    if (hoveredSection) {
      setPopupPosition({
        x: event.clientX,
        y: event.clientY,
      });
    }
  };

  const handleTouchMove = (event) => {
    if (hoveredSection) {
      // Prevent scrolling when popup is open
      event.preventDefault();

      const touch = event.touches[0];
      setPopupPosition({
        x: touch.clientX,
        y: touch.clientY,
      });
    }
  };

  const handleRemoveSection = (sectionToRemove) => {
    onRemove(sectionToRemove);
    setHoveredSection(null);
  };

  const handleViewDetails = (sectionToView) => {
    onViewDetails(sectionToView);
    setHoveredSection(null);
  };

  return (
    <>
      <div
        className={`section-thumbnail ${isActive ? "active" : ""} ${
          isPressed ? "pressed" : ""
        }`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onTouchMove={handleTouchMove}
      >
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
            console.log("Section thumbnail image error:", e.target.src);
          }}
          className="section-thumbnail-image"
        />
        <div className="section-thumbnail-overlay"></div>
        {index === 0 ? (
          <EditableTitle
            style={{
              position: "absolute",
              left: "20px",
              top: "20px",
            }}
            value={section.title}
            onChange={onTitleChange}
            placeholder="Click to edit"
            className="section-thumbnail-name"
            autoFocus={false}
          />
        ) : (
          <span className="section-thumbnail-name">{section.title}</span>
        )}

        {/* Press indicator */}
        {isPressed && (
          <div className="press-indicator">
            <div className="press-ring"></div>
          </div>
        )}
      </div>

      {/* Section Popup */}
      <SectionPopup
        section={hoveredSection}
        position={popupPosition}
        onClose={() => setHoveredSection(null)}
        onViewDetails={handleViewDetails}
        onRemove={handleRemoveSection}
        isVisible={!!hoveredSection}
      />
    </>
  );
};

export default SectionThumbnail;
