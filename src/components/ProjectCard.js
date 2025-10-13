import React from 'react';
import './ProjectCard.css';

const ProjectCard = ({ project, onClick }) => {
  return (
    <div className="project-card" onClick={onClick}>
      <div className="project-image" style={{ backgroundColor: project.bgColor || '#f5f5f5' }}>
        {project.image ? (
          <img src={project.image} alt={project.name} />
        ) : (
          <div className="project-placeholder">Project Image</div>
        )}
      </div>
      <div className="project-info">
        <h3 className="project-name">{project.name}</h3>
        {project.type && <span className="project-type">{project.type}</span>}
      </div>
    </div>
  );
};

export default ProjectCard;



