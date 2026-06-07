import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getProjectListThumbnail } from "../utils/projectImages";
import "./ProjectListItem.css";

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M11.333 2.00004C11.5084 1.82469 11.7163 1.68607 11.9451 1.59233C12.1739 1.49859 12.4191 1.45166 12.6667 1.45437C12.9142 1.45708 13.1582 1.50937 13.3844 1.60799C13.6106 1.70661 13.8146 1.84945 13.9856 2.02871C14.1566 2.20797 14.291 2.41993 14.381 2.65229C14.471 2.88465 14.5146 3.1331 14.5093 3.38271C14.504 3.63232 14.45 3.87818 14.3507 4.10604L5.62067 12.8367L2 14L3.16333 10.3794L11.333 2.00004Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ProposalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M4.66667 1.33337H8.66667L11.3333 4.00004V13.3334C11.3333 13.7016 11.0349 14 10.6667 14H4.66667C4.29848 14 4 13.7016 4 13.3334V2.00004C4 1.63185 4.29848 1.33337 4.66667 1.33337Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M8 1.33337V4.66671H11.3333"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 7.33337H9.33333M6 10H8.66667"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M2 4.66667H14M6.66667 4.66667V3.33333C6.66667 2.96514 6.81295 2.61279 7.07044 2.3553C7.32793 2.09781 7.68028 1.95154 8.04848 1.95154H7.95152C8.31972 1.95154 8.67207 2.09781 8.92956 2.3553C9.18705 2.61279 9.33333 2.96514 9.33333 3.33333V4.66667M12.6667 4.66667V13.3333C12.6667 13.7015 12.5204 14.0539 12.2629 14.3114C12.0054 14.5689 11.6531 14.7152 11.2848 14.7152H4.71519C4.34699 14.7152 3.99464 14.5689 3.73715 14.3114C3.47966 14.0539 3.33333 13.7015 3.33333 13.3333V4.66667H12.6667Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function ProjectListItem({
  project,
  onOpenDetails,
  onRename,
  onDelete,
  onRequestProposal,
  isRequestingProposal = false,
}) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [nameValue, setNameValue] = useState(project.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setNameValue(project.name || "");
  }, [project.name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const thumbnail = getProjectListThumbnail(project);

  const commitRename = async () => {
    const trimmed = nameValue.trim();
    setIsEditing(false);

    if (!trimmed || trimmed === project.name) {
      setNameValue(project.name || "");
      return;
    }

    try {
      setIsSaving(true);
      await onRename(project, trimmed);
    } catch (error) {
      setNameValue(project.name || "");
      console.error("Failed to rename project:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(t("projects.removeConfirm"))) {
      onDelete(project);
    }
  };

  return (
    <article className="project-list-item">
      <div className="project-list-item__thumb-wrap">
        <img
          src={thumbnail}
          alt=""
          className="project-list-item__thumb"
          onError={(e) => {
            e.currentTarget.src = "/assets/logo_big.png";
          }}
        />
      </div>

      <div className="project-list-item__body">
        <div className="project-list-item__title-row">
          {isEditing ? (
            <input
              ref={inputRef}
              className="project-list-item__name-input"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitRename();
                }
                if (e.key === "Escape") {
                  setNameValue(project.name || "");
                  setIsEditing(false);
                }
              }}
              disabled={isSaving}
              aria-label={t("projects.editName")}
            />
          ) : (
            <h3 className="project-list-item__name">{project.name}</h3>
          )}

          <button
            type="button"
            className="project-list-item__icon-btn"
            onClick={() => setIsEditing(true)}
            aria-label={t("projects.editName")}
            disabled={isEditing || isSaving}
          >
            <EditIcon />
          </button>
        </div>

        {project.mobilePhone && (
          <p className="project-list-item__phone">{project.mobilePhone}</p>
        )}

        {project.sectionCount > 0 && (
          <p className="project-list-item__meta">
            {project.sectionCount} {t("projects.sections")}
          </p>
        )}
      </div>

      <div className="project-list-item__actions">
        <button
          type="button"
          className="project-list-item__detail-btn"
          onClick={() => onOpenDetails(project)}
        >
          {t("projects.details")}
        </button>

        <button
          type="button"
          className="project-list-item__icon-btn"
          onClick={() => onRequestProposal(project)}
          aria-label={t("projects.requestProposal")}
          disabled={isRequestingProposal}
          title={
            isRequestingProposal
              ? t("projects.proposal.generating")
              : t("projects.requestProposal")
          }
        >
          {isRequestingProposal ? (
            <span className="project-list-item__share-spinner" aria-hidden="true" />
          ) : (
            <ProposalIcon />
          )}
        </button>

        <button
          type="button"
          className="project-list-item__icon-btn project-list-item__icon-btn--danger"
          onClick={handleDelete}
          aria-label={t("projects.remove")}
        >
          <TrashIcon />
        </button>
      </div>
    </article>
  );
}
