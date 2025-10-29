import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { getProjectById } from "../api/Api";
import "./ProjectDetails.css";
import EditableTitle from "../components/EditableTitle";
import {
  startNewSectionFlow,
  startExistingSectionFlow,
  getNextPage,
} from "../utils/NavigationState";

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    console.log("useEffect", id);

    let isMounted = true;

    const fetchProjectData = async () => {
      try {
        console.log("fetchProjectData", id);
        const response = await getProjectById(id);

        // Component hala mount edilmişse state'i güncelle
        if (isMounted) {
          setProject(response);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    };

    fetchProjectData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSectionClick = (section) => {
    startExistingSectionFlow(project, section);
    navigate(getNextPage());
  };

  const handleAddNewSection = () => {
    startNewSectionFlow(project);
    navigate(getNextPage());
  };

  const handleTitleChange = (newTitle) => {
    setProject((prev) => ({ ...prev, name: newTitle }));
  };

  return (
    <div className="project-details-content-wrapper">
      {/* Project Title */}
      <h1 className="project-title">
        {project ? (
          <EditableTitle
            value={project.name}
            onChange={handleTitleChange}
            placeholder="Click to edit"
            className="project-title"
            autoFocus={false}
          />
        ) : (
          "Loading..."
        )}
      </h1>

      {/* Sections Grid */}
      <div className="sections-card">
        <div className="sections-grid">
          {project &&
            project.sections.map((section) => (
              <div
                key={section.id}
                className="section-card"
                onClick={() => handleSectionClick(section)}
              >
                <div className="section-image-container">
                  <img
                    src={
                      section.thumbnailUrl ||
                      section.resultImageUrl ||
                      section.rootImageUrl ||
                      "/assets/logo_big.png"
                    }
                    alt={section.title}
                    onError={(e) => {
                      e.target.src = "/assets/logo_big.png";
                    }}
                    className="section-image"
                  />
                  <div className="section-overlay"></div>
                  {section.hasLoading && (
                    <div className="loading-icon">
                      <svg
                        width="100"
                        height="100"
                        viewBox="0 0 100 100"
                        fill="none"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="white"
                          strokeWidth="8"
                          strokeOpacity="0.3"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="white"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray="60 200"
                          strokeDashoffset="0"
                        >
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0 50 50"
                            to="360 50 50"
                            dur="1s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="section-name">{section.title}</div>
              </div>
            ))}
        </div>
      </div>

      {/* Project Details and Add New Section */}
      <div className="bottom-section">
        <div className="project-info-card">
          <h2 className="info-title">Project Name Details</h2>
          <p className="info-description">
            {project ? project.details : "Loading..."}
          </p>
          <p className="info-phone">
            {project ? project.mobilePhone : "Loading..."}
          </p>

          {/* Map */}
          <div className="map-container">
            <div className="map-placeholder">
              <svg
                className="map-pin"
                width="40"
                height="60"
                viewBox="0 0 40 60"
                fill="none"
              >
                <path
                  d="M20 0C12.268 0 6 6.268 6 14C6 23.5 20 60 20 60C20 60 34 23.5 34 14C34 6.268 27.732 0 20 0Z"
                  fill="#000"
                />
                <circle cx="20" cy="14" r="6" fill="white" />
              </svg>
            </div>
          </div>
        </div>

        <div className="add-section-card" onClick={handleAddNewSection}>
          <div className="add-section-image-container">
            <img
              src="/assets/project-01.png"
              alt="Add New Section"
              className="add-section-image"
            />
            <div className="add-section-overlay"></div>
          </div>
          <div className="add-section-content">
            <div className="add-icon">
              <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
                <circle cx="45" cy="45" r="43" stroke="white" strokeWidth="4" />
                <path
                  d="M45 20V70M20 45H70"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="add-section-text">Add New Section</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
