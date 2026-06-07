import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./SectionSwitcher.css";

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M11.333 2.00004C11.5084 1.82469 11.7163 1.68607 11.9451 1.59233C12.1739 1.49859 12.4191 1.45166 12.6667 1.45437C12.9142 1.45708 13.1582 1.50937 13.3844 1.60799C13.6106 1.70661 13.8146 1.84945 13.9856 2.02871C14.1566 2.20797 14.291 2.41993 14.381 2.65229C14.471 2.88465 14.5146 3.1331 14.5093 3.38271C14.504 3.63232 14.45 3.87818 14.3507 4.10604L5.62067 12.8367L2 14L3.16333 10.3794L11.333 2.00004Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M2 4.66667H14M6.66667 4.66667V3.33333C6.66667 2.96514 6.81295 2.61279 7.07044 2.3553C7.32793 2.09781 7.68028 1.95154 8.04848 1.95154H7.95152C8.31972 1.95154 8.67207 2.09781 8.92956 2.3553C9.18705 2.61279 9.33333 2.96514 9.33333 3.33333V4.66667M12.6667 4.66667V13.3333C12.6667 13.7015 12.5204 14.0539 12.2629 14.3114C12.0054 14.5689 11.6531 14.7152 11.2848 14.7152H4.71519C4.34699 14.7152 3.99464 14.5689 3.73715 14.3114C3.47966 14.0539 3.33333 13.7015 3.33333 13.3333V4.66667H12.6667Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function SectionSwitcher({
  sections,
  activeSection,
  onSelect,
  onRename,
  onDelete,
  isProcessing,
  disabled = false,
}) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [nameValue, setNameValue] = useState(activeSection?.title || "");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);
  const canManage = Boolean(activeSection?.id);

  useEffect(() => {
    setNameValue(activeSection?.title || "");
    setIsEditing(false);
  }, [activeSection?.id, activeSection?.title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitRename = async () => {
    const trimmed = nameValue.trim();
    setIsEditing(false);

    if (!trimmed || trimmed === activeSection?.title) {
      setNameValue(activeSection?.title || "");
      return;
    }

    try {
      setIsSaving(true);
      await onRename(activeSection, trimmed);
    } catch (error) {
      setNameValue(activeSection?.title || "");
      console.error("Failed to rename section:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(t("projectDetails.removeSectionConfirm"))) {
      onDelete(activeSection);
    }
  };

  const renderSectionActions = () => (
    <div className="section-switcher__actions">
      <button
        type="button"
        className="section-switcher__icon-btn"
        onClick={() => setIsEditing(true)}
        aria-label={t("projectDetails.editSectionName")}
        disabled={disabled || isEditing || isSaving || !canManage}
      >
        <EditIcon />
      </button>
      <button
        type="button"
        className="section-switcher__icon-btn section-switcher__icon-btn--danger"
        onClick={handleDelete}
        aria-label={t("projectDetails.removeSection")}
        disabled={disabled || isSaving || !canManage}
      >
        <TrashIcon />
      </button>
    </div>
  );

  if (!sections?.length) {
    return null;
  }

  return (
    <div className="section-switcher">
      <div className="section-switcher__tabs" role="tablist" aria-label={t("sectionDetails.sectionsLabel")}>
        {sections.map((sectionItem) => {
          const isActive = sectionItem.id === activeSection?.id;
          const processing = isProcessing?.(sectionItem);
          const key = sectionItem.id || sectionItem.title;

          if (isActive && isEditing) {
            return (
              <div key={key} className="section-switcher__active-group">
                <input
                  ref={inputRef}
                  className="section-switcher__edit-input"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitRename();
                    }
                    if (e.key === "Escape") {
                      setNameValue(activeSection?.title || "");
                      setIsEditing(false);
                    }
                  }}
                  disabled={isSaving}
                  aria-label={t("projectDetails.editSectionName")}
                />
                {renderSectionActions()}
              </div>
            );
          }

          if (isActive) {
            return (
              <div key={key} className="section-switcher__active-group">
                <button
                  type="button"
                  role="tab"
                  aria-selected
                  className="section-switcher__tab section-switcher__tab--active"
                  disabled={disabled || isSaving}
                >
                  <span className="section-switcher__tab-label">{sectionItem.title}</span>
                  {processing && (
                    <span
                      className="section-switcher__processing-dot"
                      title={t("projectDetails.processing")}
                      aria-hidden="true"
                    />
                  )}
                </button>
                {renderSectionActions()}
              </div>
            );
          }

          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={false}
              className="section-switcher__tab"
              onClick={() => onSelect(sectionItem)}
              disabled={disabled || isSaving}
            >
              <span className="section-switcher__tab-label">{sectionItem.title}</span>
              {processing && (
                <span
                  className="section-switcher__processing-dot"
                  title={t("projectDetails.processing")}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
