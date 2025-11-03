import React, { useState, useRef } from "react";
import "./HoverThumbnailButton.css";
import LoadingSpinner from "./LoadingSpinner";

const HoverThumbnailButton = ({
  id,
  imageUrl,
  title,
  isActive = false,
  isLoading = false,
  onClick,
  onPress,
  duration = 500,
  className = "",
  children,
  actions = [], // Array of { label: string, action: function, icon?: string }
  showPopup = true,
  ...props
}) => {
  const [hovered, setHovered] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [isPressed, setIsPressed] = useState(false);
  const pressTimer = useRef(null);
  const pressStartTime = useRef({ time: 0, pressed: false });

  const handleMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();

    pressStartTime.current.time = Date.now();
    pressStartTime.current.pressed = true;
    setIsPressed(true);

    // duration ms basılı tutulursa popup aç
    pressTimer.current = setTimeout(() => {
      if (pressStartTime.current.pressed) {
        setHovered(true);
        setPopupPosition({
          x: event.clientX,
          y: event.clientY,
        });
        // onPress callback varsa çağır
        if (onPress) {
          onPress(event);
        }
      }
    }, duration);
  };

  const handleTouchStart = (event) => {
    event.preventDefault();
    event.stopPropagation();

    pressStartTime.current.time = Date.now();
    pressStartTime.current.pressed = true;
    setIsPressed(true);

    // duration ms basılı tutulursa popup aç
    pressTimer.current = setTimeout(() => {
      if (pressStartTime.current.pressed) {
        const touch = event.touches[0];
        setHovered(true);
        setPopupPosition({
          x: touch.clientX,
          y: touch.clientY,
        });
        // onPress callback varsa çağır
        if (onPress) {
          onPress(event);
        }
      }
    }, duration);
  };

  const handleMouseUp = () => {
    pressStartTime.current.pressed = false;
    setIsPressed(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }

    // Kısa tıklama ise normal click
    const pressDuration = Date.now() - pressStartTime.current.time;
    if (pressDuration < duration && !hovered) {
      if (onClick) {
        onClick();
      }
    }
  };

  const handleTouchEnd = () => {
    pressStartTime.current.pressed = false;
    setIsPressed(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }

    // Kısa tıklama ise normal click
    const pressDuration = Date.now() - pressStartTime.current.time;
    if (pressDuration < duration && !hovered) {
      if (onClick) {
        onClick();
      }
    }
  };

  const handleMouseLeave = () => {
    cancelHover();
  };

  const handleTouchCancel = () => {
    cancelHover();
  };

  const handleMouseMove = () => {
    cancelHover();
  };

  const cancelHover = () => {
    pressStartTime.current.pressed = false;
    setIsPressed(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleTouchMove = () => {
    cancelHover();
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleAction = (action) => {
    if (action && typeof action === "function") {
      action();
    }
    setHovered(false);
  };

  return (
    <>
      <div
        id={id}
        className={`hover-thumbnail-button ${isActive ? "active" : ""} ${
          isPressed ? "pressed" : ""
        } ${className}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onTouchMove={handleTouchMove}
        onContextMenu={handleContextMenu}
        {...props}
      >
        {isLoading && (
          <LoadingSpinner
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
          />
        )}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title || ""}
            onError={(e) => {
              e.target.src = "/assets/logo_big.png";
            }}
            className="hover-thumbnail-image"
          />
        )}
        <div className="hover-thumbnail-overlay"></div>
        {title && <span className="hover-thumbnail-name">{title}</span>}
        {children}

        {/* Press indicator */}
        {isPressed && (
          <div className="press-indicator">
            <div className="press-ring"></div>
          </div>
        )}
      </div>

      {/* Popup Menu */}
      {showPopup && hovered && actions.length > 0 && (
        <>
          {/* Backdrop - popup'ı kapatmak için */}
          <div
            className="hover-thumbnail-popup-backdrop"
            onClick={() => setHovered(false)}
          />
          <div
            className="hover-thumbnail-popup"
            style={{
              position: "fixed",
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
              transform: "translate(-50%, -50%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hover-thumbnail-popup-content">
              {actions.map((actionItem, index) => (
                <button
                  key={index}
                  className="hover-thumbnail-popup-action"
                  onClick={() => handleAction(actionItem.action)}
                >
                  {actionItem.icon && (
                    <span className="hover-thumbnail-popup-icon">
                      {actionItem.icon}
                    </span>
                  )}
                  {actionItem.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default HoverThumbnailButton;
