import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSampleRooms } from "../api/Api";
import { downloadImageAsBase64 } from "../utils/ImageUtils";
import { getNextPage, NavigationState } from "../utils/NavigationState";
import "./Camera.css";

export default function Camera() {
  const navigate = useNavigate();
  const project = NavigationState.project || {};

  const [hasPermission, setHasPermission] = useState(null);

  const [stream, setStream] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);
  const [permissionError, setPermissionError] = useState(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sample rooms with images from Figma
  const [sampleRooms, setSampleRooms] = useState([]);

  useEffect(() => {
    fetchSampleRooms().then((data) => {
      console.log("Sample rooms:", data);
      setSampleRooms(data);
    });
  }, []);

  // Debug: hasPermission state değişimini takip et
  useEffect(() => {
    console.log("🔍 hasPermission state changed:", hasPermission);
  }, [hasPermission]);

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
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL("image/png");

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }

      NavigationState.image = imageData;
      navigate("/photograph");
    }
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
      // Fallback: original image kullan
      navigate("/photograph", {
        state: {
          project,
          image: sample.image,
          sampleRoom: sample,
        },
      });
    }
  };

  const handleSkip = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    navigate("/room-type", { state: { project } });
  };

  const handleAddPhoto = () => {
    console.log("📷 handleAddPhoto clicked, hasPermission:", hasPermission);
    // Show options to either open camera or gallery
    if (!hasPermission) {
      console.log("📷 Requesting camera permission...");
      requestCameraPermission();
    } else {
      console.log("📷 Opening gallery...");
      handleGalleryAccess();
    }
  };

  return (
    <div className="camera-main-container">
      <div className="main-camera-area">
        {!hasPermission && !isRequestingPermission && (
          <div className="camera-placeholder-box" onClick={handleAddPhoto}>
            <div className="camera-icon-circle">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path
                  d="M38 35a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2h7l3-5h12l3 5h7a2 2 0 0 1 2 2z"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="20"
                  cy="23"
                  r="7"
                  stroke="white"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
            <h3 className="placeholder-title">Add a photo</h3>
            <p className="placeholder-description">
              chose or take a photo for start redesign and beautiful your home.
            </p>
          </div>
        )}

        {isRequestingPermission && (
          <div className="camera-loading-box">
            <div className="spinner"></div>
            <p>Requesting camera...</p>
          </div>
        )}

        {hasPermission && !isRequestingPermission && (
          <div className="camera-video-box">
            {console.log(
              "🎬 Rendering video element with hasPermission:",
              hasPermission
            )}
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
          <div className="error-message">
            <span>{permissionError}</span>
          </div>
        )}
      </div>

      {/* Sample Rooms Section */}
      <div className="sample-rooms-container"></div>
      <div className="sample-rooms-container sample-rooms-container-absolute">
        <h3 className="sample-rooms-heading">Sample Rooms</h3>
        <div className="sample-rooms-scroll">
          {sampleRooms.map((sample) => (
            <div
              key={sample.id}
              className={`sample-room-item ${
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
            </div>
          ))}
        </div>
        <button className="skip-btn-bottom" onClick={handleSkip}>
          Skip
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}
