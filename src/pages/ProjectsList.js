import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProjects, removeProject } from "../api/Api";
import HoverThumbnailButton from "../components/HoverThumbnailButton";
import "./ProjectsList.css";
import { useTranslation } from "react-i18next";

const ProjectsList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getUserProjects().then((data) => {
      setProjects(data);
    });
  }, []);

  const handleProjectClick = (project) => {
    // Navigate to project details page
    navigate(`/projects-details/${project.id}`);
  };

  const handleRemoveProject = async (project) => {
    console.log("Remove project", project);
    await removeProject(project.id);
    setProjects((prevProjects) =>
      prevProjects.filter((p) => p.id !== project.id)
    );
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="projects-list-content-wrapper">
      {/* Search Bar */}
      <div className="search-bar-container">
        <div className="search-bar">
          <svg
            className="search-icon"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <circle
              cx="7"
              cy="7"
              r="5.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M11 11L14.5 14.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            placeholder={t('products.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => {
            // Image URL'i belirle
            const imageUrl =
              project.thumbnailUrl ||
              project.resultImageUrl ||
              project.rootImageUrl ||
              "/assets/logo_big.png";

            return (
              <div key={project.id} className="project-item-card">
                <HoverThumbnailButton
                  id={project.id}
                  imageUrl={imageUrl}
                  title={project.name}
                  isActive={true}
                  isLoading={false}
                  onClick={() => handleProjectClick(project)}
                  duration={500}
                  actions={[
                    {
                      label: t('projects.remove'),
                      action: () => handleRemoveProject(project),
                      icon: "🗑️",
                      requireConfirmation: true,
                      confirmationMessage: t('projects.removeConfirm'),
                    },
                  ]}
                  showPopup={false}
                  titleClassName="project-item-name"
                />
                {project.createdDate && (
                  <div className="project-item-created-date">
                    {project.createdDate}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="no-results-message">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="#ccc" strokeWidth="2" />
              <path
                d="M32 20V36M32 44H32.02"
                stroke="#ccc"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <h3>{t('projects.noResults')}</h3>
            <p>{t('projects.trySearchAgain')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsList;
