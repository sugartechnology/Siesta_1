import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

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
            Her Parçada Zarafet, Her Dokunuşta Siesta İmzası
          </h2>
          <p className="hero-description">
            Tüm Siesta ürünlerini tek bir yerde keşfedin. Detaylı inceleyin,
            favorilerinizi seçin.
          </p>
          <button className="hero-button" onClick={() => navigate("/catalog")}>
            Catalog
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
            Ürünleri Mekânlarınıza Taşıyın, Hayalinizi Çizgiye Sığdırmayın
          </h2>
          <p className="hero-description">
            Yeni projeler başlatın, eskilerini yönetin ve yapay zekâ ile
            sahnelerinizi tasarlayın.
          </p>
          <button className="hero-button" onClick={() => navigate("/projects")}>
            Projects
          </button>
        </div>
      </div>
    </div>
  );
}
