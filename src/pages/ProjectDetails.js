import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const projectData = location.state?.projectData || { 
    name: 'Project Name',
    description: 'Lorem ipsum dolor sit amet consectetur. Massa ut sit consectetur facilisis faucibus. Gravida ornare dignissim vel gravida eget fames. Sapien eu felis facilisi donec metus.',
    phone: '+90 221 510 51 28',
    location: 'Istanbul, Turkey'
  };

  const imgLogo = "http://localhost:3845/assets/56b68463c1acec5ac9da8e728326a8fb6cf8482d.png";

  // Sample sections
  const sections = [
    { id: 1, name: 'Section 1', image: '/assets/project-01.png' },
    { id: 2, name: 'Section 2', image: '/assets/project-02.png' },
    { id: 3, name: 'Section 3', image: '/assets/project-03.png', hasLoading: true },
    { id: 4, name: 'Section 4', image: '/assets/project-01.png' },
    { id: 5, name: 'Section 5', image: '/assets/project-01.png' },
    { id: 6, name: 'Section 6', image: '/assets/project-01.png' }
  ];

  const handleSectionClick = (section) => {
    console.log('Section clicked:', section);
    // Navigate to section details page
    navigate('/section-details', { state: { section, projectData } });
  };

  const handleAddNewSection = () => {
    navigate('/camera', { state: { projectData, isNewSection: true } });
  };

  return (
    <div className="project-details-container">
      <div className="project-details-content-wrapper">
        {/* Top Menu */}
        <div className="project-details-top-menu">
          <div className="menu-left">
            <div className="back-icon" onClick={() => navigate('/projects-list')}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M20 24L12 16L20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="menu-item" onClick={() => navigate('/home')}>Home</span>
            <span className="menu-item" onClick={() => navigate('/catalog')}>Collections</span>
            <span className="menu-item active" onClick={() => navigate('/projects')}>Projects</span>
          </div>
          <div className="menu-center">
            <img src={imgLogo} alt="Siesta" className="logo" />
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

        {/* Project Title */}
        <h1 className="project-title">{projectData.name}</h1>

        {/* Sections Grid */}
        <div className="sections-grid">
          {sections.map((section) => (
            <div
              key={section.id}
              className="section-card"
              onClick={() => handleSectionClick(section)}
            >
              <div className="section-image-container">
                <img src={section.image} alt={section.name} className="section-image" />
                <div className="section-overlay"></div>
                {section.hasLoading && (
                  <div className="loading-icon">
                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="8" strokeOpacity="0.3" />
                      <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="8" strokeLinecap="round" strokeDasharray="60 200" strokeDashoffset="0">
                        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite" />
                      </circle>
                    </svg>
                  </div>
                )}
              </div>
              <div className="section-name">
                {section.name}
              </div>
            </div>
          ))}
        </div>

        {/* Project Details and Add New Section */}
        <div className="bottom-section">
          <div className="project-info-card">
            <h2 className="info-title">Project Name Details</h2>
            <p className="info-description">
              {projectData.description}
            </p>
            <p className="info-phone">{projectData.phone}</p>
            
            {/* Map */}
            <div className="map-container">
              <div className="map-placeholder">
                <svg className="map-pin" width="40" height="60" viewBox="0 0 40 60" fill="none">
                  <path d="M20 0C12.268 0 6 6.268 6 14C6 23.5 20 60 20 60C20 60 34 23.5 34 14C34 6.268 27.732 0 20 0Z" fill="#000"/>
                  <circle cx="20" cy="14" r="6" fill="white"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="add-section-card" onClick={handleAddNewSection}>
            <div className="add-section-image-container">
              <img src="/assets/project-01.png" alt="Add New Section" className="add-section-image" />
              <div className="add-section-overlay"></div>
            </div>
            <div className="add-section-content">
              <div className="add-icon">
                <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
                  <circle cx="45" cy="45" r="43" stroke="white" strokeWidth="4"/>
                  <path d="M45 20V70M20 45H70" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="add-section-text">Add New Section</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;

