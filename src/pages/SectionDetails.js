import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  addProductToSection,
  addSectionToProject,
  deleteSection,
  getProductsByIds,
  createProject,
  updateSectionName,
  updateSectionJson,
  updateSectionWithImage,
  removeProductFromSection,
} from "../api/Api";
import { useSectionDesign } from "../contexts/SectionDesignContext";
import FullscreenImagePopup from "../components/FullscreenImagePopup";
import {
  isValidBase64Image,
  resolveSectionImageFile,
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
import DesignFlowNav from "../components/DesignFlowNav";
import SectionSwitcher from "../components/SectionSwitcher";
import SidebarScrollHint from "../components/SidebarScrollHint";
import "./SectionDetails.css";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/useAuth";

const isSectionProcessing = (section) =>
  section.designs?.[0]?.status === "PROCESSING";

const getProductThumb = (product) =>
  product?.images?.[1] ||
  product?.images?.[0] ||
  product?.thumbnailUrl ||
  product?.thumbnail ||
  "/assets/logo_big.png";

const sanitizeCustomizationPrompt = (value) => {
  if (value == null || value === "undefined" || value === "null") {
    return "";
  }
  return String(value);
};

const getSectionCustomizationPrompt = (sectionData) =>
  sanitizeCustomizationPrompt(sectionData?.prompt ?? sectionData?.content ?? "");

const sectionHasReferenceImage = (sectionData) =>
  Boolean(
    sectionData?.rootImageUrl ||
      sectionData?.thumbnailUrl ||
      sectionData?.designs?.[0]?.thumbnailUrl
  );

const hasPersistedServerImage = (sectionData) => {
  const thumbnail = sectionData?.thumbnailUrl;
  return Boolean(
    thumbnail &&
      (thumbnail.startsWith("http://") || thumbnail.startsWith("https://"))
  );
};

const sectionNeedsImageUpload = (sectionData) => {
  if (hasPersistedServerImage(sectionData)) {
    return false;
  }

  const image = sectionData?.rootImageUrl;
  if (!image || typeof image !== "string") {
    return false;
  }
  if (isValidBase64Image(image)) {
    return true;
  }
  return (
    image.startsWith("/") ||
    image.startsWith("http://") ||
    image.startsWith("https://")
  );
};

const SectionDetails = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { requireAuth } = useAuth();
  const {
    startGeneration,
    registerSection,
    unregisterSection,
    subscribeSectionUpdates,
  } = useSectionDesign();
  const sectionIdRef = useRef(null);
  const sidebarRef = useRef(null);
  const waitingForGenerationResultRef = useRef(false);
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);
  const [designGenerationError, setDesignGenerationError] = useState(null);
  const [projectCreateError, setProjectCreateError] = useState(null);
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
  const [customizationPrompt, setCustomizationPrompt] = useState(
    getSectionCustomizationPrompt(initialSection)
  );
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
  const [isFullscreenPopupVisible, setIsFullscreenPopupVisible] =
    useState(false);

  // useCallback to ensure handler is stable
  const handleImageClick = useCallback(() => {
    setIsFullscreenPopupVisible(prevState => {
      return true;
    });
  }, []);

  sectionIdRef.current = section?.id;

  useEffect(() => {
    setCustomizationPrompt(getSectionCustomizationPrompt(section));
  }, [section?.id]);

  useEffect(() => {
    const sectionId = section?.id;
    if (sectionId) registerSection(sectionId);
    return () => unregisterSection(sectionId);
  }, [section?.id, registerSection, unregisterSection]);

  useEffect(() => {
    setIsGeneratingDesign(section?.designs?.[0]?.status === "PROCESSING");
  }, [section?.id]);

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
          setIsGeneratingDesign(false);
          if (waitingForGenerationResultRef.current) {
            waitingForGenerationResultRef.current = false;
            if (status === "FAILED" || status === "ERROR") {
              setDesignGenerationError(t("sectionDetails.designGenerationError"));
            }
          }
        } else if (status === "PROCESSING") {
          setIsGeneratingDesign(true);
        }
      }
    });
    return unsubscribe;
  }, [subscribeSectionUpdates, t]);

  useEffect(() => {
    let isMounted = true;

    const initializeSection = async () => {
      if (NavigationState.sectionMode === "update-section") {
        if (!NavigationState.project || !NavigationState.project.id) {
          const isAuthenticated = await requireAuth();
          if (!isAuthenticated) {
            if (isMounted) {
              setProjectCreateError("Please sign in to create a project.");
            }
            return;
          }

          try {
            const project = await createProject({
              ...DefaultNavigationState.project,
            });

            if (!isMounted) {
              return;
            }

            setProjectCreateError(null);
            section.projectId = project.id;
            project.sections = [section];
            NavigationState.project = project;
            NavigationState.section = section;
            setContextSection(section);
            setProject(project);
            updateSection(section, project.id);
          } catch (error) {
            console.error("Error creating project:", error);
            if (isMounted) {
              setProjectCreateError(
                error?.message || "Failed to create project. Please try again."
              );
            }
          }
        } else {
          setContextSection(section);
          updateSection(section);
        }

        NavigationState.sectionMode = undefined;
      }

      if (section.productIds && section.productIds.length > 0) {
        updateProducts(section);
      }
    };

    initializeSection();

    return () => {
      isMounted = false;
    };
  }, [requireAuth]);

  const applySavedSection = (response, replaceSection) => {
    const preservedImage = isValidBase64Image(replaceSection?.rootImageUrl)
      ? replaceSection.rootImageUrl
      : undefined;
    const mergedSection = preservedImage
      ? { ...response, rootImageUrl: preservedImage }
      : response;

    setContextSection(mergedSection, replaceSection);
    setSection(mergedSection);
    setProject((prev) => {
      if (!prev?.id) return prev;
      const sections = [...(prev.sections || [])];
      const index = sections.findIndex((s) => s.id === mergedSection.id);
      if (index >= 0) {
        sections[index] = mergedSection;
      } else {
        sections.push(mergedSection);
      }
      return { ...prev, sections };
    });
    return mergedSection;
  };

  const updateSection = async (sectionToSave, projectId = undefined) => {
    setIsSavingSection(true);

    try {
      const image = sectionToSave.rootImageUrl;

      const updateSectionData = {
        ...sectionToSave,
        productIds: products.map((product) => ({
          productId: product.productId,
          quantity: product.quantity,
        })),
        rootImageUrl: undefined,
        thumbnailUrl: undefined,
      };

      let imageFile = null;
      try {
        imageFile = await resolveSectionImageFile(image);
      } catch (error) {
        console.error("Error preparing section image:", error);
      }

      const replaceSection = sectionToSave;
      const targetProjectId = projectId || project.id;
      const existingSectionId = sectionToSave?.id || null;

      const response = existingSectionId
        ? imageFile
          ? await updateSectionWithImage(
              existingSectionId,
              updateSectionData,
              imageFile
            )
          : await updateSectionJson(existingSectionId, updateSectionData)
        : await addSectionToProject(
            targetProjectId,
            updateSectionData,
            imageFile
          );

      return applySavedSection(response, replaceSection);
    } catch (error) {
      console.error("Error saving section:", error);
      throw error;
    } finally {
      setIsSavingSection(false);
    }
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
    NavigationState.productsEntry = "design";
    NavigationState.selectedProducts = section.productIds;
    navigate("/products");
  };

  const handleChangeReference = () => {
    startExistingSectionFlow(project, section);
    NavigationState.sectionMode = "update-section";
    navigate("/camera");
  };

  const buildSectionPayload = (
    sectionData,
    promptValue = customizationPrompt
  ) => {
    const sanitizedPrompt = sanitizeCustomizationPrompt(promptValue);
    return {
      ...sectionData,
      content: sanitizedPrompt,
      prompt: sanitizedPrompt,
      productIds: products.map((product) => ({
        productId: product.productId,
        quantity: product.quantity,
      })),
    };
  };

  const handleCustomizationPromptChange = (event) => {
    const value = event.target.value;
    setCustomizationPrompt(value);

    const updatedSection = {
      ...section,
      content: value,
      prompt: value,
    };
    setSection(updatedSection);
    setContextSection(updatedSection);
  };

  const handleCustomizationPromptBlur = async (value = customizationPrompt) => {
    if (!section?.id || isSavingSection) return;

    try {
      const saved = await updateSectionJson(
        section.id,
        buildSectionPayload(section, value)
      );
      applySavedSection(saved, section);
    } catch (error) {
      console.error("Error saving customization prompt:", error);
    }
  };

  const handleRoomTypeSelect = async (roomType) => {
    if (isSavingSection) return;

    const updatedSection = { ...section, type: roomType.name };
    setSection(updatedSection);
    setContextSection(updatedSection);

    if (!section.id) return;

    try {
      const saved = await updateSectionJson(
        section.id,
        buildSectionPayload(updatedSection)
      );
      setSection(saved);
      setContextSection(saved);
    } catch (error) {
      console.error("Error updating room type:", error);
    }
  };

  const handleRegenerate = async () => {
    if (!project?.id || !section?.id || isGenerating) return;

    const hasSpaceType = Boolean(section?.type?.trim());
    const hasProducts = products.some((product) => (product.quantity ?? 1) > 0);

    if (!hasSpaceType && !hasProducts) {
      setDesignGenerationError(t("sectionDetails.generateDesignMissingBoth"));
      return;
    }
    if (!hasSpaceType) {
      setDesignGenerationError(t("sectionDetails.generateDesignMissingSpaceType"));
      return;
    }
    if (!hasProducts) {
      setDesignGenerationError(t("sectionDetails.generateDesignMissingProducts"));
      return;
    }
    if (!sectionHasReferenceImage(section)) {
      setDesignGenerationError(
        t("sectionDetails.generateDesignMissingReferenceImage")
      );
      return;
    }

    setDesignGenerationError(null);

    try {
      let sectionForGeneration = section;

      if (sectionNeedsImageUpload(section) || isSavingSection) {
        sectionForGeneration = await updateSection(
          buildSectionPayload(section),
          project.id
        );
      } else {
        const saved = await updateSectionJson(
          section.id,
          buildSectionPayload(section)
        );
        sectionForGeneration = applySavedSection(saved, section);
      }

      if (
        sectionNeedsImageUpload(sectionForGeneration) &&
        !hasPersistedServerImage(sectionForGeneration)
      ) {
        setDesignGenerationError(t("sectionDetails.sectionSaveError"));
        return;
      }

      waitingForGenerationResultRef.current = true;
      setIsGeneratingDesign(true);
      await startGeneration(
        project.id,
        sectionForGeneration.id,
        customizationPrompt.trim(),
        { project, section: sectionForGeneration }
      );
    } catch (error) {
      waitingForGenerationResultRef.current = false;
      setIsGeneratingDesign(false);
      setDesignGenerationError(
        error?.message || t("sectionDetails.designGenerationError")
      );
    }
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

  const handleSectionRename = async (sectionItem, newTitle) => {
    const trimmedTitle = newTitle?.trim();
    if (!sectionItem?.id || !trimmedTitle) {
      return;
    }

    const previousProject = project;
    setProject((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((s) =>
        s.id === sectionItem.id ? { ...s, title: trimmedTitle } : s
      ),
    }));

    if (section.id === sectionItem.id) {
      const nextSection = { ...section, title: trimmedTitle };
      setSection(nextSection);
      setContextSection(nextSection);
    }

    try {
      const updatedSection = await updateSectionName(sectionItem.id, trimmedTitle);
      setProject((prev) => ({
        ...prev,
        sections: (prev.sections || []).map((s) =>
          s.id === sectionItem.id
            ? { ...s, ...updatedSection, title: trimmedTitle }
            : s
        ),
      }));
      NavigationState.project = {
        ...NavigationState.project,
        sections: (NavigationState.project?.sections || []).map((s) =>
          s.id === sectionItem.id
            ? { ...s, ...updatedSection, title: trimmedTitle }
            : s
        ),
      };
      if (section.id === sectionItem.id) {
        setSection((prev) => ({ ...prev, ...updatedSection, title: trimmedTitle }));
        setContextSection({ ...section, ...updatedSection, title: trimmedTitle });
      }
    } catch (error) {
      console.error("Error updating section name:", error);
      setProject(previousProject);
      throw error;
    }
  };

  const handleGoToProject = () => {
    if (!project?.id) return;
    navigate(`/projects-details/${project.id}`, { state: { project } });
  };

  const handleAddNewSection = () => {
    startNewSectionFlow(project);
    navigate(getNextPage("*", { sectionMode: "update-section" }));
  };

  const handleRemoveSection = async (sectionToRemove) => {
    if (!sectionToRemove?.id) {
      return;
    }

    const previousProject = project;
    const previousSection = section;
    const updatedSections = (project.sections || []).filter(
      (s) => s.id !== sectionToRemove.id
    );

    setProject((prev) => ({ ...prev, sections: updatedSections }));
    NavigationState.project = { ...NavigationState.project, sections: updatedSections };

    if (sectionToRemove.id === section.id) {
      if (updatedSections.length > 0) {
        const firstSection = updatedSections[0];
        setSection(firstSection);
        NavigationState.section = firstSection;
        setContextSection(firstSection);
        updateProducts(firstSection);
      }
    }

    try {
      await deleteSection(sectionToRemove.id);

      if (updatedSections.length === 0 && project?.id) {
        navigate(`/projects-details/${project.id}`);
      }
    } catch (error) {
      console.error("Error removing section:", error);
      setProject(previousProject);
      NavigationState.project = previousProject;
      if (sectionToRemove.id === section.id) {
        setSection(previousSection);
        NavigationState.section = previousSection;
        setContextSection(previousSection);
      }
      setDesignGenerationError(
        error?.message || t("projectDetails.removeSectionError")
      );
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

  const latestDesign = section.designs?.[0];
  const resultImageUrl = getResultImageUrl(section);
  const hasGeneratedImage = Boolean(resultImageUrl);
  const referenceImageUrl =
    section.rootImageUrl ||
    section.thumbnailUrl ||
    latestDesign?.thumbnailUrl ||
    null;
  const isGenerating =
    isGeneratingDesign || latestDesign?.status === "PROCESSING";
  const showResultStage =
    isSavingSection || hasGeneratedImage || (isGenerating && hasGeneratedImage);

  const renderGenerateButton = (extraClassName = "") => (
    <button
      type="button"
      className={`sd-generate-btn ${extraClassName}`.trim()}
      onClick={handleRegenerate}
      disabled={isSavingSection || isGenerating || !section?.id || !project?.id}
    >
      <span>
        {isGenerating
          ? t("sectionDetails.processing")
          : hasGeneratedImage
            ? t("sectionDetails.regenerate")
            : t("sectionDetails.generateDesign")}
      </span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3v3m0 12v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M3 12h3m12 0h3M4.22 19.78l2.12-2.12m11.32-11.32l2.12-2.12"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );

  const handleDownloadDesign = async () => {
    if (!resultImageUrl) return;

    const fileName = `${(project?.name || section?.title || "siesta-design")
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 40) || "siesta-design"}-${Date.now()}.jpg`;

    try {
      const response = await fetch(resultImageUrl, { credentials: "include" });
      if (response.ok) {
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(objectUrl);
        return;
      }
    } catch (error) {
      console.warn("Design download via fetch failed:", error);
    }

    const link = document.createElement("a");
    link.href = resultImageUrl;
    link.download = fileName;
    link.rel = "noopener";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareDesign = async () => {
    if (!resultImageUrl) return;

    const shareTitle = project?.name || section?.title || t("sectionDetails.designResult");

    try {
      let shareFile = null;
      try {
        const response = await fetch(resultImageUrl, { credentials: "include" });
        if (response.ok) {
          const blob = await response.blob();
          shareFile = new File(
            [blob],
            `${(shareTitle || "siesta-design").replace(/\s+/g, "-").slice(0, 40)}.jpg`,
            { type: blob.type || "image/jpeg" }
          );
        }
      } catch (error) {
        console.warn("Could not prepare design file for sharing:", error);
      }

      if (shareFile && navigator.canShare?.({ files: [shareFile] })) {
        await navigator.share({
          title: shareTitle,
          files: [shareFile],
        });
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          url: resultImageUrl,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(resultImageUrl);
        window.alert(t("sectionDetails.shareCopied"));
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Design share failed:", error);
      }
    }
  };

  return (
    <div className="section-details-container">
      <div className="sd-page-top">
        <div className="sd-page-header">
          <DesignFlowNav currentStepId="section-details" forceVisible />
          <h1 className="sd-page-title">
            {project ? (
              <button
                type="button"
                className="sd-page-title-link"
                onClick={handleGoToProject}
                disabled={!project?.id}
                title={t("sectionDetails.goToProject")}
              >
                {project.name}
              </button>
            ) : (
              t("sectionDetails.loading")
            )}
          </h1>
        </div>
        <SectionSwitcher
          sections={allSections}
          activeSection={section}
          onSelect={handleSectionClick}
          onRename={handleSectionRename}
          onDelete={handleRemoveSection}
          isProcessing={isSectionProcessing}
          disabled={isSavingSection}
        />
      </div>

      {projectCreateError && (
        <div className="section-details-error-banner" role="alert">
          {projectCreateError}
        </div>
      )}
      {designGenerationError && (
        <div className="section-details-error-banner" role="alert">
          {designGenerationError}
        </div>
      )}
      {isGenerating && !isSavingSection && (
        <div className="sd-generating-banner" role="status" aria-live="polite">
          <span className="sd-generating-banner__spinner" aria-hidden="true" />
          <span>{t("sectionDetails.generatingInBackground")}</span>
        </div>
      )}

      <div className="sd-layout">
        <aside className="sd-sidebar-wrap">
          <div ref={sidebarRef} className="sd-sidebar">
          <section className="sd-card">
            <div className="sd-card__header">
              <h2 className="sd-card__title">{t("sectionDetails.referenceImage")}</h2>
              <button
                type="button"
                className="sd-text-btn"
                onClick={handleChangeReference}
                disabled={isSavingSection}
              >
                {t("sectionDetails.changePhoto")}
              </button>
            </div>
            <div className="sd-reference-wrap">
              {referenceImageUrl ? (
                <img
                  src={referenceImageUrl}
                  alt={t("sectionDetails.referenceImage")}
                  className="sd-reference-image"
                  onError={(e) => {
                    e.target.src = "/assets/logo_big.png";
                  }}
                />
              ) : (
                <div className="sd-reference-placeholder">
                  <div className="sd-reference-placeholder__icon" aria-hidden="true">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 7a2 2 0 0 1 2-2h3l1.5-2h3L15 5h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <circle cx="9" cy="10" r="1.5" fill="currentColor" />
                      <path
                        d="M4 16l4.5-4 3 2.5L16 11l4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="sd-reference-placeholder__title">
                    {t("sectionDetails.noReferenceImage")}
                  </p>
                  <p className="sd-reference-placeholder__hint">
                    {t("sectionDetails.uploadPhotoHint")}
                  </p>
                  <button
                    type="button"
                    className="sd-reference-placeholder__cta"
                    onClick={handleChangeReference}
                    disabled={isSavingSection}
                  >
                    {t("sectionDetails.uploadPhotoCta")}
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="sd-card">
            <h2 className="sd-card__title">{t("sectionDetails.spaceType")}</h2>
            <p className="sd-card__hint">{t("sectionDetails.spaceTypeHint")}</p>
            <div className="sd-room-scroll" role="list">
              {roomTypes.map((roomType) => {
                const isSelected = section.type === roomType.name;
                return (
                  <button
                    type="button"
                    key={roomType.id}
                    role="listitem"
                    className={`sd-room-chip${isSelected ? " sd-room-chip--selected" : ""}`}
                    onClick={() => handleRoomTypeSelect(roomType)}
                    disabled={isSavingSection}
                  >
                    <img
                      src={roomType.image}
                      alt={t(`roomTypes.${roomType.id}`)}
                      className="sd-room-chip__image"
                    />
                    <span className="sd-room-chip__label">
                      {t(`roomTypes.${roomType.id}`)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="sd-card">
            <h2 className="sd-card__title">
              {t("sectionDetails.customizationPrompt")}
            </h2>
            <p className="sd-card__hint">
              {t("sectionDetails.customizationPromptHint")}
            </p>
            <textarea
              className="sd-prompt-textarea"
              value={customizationPrompt}
              onChange={handleCustomizationPromptChange}
              onBlur={(event) => handleCustomizationPromptBlur(event.target.value)}
              placeholder={t("sectionDetails.customizationPromptPlaceholder")}
              disabled={isSavingSection}
              rows={4}
            />
          </section>

          <section className="sd-card sd-card--products">
            <div className="sd-card__header">
              <h2 className="sd-card__title">{t("sectionDetails.selectedProducts")}</h2>
              {products.length > 0 && (
                <button
                  type="button"
                  className="sd-add-product-header-btn"
                  onClick={handleAddNewProduct}
                  disabled={isSavingSection}
                >
                  <span>{t("sectionDetails.addNewProduct")}</span>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                      d="M10 5V15M5 10H15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>

            {products.length === 0 ? (
              <div className="sd-products-empty">
                <p className="sd-empty">{t("sectionDetails.noProducts")}</p>
                <button
                  type="button"
                  className="sd-add-product-btn"
                  onClick={handleAddNewProduct}
                  disabled={isSavingSection}
                >
                  <span>{t("sectionDetails.addNewProduct")}</span>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                      d="M10 5V15M5 10H15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <ul className="sd-product-list">
                {products.map((product) => (
                  <li key={product.productId || product.id} className="sd-product-row">
                    <img
                      src={getProductThumb(product)}
                      alt={product.name}
                      className="sd-product-row__thumb"
                      onError={(e) => {
                        e.target.src = "/assets/logo_big.png";
                      }}
                    />
                    <div className="sd-product-row__body">
                      <span className="sd-product-row__name">{product.name}</span>
                      {product.code && (
                        <span className="sd-product-row__code">{product.code}</span>
                      )}
                    </div>
                    <div className="sd-product-row__qty">
                      <button
                        type="button"
                        className="sd-qty-btn"
                        onClick={() => handleQuantityChange(product.productId, -1)}
                        disabled={product.quantity === 0 || isSavingSection}
                        aria-label="-"
                      >
                        −
                      </button>
                      <span>{product.quantity}</span>
                      <button
                        type="button"
                        className="sd-qty-btn"
                        onClick={() => handleQuantityChange(product.productId, 1)}
                        disabled={isSavingSection}
                        aria-label="+"
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
          </div>
          <SidebarScrollHint scrollContainerRef={sidebarRef} />
        </aside>

        <main className="sd-result-panel">
          <section
            className={`sd-card sd-card--result${
              showResultStage ? "" : " sd-card--result-empty"
            }`}
          >
            <div className="sd-card__header">
              <h2 className="sd-card__title">{t("sectionDetails.designResult")}</h2>
              {hasGeneratedImage && !isSavingSection && !isGenerating && (
                <div className="sd-result-actions">
                  <button
                    type="button"
                    className="sd-result-action-btn"
                    onClick={handleDownloadDesign}
                    aria-label={t("sectionDetails.downloadDesign")}
                    title={t("sectionDetails.downloadDesign")}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M12 3v12m0 0l4-4m-4 4l-4-4M4 19h16"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="sd-result-action-btn"
                    onClick={handleShareDesign}
                    aria-label={t("sectionDetails.shareDesign")}
                    title={t("sectionDetails.shareDesign")}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M12 10.6667C11.2649 10.6667 10.5899 10.9871 10.1333 11.5133L6.08 9.18667C6.13822 8.95889 6.16889 8.72333 6.16889 8.48667C6.16889 8.25 6.13822 8.01444 6.08 7.78667L10.1067 5.48C10.5689 5.99111 11.26 6.32 12.0267 6.32C13.3067 6.32 14.3467 5.28 14.3467 4C14.3467 2.72 13.3067 1.68 12.0267 1.68C10.7467 1.68 9.70667 2.72 9.70667 4C9.70667 4.23778 9.73733 4.47333 9.79556 4.70111L5.76889 7.00778C5.30667 6.49667 4.61556 6.16778 3.84889 6.16778C2.56889 6.16778 1.52889 7.20778 1.52889 8.48778C1.52889 9.76778 2.56889 10.8078 3.84889 10.8078C4.61556 10.8078 5.30667 10.4789 5.76889 9.96778L9.82222 12.2944C9.764 12.5222 9.73333 12.7578 9.73333 12.9944C9.73333 14.2744 10.7733 15.3144 12.0533 15.3144C13.3333 15.3144 14.3733 14.2744 14.3733 12.9944C14.3733 11.7144 13.3333 10.6744 12.0533 10.6744L12 10.6667Z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {showResultStage && (
              <div className="sd-result-stage">
                {isSavingSection && (
                  <div className="sd-processing">
                    <span className="sd-processing__spinner" aria-hidden="true" />
                    <p>{t("sectionDetails.savingSection")}</p>
                  </div>
                )}

                {!isSavingSection && isGenerating && (
                  <div className="sd-processing">
                    <span className="sd-processing__spinner" aria-hidden="true" />
                    <p>{t("sectionDetails.processing")}</p>
                  </div>
                )}

                {!isSavingSection && !isGenerating && hasGeneratedImage && (
                  <button
                    type="button"
                    className="sd-result-image-btn"
                    onClick={handleImageClick}
                  >
                    <img
                      src={resultImageUrl}
                      alt={t("sectionDetails.designResult")}
                      className="sd-result-image"
                      onError={(e) => {
                        e.target.src = "/assets/logo_big.png";
                      }}
                    />
                  </button>
                )}
              </div>
            )}

            {renderGenerateButton("sd-generate-btn--in-card")}
          </section>
        </main>
      </div>

      {!isGenerating && renderGenerateButton("sd-generate-mobile-bar")}

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
        initialIndex={0}
        isVisible={isFullscreenPopupVisible}
        onClose={() => setIsFullscreenPopupVisible(false)}
      />
    </div>
  );
};

export default SectionDetails;
