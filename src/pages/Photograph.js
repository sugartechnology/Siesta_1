import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  applyImageTransformations,
  calculateLeftRotation,
  calculateRightRotation,
  toggleHorizontalFlip,
  toggleVerticalFlip,
} from "../utils/ImageUtils";
import {
  getNextPage,
  NavigationState,
  updateNavigationState,
} from "../utils/NavigationState";
import DesignFlowNav from "../components/DesignFlowNav";
import "./Photograph.css";
import { useTranslation } from "react-i18next";

const hasProductsInSection = () => {
  const sectionProducts = NavigationState.section?.productIds || [];
  const selectedProducts = NavigationState.selectedProducts || [];
  return sectionProducts.length > 0 || selectedProducts.length > 0;
};

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

    if (hasProductsInSection()) {
      updateNavigationState({ image: finalImage });
      navigate("/section-details");
      return;
    }

    const nextPage = getNextPage("photograph", { image: finalImage });
    navigate(nextPage);
  };

  const hasProducts = hasProductsInSection();

  const handleRetake = () => {
    navigate("/camera", { state: { project } });
  };

  return (
    <div className="photograph-page-content">
      <DesignFlowNav currentStepId="photograph" />
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

          </div>
        ) : (
          <div className="no-image-state">
            <div className="no-image-icon" aria-hidden="true">
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
            <p className="no-image-badge">{t("photograph.uploadRequired")}</p>
            <h3>{t("photograph.noPhoto")}</h3>
            <p>{t("photograph.uploadRequiredDesc")}</p>
            <button type="button" className="back-to-camera-btn" onClick={handleRetake}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
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
              {t("photograph.uploadPhotoCta")}
            </button>
          </div>
        )}
      </div>

      {capturedImage && (
        <div className="photograph-actions">
          <div className="transform-toolbar" role="toolbar" aria-label="Image adjustments">
            <div className="transform-group">
              <button
                type="button"
                className="transform-btn"
                onClick={handleFlipHorizontal}
                title={t("photograph.flipHorizontal")}
                aria-label={t("photograph.flipHorizontal")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="transform-btn"
                onClick={handleFlipVertical}
                title={t("photograph.flipVertical")}
                aria-label={t("photograph.flipVertical")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <span className="transform-divider" aria-hidden="true" />

            <div className="transform-group">
              <button
                type="button"
                className="transform-btn"
                onClick={handleRotateLeft}
                title={t("photograph.rotateLeft")}
                aria-label={t("photograph.rotateLeft")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 20a8 8 0 1 0-8-8"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                  <path
                    d="M4 8v4h4"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="transform-btn"
                onClick={handleRotateRight}
                title={t("photograph.rotateRight")}
                aria-label={t("photograph.rotateRight")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 20a8 8 0 1 1 8-8"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 8v4h-4"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <button type="button" className="choose-product-btn" onClick={handleNext}>
            <span>
              {hasProducts ? t("products.goToDesign") : t("photograph.chooseProduct")}
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
