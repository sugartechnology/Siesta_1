import React, { useState } from 'react';
import './ProductVariantModal.css';
import { useTranslation } from 'react-i18next';

const ProductVariantModal = ({ product, onClose }) => {
  const { t } = useTranslation();
  const variants = [
    { id: 1, name: 'Black', image: '/assets/variant-black.png', quantity: 2 },
    { id: 2, name: 'White', image: '/assets/variant-white.png', quantity: 0 },
    { id: 3, name: 'Olive Green', image: '/assets/variant-green.png', quantity: 1 },
    { id: 4, name: 'Taupe', image: '/assets/variant-taupe.png', quantity: 0 },
    { id: 5, name: 'Dark Grey', image: '/assets/variant-grey.png', quantity: 1 },
    { id: 6, name: 'Marsala', image: '/assets/variant-marsala.png', quantity: 0 },
  ];

  const [quantities, setQuantities] = useState(
    variants.reduce((acc, v) => ({ ...acc, [v.id]: v.quantity }), {})
  );

  const increment = (id) => {
    setQuantities(prev => ({ ...prev, [id]: prev[id] + 1 }));
  };

  const decrement = (id) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(0, prev[id] - 1) }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-rotated-wrapper">
        <div className="variant-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{t('variantModal.title')}</h2>
              <button className="close-btn" onClick={onClose}>
                <img src="/assets/close-icon.svg" alt="Close" />
              </button>
            </div>

            <div className="variants-grid">
              {variants.slice(0, 3).map((variant) => (
                console.log(variant),
                <div key={variant.id} className="variant-item">
                  <div className="variant-image-container">
                    <img src={variant.thumbnail || variant.thumbnailUrl || variant.thumbnail} alt={variant.name} className="variant-image" />
                  </div>
                  <p className="variant-product-name">Portofino Bar 75</p>
                  <p className="variant-name">{variant.name}</p>
                  <div className="quantity-control">
                    <button
                      className="qty-btn"
                      onClick={() => decrement(variant.id)}
                    >
                      −
                    </button>
                    <span className="qty-display">{quantities[variant.id]}</span>
                    <button
                      className="qty-btn"
                      onClick={() => increment(variant.id)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="variants-grid">
              {variants.slice(3, 6).map((variant) => (
                console.log(variant),
                <div key={variant.id} className="variant-item">
                  <div className="variant-image-container">
                    <img src={variant.thumbnail || variant.thumbnailUrl || variant.thumbnail} alt={variant.name} className="variant-image" />
                  </div>
                  <p className="variant-product-name">Portofino Bar 75</p>
                  <p className="variant-name">{variant.name}</p>
                  <div className="quantity-control">
                    <button
                      className="qty-btn"
                      onClick={() => decrement(variant.id)}
                    >
                      −
                    </button>
                    <span className="qty-display">{quantities[variant.id]}</span>
                    <button
                      className="qty-btn"
                      onClick={() => increment(variant.id)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="add-to-design-btn">
              {t('products.addToDesign')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductVariantModal;



