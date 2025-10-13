import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import NewProjectModal from '../components/NewProjectModal';
import './Projects.css';

export default function Projects() {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  const projects = [
    { id: 1, name: 'Project name 01', image: '/assets/project-01.png' },
    { id: 2, name: 'Project name 02', image: '/assets/project-02.png' },
    { id: 3, name: 'Project name 03', image: '/assets/project-03.png' },
    { id: 4, name: 'Project name 04', image: '/assets/project-01.png' },
    { id: 5, name: 'Project name 05', image: '/assets/project-02.png' },
    { id: 6, name: 'Project name 06', image: '/assets/project-03.png' },
    { id: 7, name: 'Project name 07', image: '/assets/project-01.png' },
    { id: 8, name: 'Project name 08', image: '/assets/project-02.png' },
  ];

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3.2,
    slidesToScroll: 1,
    arrows: false,
    swipeToSlide: true,
    draggable: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  const handleProjectClick = (project) => {
    console.log('Project clicked:', project);
    // Navigate to project details or handle click
  };

  const handleNewProjectClick = () => {
    setShowNewProjectModal(true);
  };

  return (
    <div className="projects-page-container">
      <div className="projects-page-content">
        {/* Top Menu */}
        <div className="projects-top-menu">
          <div className="menu-left">
            <div className="back-icon" onClick={() => navigate('/home')}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M20 24L12 16L20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="menu-item" onClick={() => navigate('/home')}>Home</span>
            <span className="menu-item">Collections</span>
            <span className="menu-item active">Projects</span>
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

        {/* New Project Section */}
        <div className="new-project-section" onClick={handleNewProjectClick}>
          <div className="new-project-overlay" />
          <img src="/assets/project-new-bg.png" alt="New Project" className="new-project-bg" />
          <div className="new-project-content">
            <h1 className="new-project-title">New Project</h1>
            <button className="create-btn">Create</button>
          </div>
        </div>

        {/* Recent Projects Section */}
        <div className="recent-projects-section">
          <div className="recent-projects-header">
            <h2 className="recent-projects-title">
              Resent
              <br />
              Projects
            </h2>
            <button className="projects-page-btn" onClick={() => navigate('/projects-list')}>Projects page</button>
          </div>

          <div className="projects-slider-wrapper">
            <div className="projects-slider-container">
              <Slider ref={sliderRef} {...settings}>
                {projects.map((project) => (
                  <div key={project.id} className="project-slide">
                    <div className="project-card" onClick={() => handleProjectClick(project)}>
                      <img src={project.image} alt={project.name} className="project-image" />
                      <p className="project-name">{project.name}</p>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>

            {/* Navigation Arrow */}
            <button 
              className="slider-arrow next-arrow"
              onClick={() => sliderRef.current?.slickNext()}
            >
              <svg width="48" height="46" viewBox="0 0 48 46" fill="none">
                <path d="M18 12L30 23L18 34" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="slider-overlay" />
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      <NewProjectModal 
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onSubmit={(projectData) => {
          console.log('Project created:', projectData);
          // Navigate to Camera page with project data
          navigate('/camera', { state: { projectData } });
        }}
      />
    </div>
  );
}
