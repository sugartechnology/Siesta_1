import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProjectById,
  getProjectSections,
  getUserProjectsDetailed,
  removeProject,
  updateProjectName,
} from "../api/Api";
import { generateProjectProformaPdf } from "../utils/projectProformaPdf";
import ProposalRequestModal from "../components/ProposalRequestModal";
import ProjectListItem from "../components/ProjectListItem";
import { startCreateSpaceFlow } from "../utils/createSpaceFlow";
import { sortProjectsByNewest } from "../utils/projectNaming";
import "./Projects.css";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/useAuth";
import { useProductCart } from "../contexts/ProductCartContext";

export default function Projects() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { requireAuth } = useAuth();
  const { clearCart } = useProductCart();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [requestingProposalProjectId, setRequestingProposalProjectId] =
    useState(null);
  const [proposalModal, setProposalModal] = useState({
    isOpen: false,
    project: null,
    pdfBlob: null,
    pdfFileName: null,
    isGenerating: false,
  });

  const fetchProjects = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setLoadError(null);
      const response = await getUserProjectsDetailed();
      setProjects(sortProjectsByNewest(response || []));
    } catch (err) {
      console.error("Error fetching projects:", err);
      setLoadError(t("projects.loadError"));
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    return (
      String(project.name || "").toLowerCase().includes(query) ||
      String(project.mobilePhone || "").toLowerCase().includes(query)
    );
  });

  const handleOpenDetails = (project) => {
    navigate(`/projects-details/${project.id}`, { state: { project } });
  };

  const handleNewProjectClick = async () => {
    const isAuthenticated = await requireAuth();
    if (!isAuthenticated) return;

    try {
      setIsCreatingSpace(true);
      setLoadError(null);
      setDeleteError(null);
      clearCart();
      await startCreateSpaceFlow({ existingProjects: projects });
      navigate("/camera");
    } catch (err) {
      console.error("Error starting create space flow:", err);
      setLoadError(t("projects.createError"));
    } finally {
      setIsCreatingSpace(false);
    }
  };

  const handleRename = async (project, newName) => {
    await updateProjectName(project.id, newName);
    setProjects((prev) =>
      prev.map((item) =>
        item.id === project.id ? { ...item, name: newName } : item
      )
    );
  };

  const handleDelete = async (project) => {
    setDeleteError(null);

    try {
      await removeProject(project.id);
      setProjects((prev) => prev.filter((item) => item.id !== project.id));
    } catch (err) {
      console.error("Error removing project:", err);
      setDeleteError(t("projects.deleteError"));
      await fetchProjects({ silent: true });
    }
  };

  const closeProposalModal = useCallback(() => {
    setProposalModal({
      isOpen: false,
      project: null,
      pdfBlob: null,
      pdfFileName: null,
      isGenerating: false,
    });
    setRequestingProposalProjectId(null);
  }, []);

  const handleRequestProposal = async (project) => {
    if (!project?.id || requestingProposalProjectId) {
      return;
    }

    setRequestingProposalProjectId(project.id);
    setLoadError(null);
    setProposalModal({
      isOpen: true,
      project,
      pdfBlob: null,
      pdfFileName: null,
      isGenerating: true,
    });

    try {
      let fullProject = await getProjectById(project.id);
      if (!fullProject?.sections?.length) {
        const sections = await getProjectSections(project.id);
        fullProject = { ...fullProject, sections: sections || [] };
      }

      const { blob, fileName } = await generateProjectProformaPdf(fullProject, {
        t,
        locale: document.documentElement.lang || "en",
      });

      setProposalModal({
        isOpen: true,
        project: fullProject,
        pdfBlob: blob,
        pdfFileName: fileName,
        isGenerating: false,
      });
    } catch (err) {
      console.error("Proposal PDF failed:", err);
      setLoadError(t("projects.proposal.generateError"));
      closeProposalModal();
    } finally {
      setRequestingProposalProjectId(null);
    }
  };

  return (
    <div className="projects-page">
      <header className="projects-page__header">
        <div>
          <h1 className="projects-page__title">{t("projects.pageTitle")}</h1>
          <p className="projects-page__subtitle">{t("projects.pageSubtitle")}</p>
        </div>

        <button
          type="button"
          className="projects-page__create-btn"
          onClick={handleNewProjectClick}
          disabled={isCreatingSpace}
        >
          <span className="projects-page__create-icon" aria-hidden="true">
            +
          </span>
          {isCreatingSpace ? t("projects.creatingSpace") : t("projects.createSpace")}
        </button>
      </header>

      <div className="projects-page__toolbar">
        <div className="projects-page__search">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M11 11L14.5 14.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("projects.searchPlaceholder")}
            className="projects-page__search-input"
          />
        </div>
        <span className="projects-page__count">
          {t("projects.count", { count: filteredProjects.length })}
        </span>
      </div>

      {deleteError && (
        <div className="projects-page__banner projects-page__banner--error" role="alert">
          <span>{deleteError}</span>
          <button
            type="button"
            className="projects-page__banner-dismiss"
            onClick={() => setDeleteError(null)}
            aria-label={t("common.cancel")}
          >
            ×
          </button>
        </div>
      )}

      <div className="projects-page__list">
        {loading ? (
          <div className="projects-page__state">{t("projects.loading")}</div>
        ) : loadError && projects.length === 0 ? (
          <div className="projects-page__state projects-page__state--error">
            {loadError}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="projects-page__empty">
            <p>{searchQuery ? t("projects.noResults") : t("projects.noProjects")}</p>
            {!searchQuery && (
              <button
                type="button"
                className="projects-page__create-btn projects-page__create-btn--inline"
                onClick={handleNewProjectClick}
                disabled={isCreatingSpace}
              >
                {isCreatingSpace ? t("projects.creatingSpace") : t("projects.createSpace")}
              </button>
            )}
          </div>
        ) : (
          filteredProjects.map((project) => (
            <ProjectListItem
              key={project.id}
              project={project}
              onOpenDetails={handleOpenDetails}
              onRename={handleRename}
              onDelete={handleDelete}
              onRequestProposal={handleRequestProposal}
              isRequestingProposal={requestingProposalProjectId === project.id}
            />
          ))
        )}
      </div>

      <ProposalRequestModal
        isOpen={proposalModal.isOpen}
        project={proposalModal.project}
        pdfBlob={proposalModal.pdfBlob}
        pdfFileName={proposalModal.pdfFileName}
        isGenerating={proposalModal.isGenerating}
        onClose={closeProposalModal}
      />
    </div>
  );
}
