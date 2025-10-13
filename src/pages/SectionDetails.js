import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SectionDetails.css';

const SectionDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sectionData = location.state?.section || {
    id: 1,
    name: 'Section 1',
    image: '/assets/project-01.png'
  };
  const projectData = location.state?.projectData || {
    name: 'Project Name'
  };

  // All sections for the project
  const allSections = [
    { id: 1, name: 'Section 1', image: '/assets/project-01.png' },
    { id: 2, name: 'Section 2', image: '/assets/project-02.png' },
    { id: 3, name: 'Section 3', image: '/assets/project-03.png' },
    { id: 4, name: 'Section 4', image: '/assets/project-01.png' },
    { id: 5, name: 'Section 5', image: '/assets/project-01.png' },
    { id: 6, name: 'Section 6', image: '/assets/project-01.png' }
  ];

  // Reorder sections: selected first, then others
  const orderedSections = [
    sectionData,
    ...allSections.filter(s => s.id !== sectionData.id)
  ];

  const imgLogo = "http://localhost:3845/assets/56b68463c1acec5ac9da8e728326a8fb6cf8482d.png";
  
  // Sample product images from Figma
  const imgProduct1 = "http://localhost:3845/assets/3160be7ed24b9e210246af55435493d7e3872017.png";
  const imgProduct2 = "http://localhost:3845/assets/fdd122c3304d01dc790a2dc2ca8fbb323494469d.png";
  const imgProduct3 = "http://localhost:3845/assets/76143599dc199048fdb6a43df08637876f631368.png";
  const imgProduct4 = "http://localhost:3845/assets/9840285d5c8dd51c0e018b017a55ead84beda282.png";
  const imgReferenceImage = "http://localhost:3845/assets/fd4d87266f701d5286c02f53ba7ac6565429c2d0.png";
  const imgBalconyImage = "http://localhost:3845/assets/a364d7911167dd86f6e21f5466b88fb03293b9fd.png";
  const imgLastGenerated = "http://localhost:3845/assets/c17783bc128a59abf3e6e172b69183f17c101588.png";

  const [products, setProducts] = useState([
    { id: 1, name: 'Red Chair', price: 12.00, image: imgProduct1, color: 'Red', size: '38', quantity: 2 },
    { id: 2, name: 'Red Chair', price: 12.00, image: imgProduct2, color: 'Black', size: '38', quantity: 1 },
    { id: 3, name: 'Red Chair', price: 12.00, image: imgProduct3, color: 'Black', size: '38', quantity: 1 },
    { id: 4, name: 'Red Chair', price: 12.00, image: imgProduct4, color: 'Black', size: '38', quantity: 1 },
  ]);

  const [projectDetails, setProjectDetails] = useState('Project details you entered.');

  const handleQuantityChange = (productId, change) => {
    setProducts(products.map(product => {
      if (product.id === productId) {
        const newQuantity = Math.max(0, product.quantity + change);
        return { ...product, quantity: newQuantity };
      }
      return product;
    }));
  };

  const handleAddNewProduct = () => {
    // Navigate to products page to add new product
    navigate('/products');
  };

  const handleChangeReference = () => {
    // Navigate back to camera to change reference image
    navigate('/camera', { state: { projectData, sectionData } });
  };

  const handleChangeRoomType = () => {
    // Navigate to room type selection
    navigate('/room-type', { state: { projectData, sectionData } });
  };

  const handleRegenerate = () => {
    console.log('Regenerating design...');
    // TODO: Implement regeneration logic
  };

  const handleSectionClick = (section) => {
    // Navigate to the same page but with different section data
    navigate('/section-details', { state: { section, projectData } });
  };

  const handleAddNewSection = () => {
    navigate('/camera', { state: { projectData, isNewSection: true } });
  };

  return (
    <div className="section-details-container">
      <div className="section-details-content-wrapper">
        {/* Top Menu */}
        <div className="section-details-top-menu">
          <div className="menu-left">
            <div className="back-icon" onClick={() => navigate('/project-details', { state: { projectData } })}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M20 24L12 16L20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="menu-item" onClick={() => navigate('/home')}>Home</span>
            <span className="menu-item" onClick={() => navigate('/projects')}>Projects</span>
            <span className="menu-item active">{sectionData.name}</span>
          </div>
          <div className="menu-center">
            <img src={imgLogo} alt="Siesta" className="logo" />
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

        {/* Project Name Title */}
        <h1 className="section-project-title">{projectData.name}</h1>

        {/* Sections List */}
        <div className="sections-list-container">
          <div className="sections-list">
            {orderedSections.map((section, index) => (
              <div
                key={section.id}
                className={`section-thumbnail ${index === 0 ? 'active' : ''}`}
                onClick={() => handleSectionClick(section)}
              >
                <img src={section.image} alt={section.name} className="section-thumbnail-image" />
                <div className="section-thumbnail-overlay"></div>
                <span className="section-thumbnail-name">{section.name}</span>
              </div>
            ))}
            <div className="add-section-thumbnail" onClick={handleAddNewSection}>
              <div className="add-section-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M24 12V36M12 24H36" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="add-section-text">Add New Section</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="section-details-main-content">
          {/* Left Panel - Products List */}
          <div className="products-panel">
            <div className="products-list">
              {products.map((product) => (
                <React.Fragment key={product.id}>
                  <div className="product-item">
                    <div className="product-info">
                      <img src={product.image} alt={product.name} className="product-image" />
                      <div className="product-details">
                        <h3 className="product-name">{product.name}</h3>
                        <p className="product-price">${product.price.toFixed(2)}</p>
                        <div className="product-attributes">
                          <div className="color-indicator" style={{ backgroundColor: product.color.toLowerCase() }}></div>
                          <span className="product-color">{product.color}</span>
                          <div className="attribute-divider"></div>
                          <span className="product-size">Size {product.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="quantity-controls">
                      <button 
                        className="quantity-btn decrease"
                        onClick={() => handleQuantityChange(product.id, -1)}
                        disabled={product.quantity === 0}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="9" stroke="white" strokeWidth="1.5" />
                          <path d="M6 10H14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                      <span className="quantity-number">{product.quantity}</span>
                      <button 
                        className="quantity-btn increase"
                        onClick={() => handleQuantityChange(product.id, 1)}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="9" stroke="white" strokeWidth="1.5" />
                          <path d="M10 6V14M6 10H14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="product-divider"></div>
                </React.Fragment>
              ))}
            </div>
            <button className="add-product-btn" onClick={handleAddNewProduct}>
              Add new product
            </button>
          </div>

          {/* Right Panel - Section Information */}
          <div className="info-panel">
            {/* Reference Image */}
            <div className="info-item">
              <img src={imgReferenceImage} alt="Reference" className="info-thumbnail" />
              <div className="info-content">
                <h3 className="info-title">Reference Image</h3>
                <p className="info-description">The photo you uploaded to begin your project.</p>
                <button className="change-btn" onClick={handleChangeReference}>Change</button>
              </div>
            </div>
            <div className="info-divider"></div>

            {/* Room Type */}
            <div className="info-item">
              <img src={imgBalconyImage} alt="Balcony" className="info-thumbnail" />
              <div className="info-content">
                <h3 className="info-title">Balcony</h3>
                <p className="info-description">The room type you selected for the project.</p>
                <button className="change-btn" onClick={handleChangeRoomType}>Change</button>
              </div>
            </div>
            <div className="info-divider"></div>

            {/* Project Details */}
            <div className="project-details-box">
              <textarea 
                className="project-details-textarea"
                value={projectDetails}
                onChange={(e) => setProjectDetails(e.target.value)}
                placeholder="Enter project details..."
              />
            </div>
            <div className="info-divider"></div>

            {/* Last Generated */}
            <div className="info-item">
              <img src={imgLastGenerated} alt="Last Generated" className="info-thumbnail" />
              <div className="info-content">
                <h3 className="info-title">Last Generated</h3>
                <p className="info-description">Preview of your most recently generated design.</p>
                <button className="change-btn" onClick={handleRegenerate}>Regenerate</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionDetails;

