import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Products.css';

export default function Products() {
  const navigate = useNavigate();
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeFilters, setActiveFilters] = useState(['Filter 1', 'Filter 2', 'Filter 3', 'Filter 4']);
  const [variantQuantities, setVariantQuantities] = useState({
    1: 2,  // Black
    2: 0,  // White
    3: 1,  // Olive Green
    4: 0,  // Taupe
    5: 1,  // Dark Grey
    6: 0   // Marsala
  });

  // Figma product images
  const img02 = "http://localhost:3845/assets/bf4a83eb75528411ffaad26c0a927b96401c88e5.png";
  const img3 = "http://localhost:3845/assets/926e7ce4ce4bbff3824c4861a64e8260118059a2.png";
  const img4 = "http://localhost:3845/assets/d57e531839470a67382710da5264460f295a81fb.png";
  const img5 = "http://localhost:3845/assets/3fd4d41096aa9bb62c313d131a51afb1cf26c4ef.png";
  const img6 = "http://localhost:3845/assets/e55c1aba30c76e4eab0da799e6471588ea482fd5.png";
  const img7 = "http://localhost:3845/assets/5f0130d6302d6dd3f3d04276f815e487e756e44a.png";
  const img8 = "http://localhost:3845/assets/be884f6eb157910b7d19e9dae16fa1ec92137a59.png";
  const img9 = "http://localhost:3845/assets/3a5ed71b34346667a9b87c7e5ecd6f3cae6d19ee.png";
  const img10 = "http://localhost:3845/assets/5c593eb109e4f4d5f953dab28054b56e772862e9.png";

  const products = [
    { id: 1, code: '220', name: 'Tulum Armchair', price: '39.99', image: img02, hasVariants: false },
    { id: 2, code: '213', name: 'Portofino Chair', price: '49.99', image: img3, hasVariants: false },
    { id: 3, code: '212', name: 'Portofino Armchair', price: '39.55', image: img4, hasVariants: true },
    { id: 4, code: '945', name: 'Portofino Seat Cushion', price: '89.00', image: img5, hasVariants: false },
    { id: 5, code: '945', name: 'Portofino Seat Cushion', price: '89.00', image: img6, hasVariants: false },
    { id: 6, code: '220', name: 'Tulum Armchair', price: '39.99', image: img7, hasVariants: false },
    { id: 7, code: '212', name: 'Portofino Armchair', price: '39.55', image: img8, hasVariants: true },
    { id: 8, code: '213', name: 'Portofino Chair', price: '49.99', image: img9, hasVariants: false },
    { id: 9, code: '220', name: 'Tulum Armchair', price: '39.99', image: img10, hasVariants: false },
    { id: 10, code: '220', name: 'Tulum Armchair', price: '39.99', image: img10, hasVariants: false },
    { id: 11, code: '220', name: 'Tulum Armchair', price: '39.99', image: img10, hasVariants: false },
    { id: 12, code: '220', name: 'Tulum Armchair', price: '39.99', image: img10, hasVariants: false },
  ];

  const variants = [
    { id: 1, name: 'Black', stock: 2, image: '/assets/variant-black.png' },
    { id: 2, name: 'White', stock: 0, image: '/assets/variant-white.png' },
    { id: 3, name: 'Olive Green', stock: 1, image: '/assets/variant-olive-green.png' },
    { id: 4, name: 'Taupe', stock: 0, image: '/assets/variant-taupe.png' },
    { id: 5, name: 'Dark Grey', stock: 1, image: '/assets/variant-dark-grey.png' },
    { id: 6, name: 'Marsala', stock: 0, image: '/assets/variant-marsala.png' },
  ];

  const removeFilter = (filter) => {
    setActiveFilters(activeFilters.filter(f => f !== filter));
  };

  const handleAddToCart = (product) => {
    if (product.hasVariants) {
      setSelectedProduct(product);
      setShowVariantModal(true);
    } else {
      // Add product directly to cart
      console.log('Add to cart:', product);
    }
  };

  const handleQuantityChange = (variantId, delta) => {
    setVariantQuantities(prev => {
      const currentQty = prev[variantId] || 0;
      const newQty = Math.max(0, currentQty + delta); // Don't allow negative quantities
      return {
        ...prev,
        [variantId]: newQty
      };
    });
  };

  return (
    <div className="products-container">
      <div className="products-content">
        {/* Top Menu */}
        <div className="products-top-menu">
          <div className="menu-left">
            <div className="back-icon" onClick={() => navigate('/subcategory')}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M20 24L12 16L20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                <path d="M23.3333 24.5V22.1667C23.3333 20.9906 22.8609 19.862 22.0103 19.0114C21.1597 18.1609 20.0311 17.6875 18.8542 17.6875H9.14583C7.96875 17.6875 6.8401 18.1609 5.9895 19.0114C5.13891 19.862 4.66667 20.9906 4.66667 22.1667V24.5" stroke="black" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 14C16.5773 14 18.6667 11.9106 18.6667 9.33333C18.6667 6.75609 16.5773 4.66667 14 4.66667C11.4228 4.66667 9.33333 6.75609 9.33333 9.33333C9.33333 11.9106 11.4228 14 14 14Z" stroke="black" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="products-filters-section">
          <div className="filter-buttons">
            <button className="filter-btn">
              Category
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="filter-btn">
              Sub Cat
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="filter-btn active">
              Rooms
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                <path d="M1 1L6 6L1 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="filter-btn active">
              Styles
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                <path d="M1 1L6 6L1 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="search-bar">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M6.5 11.5C9.26142 11.5 11.5 9.26142 11.5 6.5C11.5 3.73858 9.26142 1.5 6.5 1.5C3.73858 1.5 1.5 3.73858 1.5 6.5C1.5 9.26142 3.73858 11.5 6.5 11.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.5 13.5L10.1 10.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input type="text" placeholder="Search" />
          </div>
        </div>

        {/* Active Filters */}
        <div className="active-filters">
          {activeFilters.map((filter, index) => (
            <div key={index} className="filter-chip">
              <span>{filter}</span>
              <button onClick={() => removeFilter(filter)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Products Grid */}
        <div className="products-grid-container">
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <img src={product.image} alt={product.name} className="product-image" />
                  
                  {/* Product Actions (Visible on hover) */}
                  <div className="product-actions">
                    <button className="action-btn wishlist">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M15.75 3.375C14.625 2.25 12.75 2.0625 11.25 2.8125C10.5 3.1875 9.75 3.9375 9 4.875C8.25 3.9375 7.5 3.1875 6.75 2.8125C5.25 2.0625 3.375 2.25 2.25 3.375C0.75 4.875 0.75 7.3125 2.25 8.8125L9 15.5625L15.75 8.8125C17.25 7.3125 17.25 4.875 15.75 3.375Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button className="action-btn quick-view">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 7.5C8.625 7.5 7.5 8.625 7.5 10C7.5 11.375 8.625 12.5 10 12.5C11.375 12.5 12.5 11.375 12.5 10C12.5 8.625 11.375 7.5 10 7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        <path d="M2.5 10C2.5 10 5 5 10 5C15 5 17.5 10 17.5 10C17.5 10 15 15 10 15C5 15 2.5 10 2.5 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button 
                      className="action-btn variants" 
                      onClick={() => handleAddToCart(product)}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 5C10.5523 5 11 4.55228 11 4C11 3.44772 10.5523 3 10 3C9.44772 3 9 3.44772 9 4C9 4.55228 9.44772 5 10 5Z" fill="currentColor" />
                        <path d="M10 11C10.5523 11 11 10.5523 11 10C11 9.44772 10.5523 9 10 9C9.44772 9 9 9.44772 9 10C9 10.5523 9.44772 11 10 11Z" fill="currentColor" />
                        <path d="M10 17C10.5523 17 11 16.5523 11 16C11 15.4477 10.5523 15 10 15C9.44772 15 9 15.4477 9 16C9 16.5523 9.44772 17 10 17Z" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="product-info">
                  <div className="product-details">
                    <p className="product-code">Code: {product.code}</p>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">${product.price}</p>
                  </div>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product)}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 5V15M5 10H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* View All Products Button */}
          <button className="view-all-btn">View all products</button>
        </div>
      </div>

      {/* Variant Modal */}
      {showVariantModal && (
        <>
          <div className="modal-backdrop" onClick={() => setShowVariantModal(false)} />
          <div className="variant-modal">
            <div className="modal-header">
              <h2>Portofino Bar 75 Variants</h2>
              <button className="close-btn" onClick={() => setShowVariantModal(false)}>
                <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
                  <path d="M16 5L5 16M5 5L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="variants-grid">
              {variants.map((variant) => {
                const currentQuantity = variantQuantities[variant.id] || 0;
                return (
                  <div key={variant.id} className={`variant-item ${currentQuantity > 0 ? 'in-stock' : ''}`}>
                    <div className="variant-image-container">
                      <img src={variant.image} alt={variant.name} className="variant-image" />
                    </div>
                    <p className="variant-title">Portofino Bar 75</p>
                    <p className="variant-color">{variant.name}</p>
                    <div className="quantity-control">
                      <button 
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(variant.id, -1)}
                        disabled={currentQuantity === 0}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M4 8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <span className="quantity">{currentQuantity}</span>
                      <button 
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(variant.id, 1)}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="add-to-design-btn">Add to Design</button>
          </div>
        </>
      )}
    </div>
  );
}
