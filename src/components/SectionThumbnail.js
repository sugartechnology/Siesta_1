import React, { useState, useRef } from "react";
import EditableTitle from "./EditableTitle";
import SectionPopup from "./SectionPopup";
import "./SectionThumbnail.css";
import LoadingSpinner from "./LoadingSpinner";

const SectionThumbnail = ({
  key,
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
    event.preventDefault();
    event.stopPropagation();

    pressStartTime.current = Date.now();
    pressStartTime.pressed = true;

    // duration ms basılı tutulursa popup aç
    pressTimer.current = setTimeout(() => {
      if (pressStartTime.pressed) {
        setHoveredSection(section);
        setPopupPosition({
          x: event.clientX,
          y: event.clientY,
        });
      }
    }, duration);
  };

  const handleTouchStart = (event) => {
    // Prevent default touch behavior (like scrolling and context menu)
    event.preventDefault();
    event.stopPropagation();

    pressStartTime.current = Date.now();
    pressStartTime.pressed = true;

    // duration ms basılı tutulursa popup aç
    pressTimer.current = setTimeout(() => {
      console.log("handleTouchStart timeout", pressStartTime.pressed);
      if (pressStartTime.pressed) {
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
    pressStartTime.pressed = false;
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }

    // Kısa tıklama ise normal click
    const pressDuration = Date.now() - pressStartTime.current;
    if (pressDuration < duration && !hoveredSection) {
      if (!isActive) {
        onSectionClick(section);
      }
    }
  };

  const handleTouchEnd = () => {
    pressStartTime.pressed = false;
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }

    // Kısa tıklama ise normal click
    const pressDuration = Date.now() - pressStartTime.current;
    if (pressDuration < duration && !hoveredSection) {
      if (!isActive) {
        //onSectionClick(section);
      }
    }
  };

  const handleMouseLeave = () => {
    cancelHover();
  };

  const handleTouchCancel = () => {
    cancelHover();
  };

  const handleMouseMove = (event) => {
    cancelHover();
  };

  const cancelHover = () => {
    pressStartTime.pressed = false;
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleTouchMove = (event) => {
    cancelHover();
  };

  const handleContextMenu = (event) => {
    console.log("handleContextMenu", event);
    event.preventDefault();
    event.stopPropagation();
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
        id={key}
        className={`section-thumbnail ${isActive ? "active" : ""} ${
          pressStartTime.pressed ? "pressed" : ""
        }`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onTouchMove={handleTouchMove}
        onContextMenu={handleContextMenu}
      >
        {section.design && section.design.status === "PROCESSING" && (
          <LoadingSpinner
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
        <img
          src={
            (section.design && section.design.thumbnailUrl) ||
            (section.design && section.design.resultImageUrl) ||
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
        {isActive ? (
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
        {pressStartTime.pressed && (
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
