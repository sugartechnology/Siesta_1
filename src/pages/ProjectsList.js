import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProjects } from "../api/Api";
import "./ProjectsList.css";

const ProjectsList = () => {
  const navigate = useNavigate();
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
                <img
                  src={
                    project.thumbnailUrl ||
                    project.resultImageUrl ||
                    project.rootImageUrl ||
                    "/assets/logo_big.png"
                  }
                  alt={project.name}
                  className="project-item-image"
                  onError={(e) => {
                    e.target.src = "/assets/logo_big.png";
                  }}
                />
                <div className="project-item-overlay"></div>
              </div>
              <div className="project-item-name">{project.name}</div>
            </div>
          ))
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
            <h3>No projects found</h3>
            <p>Try searching with a different keyword</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsList;
