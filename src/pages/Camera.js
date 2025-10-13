import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Camera.css';

export default function Camera() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectData = location.state?.projectData || {};
  
  const [hasPermission, setHasPermission] = useState(null);
  const [stream, setStream] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);
  const [permissionError, setPermissionError] = useState(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sample rooms with images from Figma
  const sampleRooms = [
    { id: 1, name: 'Sample 1', image: 'http://localhost:3845/assets/85781567a9e4bd2d1479218e7df0aa2b33c93055.png' },
    { id: 2, name: 'Sample 2', image: 'http://localhost:3845/assets/b934407848485bad177836903679af836c784914.png' },
    { id: 3, name: 'Sample 3', image: 'http://localhost:3845/assets/8d1663c9ca1d6a85ed274fde9e0f3bc95c8be139.png' },
    { id: 4, name: 'Sample 4', image: 'http://localhost:3845/assets/9801b05379c94a4d3f4d70dc2b544451c1084e0f.png' },
    { id: 5, name: 'Sample 5', image: 'http://localhost:3845/assets/3a62c24f3b92e55ee83ba7d3f9c436cacd80d05a.png' },
    { id: 6, name: 'Sample 6', image: 'http://localhost:3845/assets/010e35651690572181ed09b2593c617ac0849a74.png' },
    { id: 7, name: 'Sample 7', image: 'http://localhost:3845/assets/e182472dbf6b30a3362e4c9bae1cc213c800a09d.png' },
  ];

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const requestCameraPermission = async () => {
    setIsRequestingPermission(true);
    setPermissionError(null);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      
      setStream(mediaStream);
      setHasPermission(true);
      setIsRequestingPermission(false);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera permission error:', error);
      let errorMessage = 'Unable to access camera';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is in use';
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
        navigate('/photograph', { 
          state: { 
            projectData, 
            image: event.target.result 
          } 
        });
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
      
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/png');
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
      navigate('/photograph', { 
        state: { 
          projectData, 
          image: imageData 
        } 
      });
    }
  };

  const handleSampleSelect = (sample) => {
    setSelectedSample(sample);
    setTimeout(() => {
      navigate('/photograph', { 
        state: { 
          projectData, 
          image: sample.image,
          sampleRoom: sample 
        } 
      });
    }, 300);
  };

  const handleSkip = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    navigate('/photograph', { state: { projectData } });
  };

  const handleAddPhoto = () => {
    // Show options to either open camera or gallery
    if (!hasPermission) {
      requestCameraPermission();
    } else {
      handleGalleryAccess();
    }
  };

  return (
    <div className="camera-page-container">
      <div className="camera-page-content">
        {/* Top Menu */}
        <div className="camera-top-menu">
          <div className="menu-left">
            <div className="back-icon" onClick={() => navigate('/projects')}>
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

        {/* Main Camera Area */}
        <div className="main-camera-area">
          {!hasPermission && !isRequestingPermission && (
            <div className="camera-placeholder-box" onClick={handleAddPhoto}>
              <div className="camera-icon-circle">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M38 35a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2h7l3-5h12l3 5h7a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="20" cy="23" r="7" stroke="white" strokeWidth="2.5"/>
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
              <video ref={videoRef} autoPlay playsInline className="video-stream" />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              <div className="video-controls">
                <button className="gallery-btn-small" onClick={handleGalleryAccess}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
                    <polyline points="18,14 13,9 2,18" stroke="currentColor" strokeWidth="2"/>
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
        <div className="sample-rooms-container">
          <h3 className="sample-rooms-heading">Sample Rooms</h3>
          <div className="sample-rooms-scroll">
            {sampleRooms.map((sample) => (
              <div
                key={sample.id}
                className={`sample-room-item ${selectedSample?.id === sample.id ? 'selected' : ''}`}
                onClick={() => handleSampleSelect(sample)}
              >
                <img src={sample.image} alt={sample.name} className="sample-image" />
              </div>
            ))}
          </div>
        </div>

        {/* Skip Button */}
        <button className="skip-btn-bottom" onClick={handleSkip}>
          Skip
        </button>
      </div>

      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
