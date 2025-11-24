import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { getUserProjects } from "../api/Api";
import NewProjectModal from "../components/NewProjectModal";
import { getNextPage, startNewSectionFlow } from "../utils/NavigationState";
import "./Projects.css";

export default function Projects() {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getUserProjects();
      setProjects(response || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const handleProjectClick = (project) => {
    console.log("Project clicked:", project);
    // Navigate to project details page
    navigate(`/projects-details/${project.id}`, { state: { project } });
  };

  const handleNewProjectClick = () => {
    setShowNewProjectModal(true);
  };

  const handleProjectCreated = (project) => {
    console.log("Project created:", project);
    // Refresh projects list
    startNewSectionFlow(project, project.sections[0]);
    navigate(getNextPage());
  };

  return (
    <div className="projects-page-content">
      {/* New Project Section */}
      <div className="new-project-section" onClick={handleNewProjectClick}>
        <div className="new-project-overlay" />
        <img
          src="/assets/project-new-bg.png"
          alt="New Project"
          className="new-project-bg"
        />
        <div className="new-project-content">
          <h1 className="new-project-title">New Project</h1>
          <button className="create-btn">Create</button>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="recent-projects-section">
        <div className="recent-projects-header">
          <h2 className="recent-projects-title">
            Recent Projects
          </h2>
          <button
            className="projects-page-btn"
            onClick={() => navigate("/projects-list")}
          >
            Projects page
          </button>
        </div>

        <div className="projects-slider-wrapper">
          <div className="projects-slider-container">
            {loading ? (
              <div className="loading-message">Loading projects...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : projects.length === 0 ? (
              <div className="no-projects-message">
                No projects found. Create your first project!
              </div>
            ) : (
              <Slider ref={sliderRef} {...settings}>
                {projects.map((project) => (
                  <div key={project.id} className="project-slide">
                    <div
                      className="project-card"
                      onClick={() => handleProjectClick(project)}
                    >
                      <img
                        src={
                          project.thumbnailUrl ||
                          project.rootImageUrl ||
                          "/assets/logo_big.png"
                        }
                        alt={project.name}
                        className="project-image"
                        onError={(e) => {
                          e.target.src = "/assets/logo_big.png";
                        }}
                      />
                      <p className="project-name">{project.name}</p>
                      {project.sectionCount > 0 && (
                        <p className="project-sections">
                          {project.sectionCount} sections
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </Slider>
            )}
          </div>

          {/* Navigation Arrow */}
          <button
            className="slider-arrow next-arrow"
            onClick={() => sliderRef.current?.slickNext()}
          >
            <svg width="48" height="46" viewBox="0 0 48 46" fill="none">
              <path
                d="M18 12L30 23L18 34"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="slider-overlay" />
        </div>
      </div>
      {/* New Project Modal */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onSubmit={handleProjectCreated}
      />
    </div>
  );
}
