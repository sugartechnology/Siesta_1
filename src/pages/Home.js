import { useNavigate } from "react-router-dom";
import "./Home.css";
import { useTranslation } from "react-i18next";

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="hero-section">
      {/* Left Card - Catalog */}
      <div className="hero-card">
        <div className="hero-image-container">
          <img
            src="/assets/home-image1.png"
            alt="Catalog"
            className="hero-image"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h2 className="hero-title">
            {t('home.catalogTitle')}
          </h2>
          <p className="hero-description">
            {t('home.catalogDesc')}
          </p>
          <button className="hero-button" onClick={() => navigate("/catalog")}>
            {t('home.catalogBtn')}
          </button>
        </div>
      </div>

      {/* Right Card - Projects */}
      <div className="hero-card">
        <div className="hero-image-container">
          <img
            src="/assets/home-image2.png"
            alt="Projects"
            className="hero-image"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h2 className="hero-title">
            {t('home.projectsTitle')}
          </h2>
          <p className="hero-description">
            {t('home.projectsDesc')}
          </p>
          <button className="hero-button" onClick={() => navigate("/projects")}>
            {t('home.projectsBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
