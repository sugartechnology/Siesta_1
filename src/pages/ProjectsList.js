import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectsList.css';

const ProjectsList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const imgLogo = "http://localhost:3845/assets/56b68463c1acec5ac9da8e728326a8fb6cf8482d.png";

  // Sample project data - using the same images as before
  const projects = [
    { id: 1, name: 'Project name 01', image: '/assets/project-01.png' },
    { id: 2, name: 'Project name 02', image: '/assets/project-02.png' },
    { id: 3, name: 'Project name 03', image: '/assets/project-03.png' },
    { id: 4, name: 'Project name 04', image: '/assets/project-01.png' },
    { id: 5, name: 'Project name 05', image: '/assets/project-01.png' },
    { id: 6, name: 'Project name 06', image: '/assets/project-02.png' },
    { id: 7, name: 'Project name 07', image: '/assets/project-03.png' },
    { id: 8, name: 'Project name 08', image: '/assets/project-01.png' },
  ];

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProjectClick = (project) => {
    console.log('Project clicked:', project);
    // Navigate to project details page
    navigate('/project-details', { state: { projectData: project } });
  };

  return (
    <div className="projects-list-container">
      <div className="projects-list-content-wrapper">
        {/* Top Menu */}
        <div className="projects-list-top-menu">
          <div className="menu-left">
            <div className="back-icon" onClick={() => navigate('/home')}>
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

        {/* Search Bar */}
        <div className="search-bar-container">
          <div className="search-bar">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="projects-grid">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className="project-item-card"
                onClick={() => handleProjectClick(project)}
              >
                <div className="project-item-image-container">
                  <img src={project.image} alt={project.name} className="project-item-image" />
                  <div className="project-item-overlay"></div>
                </div>
                <div className="project-item-name">
                  {project.name}
                </div>
              </div>
            ))
          ) : (
            <div className="no-results-message">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="#ccc" strokeWidth="2" />
                <path d="M32 20V36M32 44H32.02" stroke="#ccc" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <h3>No projects found</h3>
              <p>Try searching with a different keyword</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsList;

