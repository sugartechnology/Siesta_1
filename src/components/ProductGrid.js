import React, { useState } from 'react';
import './ProductGrid.css';

const ProductGrid = ({ products, onProductClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 1, name: 'Category', selected: false },
    { id: 2, name: 'Sub Cat', selected: false },
    { id: 3, name: 'Rooms', selected: true },
    { id: 4, name: 'Styles', selected: true }
  ];

  const filters = ['Filter 1', 'Filter 2', 'Filter 3', 'Filter 4'];

  return (
    <div className="product-grid-container">
      <div className="header-section">
        <div className="view-all-button">
          View all products
        </div>
      </div>

      <div className="living-room-products">
        <div className="filters-section">
          <div className="main-filters">
            <div className="category-filters">
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  className={`category-btn ${cat.selected ? 'selected' : ''}`}
                >
                  {cat.name}
                  <span className="dropdown-arrow">▼</span>
                </button>
              ))}
            </div>
            
            <div className="search-tab">
              <img src="/assets/search-icon.svg" alt="Search" className="search-icon" />
              <input 
                type="text" 
                placeholder="Search" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-chips">
            {filters.map((filter, idx) => (
              <button key={idx} className="filter-chip">
                {filter}
                <span className="filter-icon">▼</span>
              </button>
            ))}
          </div>
        </div>

        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card" onClick={() => onProductClick(product)}>
              <div className="product-image-container">
                <img src={product.image} alt={product.name} className="product-image" />
                {product.id === 3 && (
                  <div className="product-actions">
                    <button className="action-btn wishlist">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M9 16l-1.5-1.3C3.4 11 1 8.8 1 6.2 1 4.2 2.5 2.7 4.5 2.7c1.5 0 2.9.9 3.5 2.2.6-1.3 2-2.2 3.5-2.2 2 0 3.5 1.5 3.5 3.5 0 2.6-2.4 4.8-6.5 8.5L9 16z" stroke="#000" strokeWidth="1.5"/>
                      </svg>
                    </button>
                    <button className="action-btn quick-view">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="7.5" cy="7.5" r="6" stroke="#000" strokeWidth="1.5"/>
                        <path d="M15 15l-3-3" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M7.5 5v5M5 7.5h5" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <button className="action-btn compare">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="5" cy="9" r="3.5" stroke="#000" strokeWidth="1.5"/>
                        <circle cx="13" cy="9" r="3.5" stroke="#000" strokeWidth="1.5"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <div className="product-info">
                <div className="product-details">
                  <p className="product-code">Code: {product.code}</p>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">${product.price}</p>
                </div>
                <button className="add-to-cart">+</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;

