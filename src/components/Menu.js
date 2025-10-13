import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Menu.css';

const Menu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Projects', path: '/projects', icon: '📁' },
    { name: 'Catalog', path: '/catalog', icon: '📚' },
    { name: 'Products', path: '/products', icon: '🛋️' },
    { name: 'Profile', path: '/profile', icon: '👤' }
  ];

  return (
    <div className="menu">
      {menuItems.map((item, index) => (
        <button
          key={index}
          className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="menu-icon">{item.icon}</span>
          <span className="menu-text">{item.name}</span>
        </button>
      ))}
    </div>
  );
};

export default Menu;



