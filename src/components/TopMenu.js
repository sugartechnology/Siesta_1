import React from 'react';
import './TopMenu.css';

const TopMenu = () => {
  return (
    <div className="top-menu">
      <div className="menu-section">
        <div className="back-icon">
          <img src="/assets/back-icon.svg" alt="Back" />
        </div>
        <nav className="nav-links">
          <span className="nav-link">Home</span>
          <span className="nav-link">Collections</span>
          <span className="nav-link">Projects</span>
        </nav>
      </div>
      
      <div className="logo-section">
        <div className="logo">
          <img src="/assets/logo.png" alt="Siesta Exclusive" />
        </div>
      </div>
      
      <div className="menu-actions">
        <div className="profile-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="9" r="4" stroke="#000" strokeWidth="2"/>
            <path d="M6 24c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TopMenu;



