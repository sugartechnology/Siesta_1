import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  addProductToSection,
  addSectionToProject,
  deleteSection,
  getProductsByIds,
  createProject,
  updateProjectName,
  updateSectionName,
  removeProductFromSection,
} from "../api/Api";
import { useSectionDesign } from "../contexts/SectionDesignContext";
import EditableTitle from "../components/EditableTitle";
import FullscreenImagePopup from "../components/FullscreenImagePopup";
import { FullscreenLoadingSpinner } from "../components/FullscreenLoadingSpinner";
import SectionThumbnail from "../components/SectionThumbnail";
import {
  base64ToFile,
  getMimeTypeFromBase64,
  isValidBase64Image,
} from "../utils/ImageUtils";
import {
  getNextPage,
  NavigationState,
  roomTypes,
  setContextSection,
  startExistingSectionFlow,
  startNewSectionFlow,
  DefaultNavigationState,
} from "../utils/NavigationState";
import "./SectionDetails.css";
import SliderComponent from "../components/SliderComponent";
import { useTranslation } from "react-i18next";

const SectionDetails = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    startGeneration,
    registerSection,
    unregisterSection,
    subscribeSectionUpdates,
  } = useSectionDesign();
  const sectionIdRef = useRef(null);
  const waitingForGenerationResultRef = useRef(false);
  const [
    isFullscreenLoadingSpinnerVisible,
    setIsFullscreenLoadingSpinnerVisible,
  ] = useState(false);
  const [designGenerationError, setDesignGenerationError] = useState(null);
  // NavigationState parametrelerini section'a aktar ve temizle
  const initialSection = NavigationState.section || {
    rootImageUrl: "",
    thumbnailUrl: "",
    type: "",
    productIds: [],
  };

  // NavigationState'den gelen verileri section'a aktar
  if (NavigationState.image) {
    initialSection.rootImageUrl = NavigationState.image;
    NavigationState.image = "";
  }

  if (NavigationState.roomType) {
    initialSection.type = NavigationState.roomType.name;
    NavigationState.roomType = undefined;
  }

  if (
    NavigationState.selectedProducts &&
    NavigationState.selectedProducts.length > 0
  ) {
    initialSection.productIds = NavigationState.selectedProducts;
    NavigationState.selectedProducts = [];
  }

  const [section, setSection] = useState(initialSection);
  const [project, setProject] = useState(
    NavigationState.project || { name: "New Project", sections: [section] }
  );

  // All sections for the project
  const allSections = project ? project.sections : [];
  /*const orderedSections = allSections
    ? [section, ...allSections.filter((s) => s.id !== section.id)]
    : [];*/

  //console.log("orderedSections", orderedSections);
  const [products, setProducts] = useState(initialSection?.productIds || []);
  const [projectDetails, setProjectDetails] = useState();
  const [isFullscreenPopupVisible, setIsFullscreenPopupVisible] =
    useState(false);

  // useCallback to ensure handler is stable
  const handleImageClick = useCallback(() => {
    setIsFullscreenPopupVisible(prevState => {
      return true;
    });
  }, []);

  // Monitor state changes
  useEffect(() => {
    console.log("isFullscreenPopupVisible changed to:", isFullscreenPopupVisible);
  }, [isFullscreenPopupVisible]);

  sectionIdRef.current = section?.id;

  useEffect(() => {
    const sectionId = section?.id;
    if (sectionId) registerSection(sectionId);
    return () => unregisterSection(sectionId);
  }, [section?.id, registerSection, unregisterSection]);

  useEffect(() => {
    const unsubscribe = subscribeSectionUpdates((newSection) => {
      if (newSection?.id === sectionIdRef.current) {
        setSection(newSection);
        console.log("newSection", newSection);
        setProject((prev) =>
          prev
            ? {
                ...prev,
                sections: prev.sections.map((s) =>
                  s.id === newSection.id ? newSection : s
                ),
              }
            : prev
        );
        const status = newSection?.designs?.[0]?.status;
        if (status === "COMPLETED" || status === "FAILED" || status === "ERROR") {
          setIsFullscreenLoadingSpinnerVisible(false);
          if (waitingForGenerationResultRef.current) {
            waitingForGenerationResultRef.current = false;
            if (status === "FAILED" || status === "ERROR") {
              setDesignGenerationError(t("sectionDetails.designGenerationError"));
            }
          }
        }
      }
    });
    return unsubscribe;
  }, [subscribeSectionUpdates]);

  useEffect(() => {
    //
    // Get section by id
    if (NavigationState.sectionMode === "update-section") {
      if (!NavigationState.project || !NavigationState.project.id) {
        createProject({
          ...DefaultNavigationState.project,
        }).then((project) => {
          section.projectId = project.id;
          project.sections = [section];
          NavigationState.project = project;
          NavigationState.section = section;
          setContextSection(section);
          setProject(project);
          updateSection(section, project.id);
        });
      } else {
        setContextSection(section);
        updateSection(section);
      }

      NavigationState.sectionMode = undefined;
    }

    if (section.productIds && section.productIds.length > 0) {
      updateProducts(section);
    }
    //
  }, []);

  const updateSection = async (section, projectId = undefined) => {
    setIsFullscreenLoadingSpinnerVisible(true);
    const image = section.rootImageUrl;

    const updateSectionData = { ...section };
    updateSectionData.productIds = products.map((product) => ({
      productId: product.productId,
      quantity: product.quantity,
    }));

    updateSectionData.rootImageUrl = undefined;
    updateSectionData.thumbnailUrl = undefined;
    // Base64 image'ı File objesine dönüştür
    let imageFile = null;
    if (isValidBase64Image(image)) {
      // MIME type'a göre dosya uzantısı belirle
      const mimeType = getMimeTypeFromBase64(image);
      const extension = mimeType.includes("png")
        ? "png"
        : mimeType.includes("webp")
          ? "webp"
          : "jpg";
      imageFile = base64ToFile(image, `section-image.${extension}`);
    }

    const replaceSection = section;
    addSectionToProject(projectId || project.id, updateSectionData, imageFile)
      .then((response) => {
        setContextSection(response, replaceSection);
        setSection(response);
      })
      .finally(() => {
        setIsFullscreenLoadingSpinnerVisible(false);
      });
  };

  const handleQuantityChange = async (productIdd, change) => {
    const product = products.find((p) => p.productId === productIdd);
    const newQuantity = product
      ? Math.max(0, product.quantity + change)
      : 0;
    const isRemoval = change < 0 ;

    const updatedProducts = products
      .map((p) =>
        p.productId === productIdd ? { ...p, quantity: newQuantity } : p
      )
      .filter((p) => p.quantity > 0);

    NavigationState.section.productIds = updatedProducts;
    setProducts(updatedProducts);

    if (section.id) {
      try {
        if (isRemoval) {
          await removeProductFromSection(section.id, productIdd);
        } else {
          await addProductToSection(section.id, {
            productId: productIdd,
            quantity: change,
          });
        }
      } catch (error) {
        console.error("Error updating product quantity:", error);
        setProducts(products);
      }
    }
  };

  const handleAddNewProduct = () => {
    // Navigate to products page to add new product
    startExistingSectionFlow(project, section);
    NavigationState.sectionMode = "update-section";
    NavigationState.selectedProducts = section.productIds;
    navigate("/products");
  };

  const handleChangeReference = () => {
    startExistingSectionFlow(project, section);
    NavigationState.sectionMode = "update-section";
    navigate("/camera");
  };

  const handleChangeRoomType = () => {
    // Navigate to room type selection
    startExistingSectionFlow(project, section);
    NavigationState.sectionMode = "update-section";
    navigate("/room-type");
  };

  const handleRegenerate = () => {
    setDesignGenerationError(null);
    waitingForGenerationResultRef.current = true;
    setIsFullscreenLoadingSpinnerVisible(true);
    startGeneration(project.id, section.id, projectDetails);
  };

  const updateProducts = (sectionSelected) => {
    getProductsByIds(
      sectionSelected.productIds.map((product) => product.productId)
    ).then((newProducts) => {
      sectionSelected.productIds = newProducts.map((newProduct) => {
        const existingProduct = sectionSelected.productIds.find(
          (product) => product.productId === newProduct.productId
        );
        return existingProduct
          ? { ...newProduct, quantity: existingProduct.quantity }
          : newProduct;
      });
      setProducts(sectionSelected.productIds);
    });
  };

  const handleSectionClick = (sectionSelected) => {
    setContextSection(sectionSelected);
    setSection(sectionSelected);

    updateProducts(sectionSelected);
  };

  const handleSectionTitleChange = (newTitle) => {
    section.title = newTitle;
    setContextSection(section);
    setSection({ ...section });
    updateSectionName(section.id, newTitle).then((nsection) => {
      console.log("Section updated successfully:", nsection);
      setSection(nsection);
    });
  };

  const handleProjectTitleChange = (newTitle) => {
    NavigationState.project.name = newTitle;
    setProject({ ...NavigationState.project });
    updateProjectName(project.id, newTitle).then((nproject) => {
      console.log("Project updated successfully:", nproject);
      setProject(nproject);
    });
  };

  const handleAddNewSection = () => {
    startNewSectionFlow(project);
    navigate(getNextPage("*", { sectionMode: "update-section" }));
  };

  const handleRemoveSection = async (sectionToRemove) => {
    try {
      // Remove from local state
      const updatedSections = project.sections.filter(
        (s) => s.id !== sectionToRemove.id
      );
      setProject({ ...project, sections: updatedSections });

      // Update NavigationState
      NavigationState.project.sections = updatedSections;

      // If removed section was active, switch to first section
      if (sectionToRemove.id === section.id && updatedSections.length > 0) {
        const firstSection = updatedSections[0];
        setSection(firstSection);
        NavigationState.section = firstSection;
        updateProducts(firstSection);
      }

      // Backend'e section silme isteği gönder
      await deleteSection(sectionToRemove.id);

      console.log("Section deleted successfully:", sectionToRemove.id);
    } catch (error) {
      console.error("Error removing section:", error);
      // TODO: Show error message to user
    }
  };

  const getRoomType = (section) => {
    if (section.type) {
      return roomTypes.find((rt) => rt.name === section.type);
    }
    return undefined;
  };

  const getResultImageUrl = (section) => {
    const latest = section.designs?.[0];
    if (latest?.resultImageUrl) return latest.resultImageUrl;
    if (latest?.imageUrl) return latest.imageUrl;
    const withUrl = section.designs?.find((d) => d.resultImageUrl || d.imageUrl);
    return withUrl?.resultImageUrl || withUrl?.imageUrl;
  };

  const roomType = getRoomType(section);
  const latestDesign = section.designs?.[0];
  const desabled =
    latestDesign?.status === "PROCESSING" ||
    (latestDesign &&
      latestDesign.status !== "COMPLETED" &&
      latestDesign.status !== "FAILED" &&
      latestDesign.status !== "MOCKED");

  return (
    <div className="section-details-container">
      {designGenerationError && (
        <div className="section-details-error-banner" role="alert">
          {designGenerationError}
        </div>
      )}
      {/* Project Name Title */}
      <h1 className="section-project-title">
        {project ? (
          <EditableTitle
            value={project.name}
            onChange={handleProjectTitleChange}
            placeholder={t('sectionDetails.clickToEdit')}
            className="project-title"
            autoFocus={false}
          />
        ) : (
          t('sectionDetails.loading')
        )}
      </h1>

      {/* Sections List */}
      <div className="sections-list-container" style={{ display: "none" }}>
        <SliderComponent>
          {allSections.map((sectionItem, index) => (
            <SectionThumbnail
              key={index}
              section={sectionItem}
              index={index}
              isActive={sectionItem.id === section.id}
              onSectionClick={handleSectionClick}
              onTitleChange={handleSectionTitleChange}
              onRemove={handleRemoveSection}
              onViewDetails={handleSectionClick}
              onImageClick={handleImageClick}
            />
          ))}

        </SliderComponent>
        <div
          className="add-section-thumbnail"
          onClick={handleAddNewSection}
          style={{
            backgroundImage: "url(/assets/small_chair.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundBlendMode: "multiply",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="add-section-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 12V36M12 24H36"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="add-section-text">{t('sectionDetails.addNewSection')}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="section-details-main-content">
        {/* Left Panel - Products List */}
        <div className="products-panel">
          <div className="products-list">
            {products.map((product) => (
              <React.Fragment key={product.id}>
                <div className="sc-product-item">
                  <div className="sc-product-info">
                    <img
                      src={
                        (product.images && product.images.length > 1
                          ? product.images[1]
                          : "") ||
                        product.thumbnail ||
                        "/assets/logo_big.png"
                      }
                      alt={product.name}
                      className="sc-product-image"
                      onError={(e) => {
                        e.target.src = "/assets/logo_big.png";
                        console.log("Product image error:", e.target.src);
                      }}
                    />
                    <div className="product-details">
                      <h3 className="sc-product-name">{product.name}</h3>
                      {/*<p className="product-price">
                        ${product.price.toFixed(2)}
                      </p>
                      <div className="product-attributes">
                        <div
                          className="color-indicator"
                          style={{
                            backgroundColor: product.color.toLowerCase(),
                          }}
                        ></div>
                        <span className="product-color">{product.color}</span>
                        <div className="attribute-divider"></div>
                        <span className="product-size">
                          Size {product.size}
                        </span>
                      </div>*/}
                    </div>
                  </div>
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn decrease"
                      onClick={() =>
                        handleQuantityChange(product.productId, -1)
                      }
                      disabled={product.quantity === 0}
                    >
                      <svg
                        width="30"
                        height="30"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <circle
                          cx="10"
                          cy="10"
                          r="9"
                          stroke="black"
                          fill="black"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M6 10H14"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                    <span className="quantity-number">{product.quantity}</span>
                    <button
                      className="quantity-btn increase"
                      onClick={() => handleQuantityChange(product.productId, 1)}
                    >
                      <svg
                        width="30"
                        height="30"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <circle
                          cx="10"
                          cy="10"
                          r="9"
                          stroke="black"
                          fill="black"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M10 6V14M6 10H14"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="product-divider"></div>
              </React.Fragment>
            ))}
          </div>
          <button className="add-product-btn" onClick={handleAddNewProduct}>
            {t('sectionDetails.addNewProduct')}
          </button>
        </div>

        {/* Right Panel - Section Information */}
        <div className="info-panel">
          {/* Reference Image */}
          <div className="info-item">
            <img
              src={
                section.rootImageUrl ||
                section.thumbnailUrl ||
                latestDesign?.thumbnailUrl ||
                latestDesign?.resultImageUrl ||
                latestDesign?.imageUrl ||
                "/assets/logo_big.png"
              }
              alt="Reference"
              className="info-thumbnail"
              onError={(e) => {
                e.target.src = "/assets/logo_big.png";
                console.log("Reference image error:", e.target.src);
              }}
            />
            <div className="info-content" style={{height: "14vw"}}>
              <h3 className="sd-info-title">{t('sectionDetails.referenceImage')}</h3>
              <p className="sd-info-description">
                {t('sectionDetails.referenceImageDesc')}
              </p>
              <button
                className="change-btn"
                onClick={handleChangeReference}
                disabled={desabled}
              >
                {t('sectionDetails.change')}
              </button>
            </div>
          </div>
          <div className="info-divider"></div>

          {/* Room Type */}
          <div className="info-item">
            {/*<img
              src={roomType?.image || "/assets/logo_big.png"}
              alt={roomType?.name}
              className="info-thumbnail"
              onError={(e) => {
                e.target.src = "/assets/logo_big.png";
                console.log("Room type image error:", e.target.src);
              }}
            />
            */}
            <div className="info-content-roomtype">

              <p className="sd-info-description">
                {t('sectionDetails.roomTypeDesc')}
              </p>
              <h3 className="sd-info-title">{roomType?.name}</h3>
              <button
                className="change-btn-roomtype"
                onClick={handleChangeRoomType}
                disabled={desabled}
              >
                {t('sectionDetails.change')}
              </button>
            </div>
          </div>
          <div className="info-divider"></div>

          {/* Project Details 
          <div className="project-details-box">
            <textarea
              className="project-details-textarea"
              value={projectDetails}
              onChange={(e) => setProjectDetails(e.target.value)}
              placeholder="Enter project details..."
            />
          </div>
          <div className="info-divider"></div>*/}


          {/* Promt Input */}
          <div className="info-item">
            <textarea
              className="promt-textarea"
              value={projectDetails}
              onChange={(e) => setProjectDetails(e.target.value)}
              placeholder={t('sectionDetails.promptPlaceholder')}
            />


          </div>

          <div className="info-divider"></div>

          {/* Last Generated */}
          <div className="info-item">
            <img
              src={getResultImageUrl(section) || "/assets/logo_big.png"}
              alt="Last Generated"
              className="info-thumbnail clickable-image"
              onClick={handleImageClick}
              onError={(e) => {
                console.log("Last generated image error:", e.target.src);
                e.target.src = "/assets/logo_big.png";
              }}
              style={{
                height: "21vw",
                width: "21vw",
              }}
            />
            <div className="info-content" style={{height: "21vw"}}>
              <h3 className="sd-info-title">{t('sectionDetails.lastGenerated')}</h3>
              <p className="sd-info-description">
                {t('sectionDetails.lastGeneratedDesc')}
              </p>
              <button
                className="change-btn"
                onClick={handleRegenerate}
                disabled={desabled}
              >
                {(latestDesign?.resultImageUrl || latestDesign?.imageUrl)
                  ? t('sectionDetails.regenerate')
                  : t('sectionDetails.generate')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Popup */}
      <FullscreenImagePopup
        images={[
          section.resultImageUrl ||
            latestDesign?.resultImageUrl ||
            latestDesign?.imageUrl,
          ...(section.designs
            ?.filter((d) => d.id !== latestDesign?.id && (d.resultImageUrl || d.imageUrl))
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .map((d) => d.resultImageUrl || d.imageUrl) || []),
        ].filter(Boolean)}
        initialIndex={0} // Start with first image (index 0)
        isVisible={isFullscreenPopupVisible}
        onClose={() => setIsFullscreenPopupVisible(false)}
      />
      <FullscreenLoadingSpinner isVisible={isFullscreenLoadingSpinnerVisible} />
    </div>
  );
};

export default SectionDetails;
