import React, { useState } from 'react';
import InputMask from 'react-input-mask';
import LocationMapModal from './LocationMapModal';
import './NewProjectModal.css';

export default function NewProjectModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    projectName: '',
    sectionName: '',
    countryCode: '+1',
    phoneNumber: '',
    location: '',
    locationCoords: null,
    additionalInfo: ''
  });

  const [showMapModal, setShowMapModal] = useState(false);

  const countryCodes = [
    { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+90', country: 'Turkey', flag: '🇹🇷' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+91', country: 'India', flag: '🇮🇳' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationClick = () => {
    setShowMapModal(true);
  };

  const handleLocationSelect = (location, coords) => {
    setFormData(prev => ({
      ...prev,
      location: location,
      locationCoords: coords
    }));
    setShowMapModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Navigate to Camera page with project data
    if (typeof onSubmit === 'function') {
      onSubmit(formData);
    }
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      projectName: '',
      sectionName: '',
      countryCode: '+1',
      phoneNumber: '',
      location: '',
      locationCoords: null,
      additionalInfo: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={handleCancel} />
      <div className="new-project-modal">
        <div className="modal-header">
          <h2>New Project</h2>
          <button className="close-btn" onClick={handleCancel}>
            <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
              <path d="M16 5L5 16M5 5L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="projectName">Project Name</label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                placeholder="Enter project name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sectionName">Section Name</label>
              <input
                type="text"
                id="sectionName"
                name="sectionName"
                value={formData.sectionName}
                onChange={handleInputChange}
                placeholder="Enter section name"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group phone-group">
              <label>Phone Number</label>
              <div className="phone-input-container">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleInputChange}
                  className="country-code-select"
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <InputMask
                  mask="(999) 999-9999"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  className="phone-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <div className="location-input-wrapper">
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  readOnly
                  placeholder="Click to select location on map"
                  onClick={handleLocationClick}
                  className="location-input"
                  required
                />
                <button 
                  type="button" 
                  className="map-icon-btn"
                  onClick={handleLocationClick}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 10C11.1046 10 12 9.10457 12 8C12 6.89543 11.1046 6 10 6C8.89543 6 8 6.89543 8 8C8 9.10457 8.89543 10 10 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 2C7.87827 2 5.84344 2.84285 4.34315 4.34315C2.84285 5.84344 2 7.87827 2 10C2 11.892 2.402 13.13 3.5 14.5L10 22L16.5 14.5C17.598 13.13 18 11.892 18 10C18 7.87827 17.1571 5.84344 15.6569 4.34315C14.1566 2.84285 12.1217 2 10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="additionalInfo">Additional Info</label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                placeholder="Enter additional information about the project..."
                rows="4"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Create Project
            </button>
          </div>
        </form>
      </div>

      {showMapModal && (
        <LocationMapModal
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
          onSelectLocation={handleLocationSelect}
          currentLocation={formData.locationCoords}
        />
      )}
    </>
  );
}

