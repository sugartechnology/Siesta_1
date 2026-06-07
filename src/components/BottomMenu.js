import "./BottomMenu.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MAIN_NAV_ITEMS } from "./navIcons";

const BottomMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div className="bottom-menu">
      <nav className="bm-nav-links" aria-label={t("nav.bottomMenu", { defaultValue: "Main navigation" })}>
        {MAIN_NAV_ITEMS.map(({ id, path, match, Icon, labelKey, shortLabelKey }) => {
          const isActive = match(location.pathname);

          return (
            <button
              key={id}
              type="button"
              className={`bm-nav-link bm-nav-link--${id}${isActive ? " bm-nav-link--active" : ""}`}
              onClick={() => navigate(path)}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="bm-nav-indicator" aria-hidden="true" />
              <span className="bm-nav-icon-wrap">
                <Icon active={isActive} />
              </span>
              <span className="bm-nav-label">
                <span className="bm-nav-label-full">{t(labelKey)}</span>
                {shortLabelKey && (
                  <span className="bm-nav-label-short">{t(shortLabelKey)}</span>
                )}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomMenu;
