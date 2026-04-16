import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { getUserProjects } from "../api/Api";
import NewProjectModal from "../components/NewProjectModal";
import { getNextPage, startNewSectionFlow } from "../utils/NavigationState";
import "./Projects.css";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/useAuth";

const getSlidesToShow = (width) => {
  if (width > 1024) {
    return 3.2;
  }

  if (width > 490) {
    return 2.2;
  }

  return 1.2;
};

export default function Projects() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { requireAuth } = useAuth();
  const sliderRef = useRef(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slidesToShow, setSlidesToShow] = useState(() =>
    getSlidesToShow(window.innerWidth)
  );

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

  useEffect(() => {
    const handleResize = () => {
      setSlidesToShow(getSlidesToShow(window.innerWidth));
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    arrows: false,
    swipeToSlide: true,
    draggable: true,
  };

  const handleProjectClick = (project) => {
    console.log("Project clicked:", project);
    // Navigate to project details page
    navigate(`/projects-details/${project.id}`, { state: { project } });
  };

  const handleNewProjectClick = async () => {
    const isAuthenticated = await requireAuth();
    if (!isAuthenticated) {
      return;
    }

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
      <button
        type="button"
        className="new-project-section"
        onClick={handleNewProjectClick}
      >
        <span className="new-project-overlay" aria-hidden="true" />
        <img
          src="/assets/project-new-bg.png"
          alt="New Project"
          className="new-project-bg"
        />
        <span className="new-project-content">
          <span className="new-project-title">{t('projects.newProject')}</span>
          <span className="create-btn" aria-hidden="true">
            {t('projects.create')}
          </span>
        </span>
      </button>

      {/* Recent Projects Section */}
      <div className="recent-projects-section">
        <div className="recent-projects-header">
          <h2 className="recent-projects-title">{t('projects.recentProjects')}</h2>
          <button
            className="projects-page-btn"
            onClick={() => navigate("/projects-list")}
          >
            {t('projects.projectsPage')}
          </button>
        </div>

        <div className="projects-slider-wrapper">
          <div className="projects-slider-container">
            {loading ? (
              <div className="loading-message">{t('projects.loading')}</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : projects.length === 0 ? (
              <div className="no-projects-message">
                {t('projects.noProjects')}
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
                          {project.sectionCount} {t('projects.sections')}
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
