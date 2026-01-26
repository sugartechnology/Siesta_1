import React, { useState, useRef } from "react";
import "./HoverThumbnailButton.css";
import LoadingSpinner from "./LoadingSpinner";
import EditableTitle from "./EditableTitle";
import { useTranslation } from "react-i18next";

const HoverThumbnailButton = ({
  id,
  imageUrl,
  title,
  isActive = false,
  isLoading = false,
  onClick,
  onPress,
  onImageClick,
  duration = 500,
  className = "",
  children,
  actions = [], // Array of { label: string, action: function, icon?: string }
  showPopup = true,
  // EditableTitle props
  editable = false, // Title editable olsun mu?
  onTitleChange, // Title değiştiğinde callback
  titlePlaceholder = "Click to edit",
  titleStyle = {}, // EditableTitle için custom style
  titleClassName = "", // EditableTitle için custom className
  ...props
}) => {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [isPressed, setIsPressed] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState(null); // { message, onConfirm, onCancel }
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
        // Eğer tek action varsa ve requireConfirmation true ise direkt confirmation göster
        if (actions.length === 1 && actions[0].requireConfirmation) {
          setConfirmationDialog({
            message: actions[0].confirmationMessage || t('common.areYouSure'),
            onConfirm: () => {
              actions[0].action();
              setConfirmationDialog(null);
            },
            onCancel: () => {
              setConfirmationDialog(null);
            },
          });
        } else {
          // Normal popup menü göster
          setHovered(true);
          setPopupPosition({
            x: event.clientX,
            y: event.clientY,
          });
        }
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
        // Eğer tek action varsa ve requireConfirmation true ise direkt confirmation göster
        if (actions.length === 1 && actions[0].requireConfirmation) {
          const touch = event.touches[0];
          setConfirmationDialog({
            message: actions[0].confirmationMessage || t('common.areYouSure'),
            onConfirm: () => {
              actions[0].action();
              setConfirmationDialog(null);
            },
            onCancel: () => {
              setConfirmationDialog(null);
            },
          });
        } else {
          // Normal popup menü göster
          const touch = event.touches[0];
          setHovered(true);
          setPopupPosition({
            x: touch.clientX,
            y: touch.clientY,
          });
        }
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

  const handleAction = (actionItem) => {
    if (!actionItem || typeof actionItem.action !== "function") {
      setHovered(false);
      return;
    }

    // Confirmation gerekiyorsa custom dialog göster
    if (actionItem.requireConfirmation) {
      setHovered(false); // Action popup'ını kapat
      setConfirmationDialog({
        message: actionItem.confirmationMessage || t('common.areYouSure'),
        onConfirm: () => {
          actionItem.action();
          setConfirmationDialog(null);
        },
        onCancel: () => {
          setConfirmationDialog(null);
        },
      });
      return;
    }

    // Action'ı direkt çalıştır
    actionItem.action();
    setHovered(false);
  };

  return (
    <>
      <div
        id={id}
        className={`hover-thumbnail-button ${isActive ? "active" : ""} ${isPressed ? "pressed" : ""
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
            onClick={(e) => {  // ← این handler را اضافه کنید
              if (onImageClick) {
                e.stopPropagation();
                onImageClick();
              }
            }}

            style={{ cursor: onImageClick ? 'pointer' : 'default' }}
            className="hover-thumbnail-image"
          />
        )}
        <div className="hover-thumbnail-overlay"></div>
        {title && (
          <>
            {editable && onTitleChange ? (
              <EditableTitle
                value={title}
                onChange={onTitleChange}
                placeholder={titlePlaceholder}
                className={titleClassName}
                style={{
                  position: "absolute",
                  left: "20px",
                  top: isActive ? "20px" : "auto",
                  bottom: isActive ? "auto" : "20px",
                  ...titleStyle,
                }}
                autoFocus={false}
              />
            ) : (
              <span className={titleClassName}>{title}</span>
            )}
          </>
        )}
        {children}

        {/* Press indicator */}
        {isPressed && (
          <div className="hover-thumbnail-press-indicator">
            <div className="hover-thumbnail-press-ring"></div>
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
                  onClick={() => handleAction(actionItem)}
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

      {/* Confirmation Dialog */}
      {confirmationDialog && (
        <>
          <div
            className="hover-thumbnail-confirmation-backdrop"
            onClick={confirmationDialog.onCancel}
          />
          <div className="hover-thumbnail-confirmation-dialog">
            <div className="hover-thumbnail-confirmation-content">
              <p className="hover-thumbnail-confirmation-message">
                {confirmationDialog.message}
              </p>
              <div className="hover-thumbnail-confirmation-buttons">
                <button
                  className="hover-thumbnail-confirmation-button cancel"
                  onClick={confirmationDialog.onCancel}
                >
                  {t('common.cancel')}
                </button>
                <button
                  className="hover-thumbnail-confirmation-button confirm"
                  onClick={confirmationDialog.onConfirm}
                >
                  {t('common.confirm')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default HoverThumbnailButton;
