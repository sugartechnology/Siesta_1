import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SubCategory.css';

export default function SubCategory() {
  const navigate = useNavigate();

  const categories = [
    { id: 1, name: 'Chairs', image: '/assets/subcategory-chairs.png', path: '/products', gridArea: 'chairs', multiline: false },
    { id: 2, name: 'Lighting', image: '/assets/subcategory-lighting.png', path: '/products', gridArea: 'lighting', multiline: false },
    { id: 3, name: 'Stools &\nComplements', image: '/assets/subcategory-stools.png', path: '/products', gridArea: 'stools', multiline: true },
    { id: 4, name: 'Sunlounger &\nLounge', image: '/assets/subcategory-sunlounger.png', path: '/products', gridArea: 'sunlounger', multiline: true },
    { id: 5, name: 'Tables', image: '/assets/subcategory-tables.png', path: '/products', gridArea: 'tables', multiline: false }
  ];

  return (
    <div className="subcategory-container">
      <div className="subcategory-content">
        {/* Top Menu */}
        <div className="subcategory-top-menu">
          <div className="menu-left">
            <div className="back-icon" onClick={() => navigate('/catalog')}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M20 24L12 16L20 8" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                <circle cx="14" cy="9" r="4" stroke="#000" strokeWidth="2"/>
                <path d="M6 24C6 19.5817 9.58172 16 14 16C18.4183 16 22 19.5817 22 24" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Category Grid */}
        <div className="category-grid">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`category-card ${category.gridArea}`}
              onClick={() => navigate(category.path)}
              style={{ backgroundImage: `url(${category.image})` }}
            >
              <div className="category-overlay"></div>
              <p className={`category-name ${category.multiline ? 'multiline' : ''}`}>
                {category.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


