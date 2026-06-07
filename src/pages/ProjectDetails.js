import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSectionDesign } from "../contexts/SectionDesignContext";
import {
  deleteSection,
  getProjectById,
  updateProjectName,
  updateSectionName,
} from "../api/Api";
import "./ProjectDetails.css";
import EditableTitle from "../components/EditableTitle";
import SectionListItem from "../components/SectionListItem";
import {
  startNewSectionFlow,
  startExistingSectionFlow,
  getNextPage,
} from "../utils/NavigationState";
import { useTranslation } from "react-i18next";

const getSectionImage = (section) =>
  section.thumbnailUrl ||
  section.resultImageUrl ||
  section.rootImageUrl ||
  section.designs?.[0]?.thumbnailUrl ||
  section.designs?.[0]?.resultImageUrl ||
  null;

const isSectionProcessing = (section) => {
  const status = section.designs?.[0]?.status;
  return status === "PROCESSING";
};

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const { registerSection, unregisterSection, subscribeSectionUpdates } =
    useSectionDesign();
  const [project, setProject] = useState(null);
  const [projectError, setProjectError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProjectData = async () => {
      try {
        const response = await getProjectById(id);
        if (isMounted) {
          setProjectError("");
          setProject(response);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        if (isMounted) {
          setProjectError(
            error?.message || "Failed to load project details. Please try again."
          );
        }
      }
    };

    fetchProjectData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    const processingIds = (project?.sections || [])
      .filter(isSectionProcessing)
      .map((section) => section.id)
      .filter(Boolean);

    processingIds.forEach((sectionId) => registerSection(sectionId));

    return () => {
      processingIds.forEach((sectionId) => unregisterSection(sectionId));
    };
  }, [project?.sections, registerSection, unregisterSection]);

  useEffect(() => {
    return subscribeSectionUpdates((updatedSection) => {
      if (!updatedSection?.id) return;

      setProject((prev) => {
        if (!prev?.sections?.length) return prev;

        const index = prev.sections.findIndex(
          (section) => section.id === updatedSection.id
        );
        if (index < 0) return prev;

        const sections = [...prev.sections];
        sections[index] = updatedSection;
        return { ...prev, sections };
      });
    });
  }, [subscribeSectionUpdates]);

  const handleSectionClick = (section) => {
    startExistingSectionFlow(project, section);
    navigate(getNextPage());
  };

  const handleAddNewSection = () => {
    startNewSectionFlow(project);
    navigate(getNextPage());
  };

  const handleTitleChange = async (newTitle) => {
    const trimmedTitle = newTitle?.trim();
    if (!project?.id || !trimmedTitle) {
      return;
    }

    const previousProject = project;
    setProject((prev) => ({ ...prev, name: trimmedTitle }));

    try {
      const updatedProject = await updateProjectName(project.id, trimmedTitle);
      setProject(updatedProject);
      setProjectError("");
    } catch (error) {
      console.error("Error updating project name:", error);
      setProject(previousProject);
      setProjectError(
        error?.message || "Failed to update project name. Please try again."
      );
    }
  };

  const handleSectionRename = async (section, newTitle) => {
    const trimmedTitle = newTitle?.trim();
    if (!section?.id || !trimmedTitle) {
      return;
    }

    const previousProject = project;
    setProject((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === section.id ? { ...s, title: trimmedTitle } : s
      ),
    }));

    try {
      const updatedSection = await updateSectionName(section.id, trimmedTitle);
      setProject((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === section.id ? { ...s, ...updatedSection, title: trimmedTitle } : s
        ),
      }));
      setProjectError("");
    } catch (error) {
      console.error("Error updating section name:", error);
      setProject(previousProject);
      setProjectError(
        error?.message || "Failed to update section name. Please try again."
      );
      throw error;
    }
  };

  const handleSectionDelete = async (section) => {
    if (!section?.id) {
      return;
    }

    const previousProject = project;
    setProject((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== section.id),
    }));

    try {
      await deleteSection(section.id);
      setProjectError("");
    } catch (error) {
      console.error("Error deleting section:", error);
      setProject(previousProject);
      setProjectError(
        error?.message || "Failed to delete section. Please try again."
      );
    }
  };

  const sections = project?.sections || [];

  const handleBack = () => {
    navigate("/projects");
  };

  return (
    <div className="pd-page">
      <button
        type="button"
        className="pd-back-btn"
        onClick={handleBack}
        aria-label={t("designFlow.back")}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>{t("designFlow.back")}</span>
      </button>

      {projectError && (
        <div className="pd-error-banner" role="alert">
          {projectError}
        </div>
      )}

      <header className="pd-header">
        <h1 className="pd-title">
          {project ? (
            <EditableTitle
              value={project.name}
              onChange={handleTitleChange}
              placeholder={t("sectionDetails.clickToEdit")}
              className="pd-title-input"
              autoFocus={false}
            />
          ) : (
            t("common.loading")
          )}
        </h1>
        {project && (
          <p className="pd-meta">
            {t("projectDetails.sectionCount", { count: sections.length })}
          </p>
        )}
      </header>

      <button
        type="button"
        className="pd-add-section-btn"
        onClick={handleAddNewSection}
        disabled={!project}
      >
        <span className="pd-add-section-btn__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
        {t("projectDetails.addNewSection")}
      </button>

      <div className="pd-sections-panel">
        {!project ? (
          <div className="pd-empty">{t("common.loading")}</div>
        ) : sections.length === 0 ? (
          <div className="pd-empty">
            <p>{t("projectDetails.noSections")}</p>
          </div>
        ) : (
          <div className="pd-sections-scroll" role="list">
            {sections.map((section) => (
              <SectionListItem
                key={section.id}
                section={section}
                imageUrl={getSectionImage(section)}
                isProcessing={isSectionProcessing(section)}
                onOpen={handleSectionClick}
                onRename={handleSectionRename}
                onDelete={handleSectionDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
