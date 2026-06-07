import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSampleRooms } from "../api/Api";
import { downloadImageAsBase64 } from "../utils/ImageUtils";
import { getNextPage, NavigationState } from "../utils/NavigationState";
import DesignFlowNav from "../components/DesignFlowNav";
import "./Camera.css";
import { useTranslation } from "react-i18next";

export default function Camera() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const project = NavigationState.project || {};

  const [hasPermission, setHasPermission] = useState(null);

  const [stream, setStream] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);
  const [permissionError, setPermissionError] = useState(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const mainContainerRef = useRef(null);

  // Sample rooms with images from Figma
  const [sampleRooms, setSampleRooms] = useState([]);

  useEffect(() => {
    fetchSampleRooms()
      .then((data) => {
        console.log("Sample rooms:", data);
        setSampleRooms(data);
      })
      .catch((error) => {
        console.error("Error loading sample rooms:", error);
        setSampleRooms([]);
      });
  }, []);

  // Video element render edildikten sonra stream'i bağla
  useEffect(() => {
    if (hasPermission && stream && videoRef.current) {
      console.log("🔗 Connecting stream to video element after render");
      videoRef.current.srcObject = stream;

      // Video element'inin yüklenmesini bekle
      videoRef.current.onloadedmetadata = () => {
        console.log("✅ Video metadata loaded, starting playback");
        videoRef.current.play().catch(console.error);
      };

      // Video element'inin stream aldığını kontrol et
      videoRef.current.oncanplay = () => {
        console.log("✅ Video can play, stream is ready");
        console.log(
          "📐 Video dimensions:",
          videoRef.current.videoWidth,
          "x",
          videoRef.current.videoHeight
        );
      };

      videoRef.current.onerror = (error) => {
        console.error("❌ Video error:", error);
      };
    }
  }, [hasPermission, stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Keep track of fullscreen state so we can apply CSS and exit when needed
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync state when user presses ESC or browser changes fullscreen state
  useEffect(() => {
    const handler = () => {
      const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
      setIsFullscreen(!!fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
    };
  }, []);

  const requestCameraPermission = async () => {
    console.log("🎥 Starting camera permission request...");
    setIsRequestingPermission(true);
    setPermissionError(null);

    try {
      console.log("🎥 Requesting media stream...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      console.log("🎥 Media stream obtained:", mediaStream);
      console.log("🎥 Stream tracks:", mediaStream.getTracks());

      setStream(mediaStream);
      setHasPermission(true);
      setIsRequestingPermission(false);

      // Enter fullscreen view for the camera area when permission is granted
      enterFullscreen();

      console.log("🎥 Video ref current:", videoRef.current);
      console.log("ℹ️ Stream will be connected after video element renders");
    } catch (error) {
      console.error("Camera permission error:", error);
      let errorMessage = "Unable to access camera";

      if (error.name === "NotAllowedError") {
        errorMessage = "Camera permission denied";
      } else if (error.name === "NotFoundError") {
        errorMessage = "No camera found";
      } else if (error.name === "NotReadableError") {
        errorMessage = "Camera is in use";
      }

      setPermissionError(errorMessage);
      setHasPermission(false);
      setIsRequestingPermission(false);
    }
  };

  const enterFullscreen = async () => {
    try {
      const el = mainContainerRef.current || document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      // Non-fatal: continue without native fullscreen but apply CSS fullscreen class
      console.warn("Could not enter native fullscreen:", err);
      setIsFullscreen(true);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Could not exit native fullscreen:", err);
    } finally {
      setIsFullscreen(false);
    }
  };

  const handleGalleryAccess = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        NavigationState.image = event.target.result;
        navigate("/photograph");
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = () => {
    (async () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL("image/png");

        // Exit fullscreen before navigating away so the app restores correctly
        await exitFullscreen();

        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }

        NavigationState.image = imageData;
        navigate("/photograph");
      }
    })();
  };

  const handleSampleSelect = async (sample) => {
    setSelectedSample(sample);

    try {
      // Image URL'ini download et ve base64'e çevir
      const base64Image = await downloadImageAsBase64(sample.imageUrl);
      // Sonraki sayfayı belirle
      const nextPage = getNextPage("camera", { image: base64Image });
      navigate(nextPage);
    } catch (error) {
      console.error("Error downloading sample image:", error);
      alert(t("camera.sampleImageError"));
    }
  };

  const handleSkip = () => {
    (async () => {
      await exitFullscreen();

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }

      navigate(getNextPage("photograph"));
    })();
  };

  return (
    <div
      className={`camera-main-container ${isFullscreen ? "fullscreen" : ""}`}
      ref={mainContainerRef}
    >
      {!isFullscreen && <DesignFlowNav currentStepId="camera" />}
      <div className="main-camera-area">
        {!hasPermission && !isRequestingPermission && (
          <div className="camera-picker-box">
            <p className="camera-picker-text">{t("camera.addPhotoDesc")}</p>
            <div className="camera-picker-actions">
              <button
                type="button"
                className="camera-action-btn"
                onClick={requestCameraPermission}
              >
                <span className="camera-action-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="13"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.75"
                    />
                  </svg>
                </span>
                <span>{t("camera.takePhoto")}</span>
              </button>
              <button
                type="button"
                className="camera-action-btn camera-action-btn--secondary"
                onClick={handleGalleryAccess}
              >
                <span className="camera-action-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.75"
                    />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                    <path
                      d="M21 15l-5-5L5 21"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>{t("camera.chooseGallery")}</span>
              </button>
            </div>
          </div>
        )}

        {isRequestingPermission && (
          <div className="camera-loading-box">
            <div className="spinner"></div>
            <p>{t('camera.requestingCamera')}</p>
          </div>
        )}

        {hasPermission && !isRequestingPermission && (
          <div className="camera-video-box">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="video-stream"
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            <div className="video-controls">
              <button
                className="gallery-btn-small"
                onClick={handleGalleryAccess}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect
                    x="2"
                    y="2"
                    width="16"
                    height="16"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle cx="7" cy="7" r="1.5" fill="currentColor" />
                  <polyline
                    points="18,14 13,9 2,18"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>

              <button className="capture-btn-large" onClick={capturePhoto}>
                <div className="capture-inner-circle"></div>
              </button>

              <div className="control-spacer"></div>
            </div>
          </div>
        )}

        {permissionError && (
          <div className="cm-error-message">
            <span>{t('camera.permissionError')}</span>
          </div>
        )}
      </div>

      {/* Sample Rooms Section */}
      <div className="sample-rooms-shell">
        <div className="sample-rooms-section">
          <div className="sample-rooms-header">
            <h3 className="sample-rooms-heading">{t("camera.sampleRooms")}</h3>
            <p className="sample-rooms-hint">{t("camera.sampleRoomsHint")}</p>
          </div>
          <div className="sample-rooms-scroll" role="list">
            {sampleRooms.map((sample) => (
              <button
                type="button"
                key={sample.id}
                role="listitem"
                className={`sample-room-card ${
                  selectedSample?.id === sample.id ? "selected" : ""
                }`}
                onClick={() => handleSampleSelect(sample)}
              >
                <img
                  loading="lazy"
                  src={sample.thumbnailUrl}
                  alt={sample.name}
                  className="sample-image"
                />
                <span className="sample-room-name">{sample.name}</span>
              </button>
            ))}
          </div>
          <button type="button" className="skip-btn-bottom" onClick={handleSkip}>
            {t("common.next")}
          </button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
