import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SplashScreen.css';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [slidePosition, setSlidePosition] = useState(0); // Start at 0% (left side)
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  // Figma images
  const imgBackground = "http://localhost:3845/assets/d768a7a251075cf13c0d907658d5ea975fba9acb.png"; // Same image for both sides initially
  const imgBackground2 = "http://localhost:3845/assets/ae25a4843c5bd7005f0c41828da7a5456c4b59be.png"; // Second image revealed by slider
  const imgLogo = "http://localhost:3845/assets/56b68463c1acec5ac9da8e728326a8fb6cf8482d.png";
  const imgSliderIcon = "http://localhost:3845/assets/82ba8b157643e9384321e0e4dd74d303c9c2cb00.svg";

  // Automatic slider animation from left to right
  useEffect(() => {
    const startTime = Date.now();
    const duration = 4500; // 4.5 seconds to slide across

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-in-out animation
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      const newPosition = easeProgress * 100;
      setSlidePosition(newPosition);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // After animation completes, redirect to login
        setTimeout(() => {
          navigate('/login');
        }, 500);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [navigate]);

  const handleStart = (clientX) => {
    setIsDragging(true);
    startX.current = clientX;
  };

  const handleMove = (clientX) => {
    if (!isDragging) return;

    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
    const diff = clientX - startX.current;
    const deltaPercent = (diff / containerWidth) * 100;
    const newPosition = Math.max(0, Math.min(100, slidePosition + deltaPercent));
    
    setSlidePosition(newPosition);
    startX.current = clientX;
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Mouse events
  const handleMouseDown = (e) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  return (
    <div className="splash-screen-new" ref={containerRef}>
      {/* Background Images Container */}
      <div className="splash-images-container">
        {/* Left Image (Same background initially) */}
        <div 
          className="splash-image-left"
          style={{
            width: `${slidePosition}%`
          }}
        >
          <img src={imgBackground} alt="Outdoor Space" className="splash-bg-image" />
          
          {/* Text Overlay on Left */}
          <div className="splash-text-overlay">
            <h2 className="splash-heading">Design Spaces With</h2>
            <h1 className="splash-brand-name">Siesta AI</h1>
          </div>
        </div>

        {/* Right Image (Same background, reveals second image) */}
        <div 
          className="splash-image-right"
          style={{
            width: `${100 - slidePosition}%`,
            left: `${slidePosition}%`
          }}
        >
          {slidePosition > 0 ? (
             <img src={imgBackground} alt="Outdoor Space" className="splash-bg-image" />
          ) : (
            <img src={imgBackground2} alt="Interior Space" className="splash-bg-image" />
          )}
          
          {/* Logo in Bottom Right */}
          <div className="splash-logo-bottom">
            <img src={imgLogo} alt="Siesta Exclusive" className="siesta-logo" />
          </div>
        </div>
      </div>

      {/* Slider Control */}
      <div 
        className="splash-slider-control"
        style={{ left: `${slidePosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="slider-button">
          <img src={imgSliderIcon} alt="Slider" className="slider-icon-img" />
        </div>
        
        {/* Vertical Line */}
        <div className="slider-vertical-line"></div>
      </div>
    </div>
  );
};

export default SplashScreen;
