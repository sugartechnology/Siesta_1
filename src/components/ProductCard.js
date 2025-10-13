import React from 'react';
import './ProductCard.css';

const ProductCard = ({ product, showActions = false }) => {
  return (
    <div className="product-card">
      <div className="product-image-container">
        <div className="product-image" style={{ backgroundColor: product.bgColor || '#f5f5f5' }}>
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <div className="product-placeholder">{product.name}</div>
          )}
        </div>
        {showActions && (
          <div className="product-actions">
            <button className="action-btn wishlist">♥</button>
            <button className="action-btn quick-view">👁</button>
            <button className="action-btn compare">⚖</button>
          </div>
        )}
      </div>
      <div className="product-info">
        <div className="product-details">
          <p className="product-code">Code: {product.code}</p>
          <h3 className="product-name">{product.name}</h3>
          <p className="product-price">${product.price}</p>
        </div>
        <button className="add-to-cart-btn">+</button>
      </div>
    </div>
  );
};

export default ProductCard;



