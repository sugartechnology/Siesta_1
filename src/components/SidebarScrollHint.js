import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./SidebarScrollHint.css";

const STORAGE_KEY = "siesta.sectionDetails.scrollHintDismissed";
const SCROLL_DISMISS_DELAY_MS = 2000;

export default function SidebarScrollHint({ scrollContainerRef }) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const dismissTimerRef = useRef(null);
  const scrollDismissStartedRef = useRef(false);

  const clearDismissTimer = () => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  };

  const dismiss = () => {
    clearDismissTimer();
    scrollDismissStartedRef.current = true;
    setIsVisible(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
  };

  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return undefined;

    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      return undefined;
    }

    const updateVisibility = () => {
      if (scrollDismissStartedRef.current) return;

      const canScroll = container.scrollHeight > container.clientHeight + 12;
      setIsVisible(canScroll);
    };

    updateVisibility();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateVisibility)
        : null;

    resizeObserver?.observe(container);
    window.addEventListener("resize", updateVisibility);

    const scheduleDismissAfterScroll = () => {
      if (scrollDismissStartedRef.current || dismissTimerRef.current) return;

      scrollDismissStartedRef.current = true;
      dismissTimerRef.current = setTimeout(() => {
        dismissTimerRef.current = null;
        setIsVisible(false);
        sessionStorage.setItem(STORAGE_KEY, "1");
      }, SCROLL_DISMISS_DELAY_MS);
    };

    const handleScroll = () => {
      if (container.scrollTop > 16) {
        scheduleDismissAfterScroll();
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearDismissTimer();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateVisibility);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [scrollContainerRef]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="sd-scroll-hint" role="note">
      <div className="sd-scroll-hint__demo" aria-hidden="true">
        <div className="sd-scroll-hint__phone">
          <div className="sd-scroll-hint__viewport">
            <div className="sd-scroll-hint__content">
              <span className="sd-scroll-hint__block sd-scroll-hint__block--photo" />
              <span className="sd-scroll-hint__block sd-scroll-hint__block--space" />
              <span className="sd-scroll-hint__block sd-scroll-hint__block--prompt" />
              <span className="sd-scroll-hint__block sd-scroll-hint__block--products" />
            </div>
          </div>
          <div className="sd-scroll-hint__scrollbar">
            <span className="sd-scroll-hint__thumb" />
          </div>
        </div>
        <div className="sd-scroll-hint__gesture">
          <span className="sd-scroll-hint__chevron" />
          <span className="sd-scroll-hint__chevron sd-scroll-hint__chevron--delay" />
        </div>
      </div>

      <div className="sd-scroll-hint__copy">
        <p className="sd-scroll-hint__title">{t("sectionDetails.sidebarScrollHintTitle")}</p>
        <p className="sd-scroll-hint__text">{t("sectionDetails.sidebarScrollHint")}</p>
      </div>

      <button
        type="button"
        className="sd-scroll-hint__dismiss"
        onClick={dismiss}
        aria-label={t("sectionDetails.sidebarScrollHintDismiss")}
      >
        ×
      </button>
    </div>
  );
}
