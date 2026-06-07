import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getBackPage, NavigationState } from "../utils/NavigationState";
import {
  getDesignFlowStepIndex,
  getDesignFlowStepPath,
  getDesignFlowSteps,
} from "../utils/designFlowSteps";
import "./DesignFlowNav.css";

export default function DesignFlowNav({
  currentStepId,
  title = null,
  forceVisible = false,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const steps = getDesignFlowSteps();
  const currentIndex = getDesignFlowStepIndex(currentStepId);
  const isDesignFlow = NavigationState.flowType === "new";
  const showStepper = isDesignFlow && steps.length > 0 && currentIndex >= 0;
  const hasBack =
    forceVisible ||
    isDesignFlow ||
    currentStepId === "products" ||
    Boolean(getBackPage(currentStepId));

  const handleBack = () => {
    if (
      NavigationState.fromCatalogDesign &&
      (currentStepId === "camera" || currentStepId === "photograph")
    ) {
      navigate("/section-details");
      return;
    }

    if (currentStepId === "products") {
      if (isDesignFlow) {
        navigate("/photograph");
        return;
      }
      if (NavigationState.productsEntry === "catalog") {
        const category = new URLSearchParams(window.location.search).get("category");
        if (category) {
          navigate(`/subcategory?category=${encodeURIComponent(category)}`);
        } else {
          navigate("/collections");
        }
        return;
      }
      navigate("/section-details");
      return;
    }

    const backPage = getBackPage(currentStepId);
    if (backPage && backPage !== "/") {
      navigate(backPage);
      return;
    }
    if (currentStepId === "section-details" && NavigationState.project?.id) {
      navigate(`/projects-details/${NavigationState.project.id}`);
      return;
    }
    if (currentStepId === "camera") {
      navigate("/projects");
      return;
    }
    navigate(-1);
  };

  const handleStepClick = (stepId, index) => {
    if (index === currentIndex) {
      return;
    }

    const path = getDesignFlowStepPath(stepId);
    if (path) {
      navigate(path);
    }
  };

  if (!hasBack && !title && !showStepper) {
    return null;
  }

  return (
    <nav className="design-flow-nav" aria-label={t("designFlow.navLabel")}>
      <div className="design-flow-nav__side design-flow-nav__side--start">
        {hasBack && (
          <button
            type="button"
            className="design-flow-nav__back"
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
        )}
      </div>

      {showStepper && (
        <ol className="design-flow-nav__steps">
          {steps.map((step, index) => {
            const isComplete = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <li key={step.id} className="design-flow-nav__step-item">
                <button
                  type="button"
                  className={`design-flow-nav__step${
                    isCurrent ? " design-flow-nav__step--current" : ""
                  }${isComplete ? " design-flow-nav__step--complete" : ""}`}
                  onClick={() => handleStepClick(step.id, index)}
                  disabled={isCurrent}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={t(step.labelKey)}
                >
                  <span className="design-flow-nav__step-dot" aria-hidden="true">
                    {isComplete ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 12l5 5L19 7"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="design-flow-nav__step-label">
                    {t(step.labelKey)}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}

      <div className="design-flow-nav__side design-flow-nav__side--end">
        {title && <div className="design-flow-nav__title">{title}</div>}
      </div>
    </nav>
  );
}
