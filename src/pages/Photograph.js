import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Photograph.css';

export default function Photograph() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectData = location.state?.projectData || {};
  const capturedImage = location.state?.image || null;
  
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

  const applyTransformations = () => {
    if (!capturedImage) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      
      // Calculate canvas size based on rotation
      const isRotated = rotation === 90 || rotation === 270;
      canvas.width = isRotated ? img.height : img.width;
      canvas.height = isRotated ? img.width : img.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Save context state
      ctx.save();

      // Move to center
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply flips
      ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);

      // Draw image centered
      ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);

      // Restore context state
      ctx.restore();

      // Get processed image
      setProcessedImage(canvas.toDataURL('image/png'));
    };
    img.src = capturedImage;
  };

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFlipHorizontal = () => {
    setFlipHorizontal((prev) => !prev);
  };

  const handleFlipVertical = () => {
    setFlipVertical((prev) => !prev);
  };

  const handleNext = () => {
    const finalImage = processedImage || capturedImage;
    navigate('/room-type', { 
      state: { 
        projectData, 
        image: finalImage,
        transformations: {
          rotation,
          flipHorizontal,
          flipVertical
        }
      } 
    });
  };

  const handleRetake = () => {
    navigate('/camera', { state: { projectData } });
  };

  return (
    <div className="photograph-page-container">
      <div className="photograph-page-content">
        {/* Top Menu */}
        <div className="photograph-top-menu">
          <div className="menu-left">
            <div className="back-icon" onClick={handleRetake}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M20 24L12 16L20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="menu-item" onClick={() => navigate('/home')}>Home</span>
            <span className="menu-item">Collections</span>
            <span className="menu-item" onClick={() => navigate('/projects')}>Projects</span>
          </div>
          <div className="menu-center">
            <img src="/assets/logo.png" alt="Siesta" className="logo" />
          </div>
          <div className="menu-right">
            <div className="profile-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M23.3333 24.5V22.1667C23.3333 20.9906 22.8609 19.862 22.0103 19.0114C21.1597 18.1609 20.0311 17.6875 18.8542 17.6875H9.14583C7.96875 17.6875 6.8401 18.1609 5.9895 19.0114C5.13891 19.862 4.66667 20.9906 4.66667 22.1667V24.5" stroke="black" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 14C16.5773 14 18.6667 11.9106 18.6667 9.33333C18.6667 6.75609 16.5773 4.66667 14 4.66667C11.4228 4.66667 9.33333 6.75609 9.33333 9.33333C9.33333 11.9106 11.4228 14 14 14Z" stroke="black" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

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
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>

              {/* Grid Overlay */}
              <div className="grid-overlay">
                {/* Corner markers */}
                <div className="corner-marker top-left"></div>
                <div className="corner-marker top-right"></div>
                <div className="corner-marker bottom-left"></div>
                <div className="corner-marker bottom-right"></div>
                
                {/* Grid lines */}
                <div className="grid-line vertical" style={{ left: '33.33%' }}></div>
                <div className="grid-line vertical" style={{ left: '66.66%' }}></div>
                <div className="grid-line horizontal" style={{ top: '33.33%' }}></div>
                <div className="grid-line horizontal" style={{ top: '66.66%' }}></div>
              </div>

              {/* Control Buttons */}
              <div className="image-controls">
                <div className="controls-left">
                  <button 
                    className="control-btn" 
                    onClick={handleFlipHorizontal}
                    title="Flip Horizontal"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2V22M12 2L7 7M12 2L17 7M12 22L7 17M12 22L17 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="10" y="8" width="4" height="8" fill="white" opacity="0.3"/>
                    </svg>
                  </button>
                  <button 
                    className="control-btn" 
                    onClick={handleFlipVertical}
                    title="Flip Vertical"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M2 12H22M2 12L7 7M2 12L7 17M22 12L17 7M22 12L17 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="8" y="10" width="8" height="4" fill="white" opacity="0.3"/>
                    </svg>
                  </button>
                </div>

                <div className="controls-right">
                  <button 
                    className="control-btn" 
                    onClick={handleRotateLeft}
                    title="Rotate Left"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M4 8V12H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button 
                    className="control-btn" 
                    onClick={handleRotateRight}
                    title="Rotate Right"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M20 8V12H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-image-state">
              <div className="no-image-icon">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                  <rect x="10" y="20" width="80" height="60" rx="5" stroke="currentColor" strokeWidth="3" opacity="0.3"/>
                  <circle cx="30" cy="40" r="8" stroke="currentColor" strokeWidth="3" opacity="0.3"/>
                  <path d="M10 65L35 45L50 55L90 30V80H10V65Z" stroke="currentColor" strokeWidth="3" opacity="0.3" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>No Photo Available</h3>
              <p>Please go back and select or capture a photo</p>
              <button className="back-to-camera-btn" onClick={handleRetake}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M19 17a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3l2-3h4l2 3h3a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="10" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Back to Camera
              </button>
            </div>
          )}
        </div>

        {/* Next Button */}
        {capturedImage && (
          <button className="next-btn-bottom" onClick={handleNext}>
            Next
          </button>
        )}

        {/* Transformation Info */}
        {capturedImage && (
          <div className="transformation-info">
            <span>Rotation: {rotation}°</span>
            {flipHorizontal && <span>• Flipped H</span>}
            {flipVertical && <span>• Flipped V</span>}
          </div>
        )}
      </div>
    </div>
  );
}
