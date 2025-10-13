import React, { useState, useEffect } from 'react';
import './LocationMapModal.css';

export default function LocationMapModal({ isOpen, onClose, onSelectLocation, currentLocation }) {
  const [markerPosition, setMarkerPosition] = useState(currentLocation || null);
  const [locationName, setLocationName] = useState('');
  const [zoom, setZoom] = useState(1);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    if (currentLocation) {
      setMarkerPosition(currentLocation);
    }
  }, [currentLocation]);

  // Request user's location on mount
  useEffect(() => {
    if (isOpen && !markerPosition) {
      requestUserLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Set marker at center (50%, 50%) to represent user's location
        const userPosition = {
          x: 50,
          y: 50,
          lat: latitude,
          lng: longitude
        };
        
        setMarkerPosition(userPosition);
        setLocationName(`Your Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        setIsLocating(false);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred.';
        }
        setLocationError(errorMessage);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert click position to percentage
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    
    // Simulate coordinates (in real app, use actual map library)
    const lat = 41.0082 + (yPercent - 50) * 0.01;
    const lng = 28.9784 + (xPercent - 50) * 0.01;
    
    setMarkerPosition({ x: xPercent, y: yPercent, lat, lng });
    setLocationName(`Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3)); // Max zoom 3x
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5)); // Min zoom 0.5x
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const handleConfirm = () => {
    if (markerPosition && locationName) {
      onSelectLocation(locationName, { lat: markerPosition.lat, lng: markerPosition.lng });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="map-modal-backdrop" onClick={onClose} />
      <div className="location-map-modal">
        <div className="map-modal-header">
          <h3>Select Location</h3>
          <button className="map-close-btn" onClick={onClose}>
            <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
              <path d="M16 5L5 16M5 5L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="map-instructions">
          <p>Click anywhere on the map to pin your location</p>
          {isLocating && (
            <div className="locating-indicator">
              <div className="spinner"></div>
              <span>Getting your location...</span>
            </div>
          )}
          {locationError && (
            <div className="location-error">
              <span>{locationError}</span>
              <button className="retry-location-btn" onClick={requestUserLocation}>
                Try Again
              </button>
            </div>
          )}
        </div>

        <div className="map-container" onClick={handleMapClick}>
          {/* Zoom Controls */}
          <div className="zoom-controls">
            <button 
              className="zoom-btn zoom-in" 
              onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
              disabled={zoom >= 3}
              title="Zoom In"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 5V15M5 10H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className="zoom-btn zoom-reset" 
              onClick={(e) => { e.stopPropagation(); handleResetZoom(); }}
              title="Reset Zoom"
            >
              {zoom.toFixed(1)}x
            </button>
            <button 
              className="zoom-btn zoom-out" 
              onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
              disabled={zoom <= 0.5}
              title="Zoom Out"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 10H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* My Location Button */}
          <button 
            className="my-location-btn" 
            onClick={(e) => { e.stopPropagation(); requestUserLocation(); }}
            title="Get My Location"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 2V5M10 15V18M18 10H15M5 10H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Simulated Map Background with Zoom */}
          <div className="map-background" style={{ transform: `scale(${zoom})` }}>
            <div className="map-grid" />
            <div className="map-center-marker">+</div>
            
            {/* Location Marker */}
            {markerPosition && (
              <div 
                className="location-marker" 
                style={{ 
                  left: `${markerPosition.x}%`, 
                  top: `${markerPosition.y}%` 
                }}
              >
                <svg width="40" height="50" viewBox="0 0 40 50" fill="none">
                  <path d="M20 0C12.268 0 6 6.268 6 14C6 23.5 20 50 20 50C20 50 34 23.5 34 14C34 6.268 27.732 0 20 0Z" fill="#5b8c9b"/>
                  <circle cx="20" cy="14" r="6" fill="white"/>
                </svg>
              </div>
            )}
            
            {/* Map Labels */}
            <div className="map-labels">
              <div className="map-label" style={{ top: '20%', left: '30%' }}>Park</div>
              <div className="map-label" style={{ top: '40%', right: '25%' }}>Shopping Mall</div>
              <div className="map-label" style={{ bottom: '30%', left: '20%' }}>City Center</div>
              <div className="map-label" style={{ bottom: '20%', right: '30%' }}>Beach</div>
            </div>
          </div>
        </div>

        {locationName && (
          <div className="selected-location-info">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 10C11.1046 10 12 9.10457 12 8C12 6.89543 11.1046 6 10 6C8.89543 6 8 6.89543 8 8C8 9.10457 8.89543 10 10 10Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 2C7.87827 2 5.84344 2.84285 4.34315 4.34315C2.84285 5.84344 2 7.87827 2 10C2 11.892 2.402 13.13 3.5 14.5L10 22L16.5 14.5C17.598 13.13 18 11.892 18 10C18 7.87827 17.1571 5.84344 15.6569 4.34315C14.1566 2.84285 12.1217 2 10 2Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>{locationName}</span>
          </div>
        )}

        <div className="map-modal-actions">
          <button className="map-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="map-confirm-btn" 
            onClick={handleConfirm}
            disabled={!markerPosition}
          >
            Confirm Location
          </button>
        </div>
      </div>
    </>
  );
}

