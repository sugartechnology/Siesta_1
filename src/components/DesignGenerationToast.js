import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getProjectById } from "../api/Api";
import { useSectionDesign } from "../contexts/SectionDesignContext";
import { startExistingSectionFlow } from "../utils/NavigationState";
import "./DesignGenerationToast.css";

const TOAST_DURATION_MS = 5000;

const GoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 12h14M13 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function DesignGenerationToast() {
  const { subscribeSectionUpdates, getGenerationMeta } = useSectionDesign();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [notice, setNotice] = useState(null);
  const previousStatusRef = useRef(new Map());
  const timerRef = useRef(null);

  const clearNoticeTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const dismissNotice = useCallback(() => {
    clearNoticeTimer();
    setNotice(null);
  }, [clearNoticeTimer]);

  const showNotice = useCallback(
    (payload) => {
      setNotice(payload);
      clearNoticeTimer();
      timerRef.current = setTimeout(() => {
        setNotice(null);
        timerRef.current = null;
      }, TOAST_DURATION_MS);
    },
    [clearNoticeTimer]
  );

  useEffect(() => {
    const unsubscribe = subscribeSectionUpdates((section) => {
      const sectionId = section?.id;
      if (!sectionId) return;

      const status = section?.designs?.[0]?.status;
      const previousStatus = previousStatusRef.current.get(sectionId);
      previousStatusRef.current.set(sectionId, status);

      const wasProcessing =
        previousStatus === "PROCESSING" ||
        getGenerationMeta(sectionId)?.wasProcessing;

      if (wasProcessing && status === "COMPLETED") {
        const meta = getGenerationMeta(sectionId) || {};
        const sectionTitle = section?.title?.trim();
        const projectName = meta.project?.name?.trim();

        showNotice({
          sectionId,
          projectId: meta.projectId,
          project: meta.project,
          section,
          message: sectionTitle
            ? t("sectionDetails.designCompleteNotificationWithSection", {
                section: sectionTitle,
              })
            : t("sectionDetails.designCompleteNotification"),
          subtitle:
            projectName && sectionTitle
              ? t("sectionDetails.designCompleteNotificationProject", {
                  project: projectName,
                  section: sectionTitle,
                })
              : projectName || sectionTitle || null,
        });
      }
    });

    return () => {
      unsubscribe();
      clearNoticeTimer();
    };
  }, [subscribeSectionUpdates, getGenerationMeta, showNotice, t, clearNoticeTimer]);

  const handleGo = async () => {
    if (!notice) return;

    const { projectId, project, section } = notice;
    dismissNotice();

    try {
      let targetProject = project;
      let targetSection = section;

      if (!targetProject?.id && projectId) {
        targetProject = await getProjectById(projectId);
        targetSection =
          targetProject?.sections?.find((item) => item.id === section?.id) ||
          section;
      }

      if (!targetProject || !targetSection) {
        return;
      }

      startExistingSectionFlow(targetProject, targetSection);
      navigate("/section-details");
    } catch (error) {
      console.error("Failed to navigate to completed design:", error);
    }
  };

  if (!notice) {
    return null;
  }

  return (
    <div className="design-generation-toast" role="status" aria-live="polite">
      <div className="design-generation-toast__content">
        <p className="design-generation-toast__message">{notice.message}</p>
        {notice.subtitle && notice.subtitle !== notice.message && (
          <p className="design-generation-toast__subtitle">{notice.subtitle}</p>
        )}
      </div>
      <button
        type="button"
        className="design-generation-toast__go"
        onClick={handleGo}
        aria-label={t("sectionDetails.designCompleteGoAria")}
      >
        <span>{t("sectionDetails.designCompleteGo")}</span>
        <GoIcon />
      </button>
    </div>
  );
}
