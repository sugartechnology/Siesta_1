import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">
        {/* Top Menu */}
        <div className="home-top-menu">
          <div className="menu-left">
            <span className="menu-item active">Home</span>
            <span className="menu-item">Collections</span>
            <span className="menu-item" onClick={() => navigate('/projects')}>Projects</span>
            <span className="menu-item" onClick={() => navigate('/catalog')}>Catalog</span>
          </div>
          <div className="menu-center">
            <img src="/assets/logo.png" alt="Siesta" className="logo" />
          </div>
          <div className="menu-right">
            <div className="profile-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="9" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 22c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Hero Cards */}
        <div className="hero-section">
          {/* Left Card - Catalog */}
          <div className="hero-card">
            <div className="hero-image-container">
              <img src="/assets/home-image1.png" alt="Catalog" className="hero-image" />
              <div className="hero-overlay"></div>
            </div>
            <div className="hero-content">
              <h2 className="hero-title">Her Parçada Zarafet, Her Dokunuşta Siesta İmzası</h2>
              <p className="hero-description">
                Tüm Siesta ürünlerini tek bir yerde keşfedin. Detaylı inceleyin, favorilerinizi seçin.
              </p>
              <button className="hero-button" onClick={() => navigate('/catalog')}>
                Catalog
              </button>
            </div>
          </div>

          {/* Right Card - Projects */}
          <div className="hero-card">
            <div className="hero-image-container">
              <img src="/assets/home-image2.png" alt="Projects" className="hero-image" />
              <div className="hero-overlay"></div>
            </div>
            <div className="hero-content">
              <h2 className="hero-title">Ürünleri Mekânlarınıza Taşıyın, Hayalinizi Çizgiye Sığdırmayın</h2>
              <p className="hero-description">
                Yeni projeler başlatın, eskilerini yönetin ve yapay zekâ ile sahnelerinizi tasarlayın.
              </p>
              <button className="hero-button" onClick={() => navigate('/projects')}>
                Projects
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
