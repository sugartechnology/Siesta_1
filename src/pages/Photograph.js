import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  applyImageTransformations,
  calculateLeftRotation,
  calculateRightRotation,
  toggleHorizontalFlip,
  toggleVerticalFlip,
} from "../utils/ImageUtils";
import { getNextPage, NavigationState } from "../utils/NavigationState";
import "./Photograph.css";
import { useTranslation } from "react-i18next";

export default function Photograph() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const project = NavigationState.project || {};
  const capturedImage = NavigationState.image || null;

  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (capturedImage) {
      applyTransformations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedImage, rotation, flipHorizontal, flipVertical]);

  const applyTransformations = async () => {
    if (!capturedImage) return;

    try {
      const transformedImage = await applyImageTransformations(
        capturedImage,
        rotation,
        flipHorizontal,
        flipVertical
      );
      setProcessedImage(transformedImage);
    } catch (error) {
      console.error("Error applying transformations:", error);
    }
  };

  const handleRotateLeft = () => {
    setRotation(calculateLeftRotation);
  };

  const handleRotateRight = () => {
    setRotation(calculateRightRotation);
  };

  const handleFlipHorizontal = () => {
    setFlipHorizontal(toggleHorizontalFlip);
  };

  const handleFlipVertical = () => {
    setFlipVertical(toggleVerticalFlip);
  };

  const handleNext = () => {
    const finalImage = processedImage || capturedImage;
    const nextPage = getNextPage("photograph", { image: finalImage });
    navigate(nextPage);
  };

  const handleRetake = () => {
    navigate("/camera", { state: { project } });
  };

  return (
    <div className="photograph-page-content">
      {/* Image Editor Area */}
      <div className="image-editor-container">
        {capturedImage ? (
          <div className="image-with-grid">
            {/* Display the transformed image */}
            <div className="image-display-wrapper">
              <img
                ref={imageRef}
                src={processedImage || capturedImage}
                alt="Selected"
                className="edited-image"
              />
              {/* Hidden canvas for processing */}
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>

            {/* Grid Overlay */}
            <div className="grid-overlay">
              {/* Corner markers */}
              <div className="corner-marker top-left"></div>
              <div className="corner-marker top-right"></div>
              <div className="corner-marker bottom-left"></div>
              <div className="corner-marker bottom-right"></div>

              {/* Grid lines */}
              <div
                className="grid-line vertical"
                style={{ left: "33.33%" }}
              ></div>
              <div
                className="grid-line vertical"
                style={{ left: "66.66%" }}
              ></div>
              <div
                className="grid-line horizontal"
                style={{ top: "33.33%" }}
              ></div>
              <div
                className="grid-line horizontal"
                style={{ top: "66.66%" }}
              ></div>
            </div>

            {/* Control Buttons */}
            <div className="image-controls">
              <div className="controls-left">
                <button
                  className="control-btn"
                  onClick={handleFlipHorizontal}
                  title={t('photograph.flipHorizontal')}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2V22M12 2L7 7M12 2L17 7M12 22L7 17M12 22L17 17"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect
                      x="10"
                      y="8"
                      width="4"
                      height="8"
                      fill="white"
                      opacity="0.3"
                    />
                  </svg>
                </button>
                <button
                  className="control-btn"
                  onClick={handleFlipVertical}
                  title={t('photograph.flipVertical')}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M2 12H22M2 12L7 7M2 12L7 17M22 12L17 7M22 12L17 17"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect
                      x="8"
                      y="10"
                      width="8"
                      height="4"
                      fill="white"
                      opacity="0.3"
                    />
                  </svg>
                </button>
              </div>

              {/* Next Button */}
              {capturedImage && (
                <button className="next-btn-bottom" onClick={handleNext}>
                  {t('common.next')}
                </button>
              )}

              <div className="controls-right">
                <button
                  className="control-btn"
                  onClick={handleRotateLeft}
                  title={t('photograph.rotateLeft')}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M4 8V12H8"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  className="control-btn"
                  onClick={handleRotateRight}
                  title={t('photograph.rotateRight')}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M20 8V12H16"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-image-state">
            <div className="no-image-icon">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                <rect
                  x="10"
                  y="20"
                  width="80"
                  height="60"
                  rx="5"
                  stroke="currentColor"
                  strokeWidth="3"
                  opacity="0.3"
                />
                <circle
                  cx="30"
                  cy="40"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="3"
                  opacity="0.3"
                />
                <path
                  d="M10 65L35 45L50 55L90 30V80H10V65Z"
                  stroke="currentColor"
                  strokeWidth="3"
                  opacity="0.3"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3>{t('photograph.noPhoto')}</h3>
            <p>{t('photograph.goBackDesc')}</p>
            <button className="back-to-camera-btn" onClick={handleRetake}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M19 17a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3l2-3h4l2 3h3a2 2 0 0 1 2 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle
                  cx="10"
                  cy="12"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              {t('photograph.backToCamera')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
