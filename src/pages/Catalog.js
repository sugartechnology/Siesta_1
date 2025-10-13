import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Catalog.css';

export default function Catalog() {
  const navigate = useNavigate();

  const categories = [
    { id: 1, name: 'Contract', image: '/assets/catalog-contract.png', path: '/subcategory' },
    { id: 2, name: 'Rattan', image: '/assets/catalog-rattan.png', path: '/subcategory' },
    { id: 3, name: 'Garden', image: '/assets/catalog-garden.png', path: '/subcategory' }
  ];

  return (
    <div className="catalog-container">
      <div className="catalog-content">
        {/* Top Menu */}
        <div className="catalog-top-menu">
          <div className="menu-left">
            <div className="back-icon" onClick={() => navigate('/home')}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M20 24L12 16L20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="menu-item" onClick={() => navigate('/home')}>Home</span>
            <span className="menu-item">Collections</span>
            <span className="menu-item" onClick={() => navigate('/projects')}>Projects</span>
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

        {/* Category Cards */}
        <div className="catalog-categories">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="category-card"
              onClick={() => navigate(category.path)}
            >
              <div className="category-image-container">
                <img src={category.image} alt={category.name} className="category-image" />
                <div className="category-overlay"></div>
              </div>
              <div className="category-label">
                <h2 className="category-name">{category.name}</h2>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
