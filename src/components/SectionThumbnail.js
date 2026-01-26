import React from "react";
import HoverThumbnailButton from "./HoverThumbnailButton";
import "./SectionThumbnail.css";

const SectionThumbnail = ({
  key,
  section,
  index,
  isActive,
  onSectionClick,
  onTitleChange,
  onRemove,
  onViewDetails,
  onImageClick,
  duration = 500,
}) => {
  // Action'ları tanımla
  const actions = [
    {
      label: "Remove",
      action: () => onRemove(section),
      icon: "🗑️",
      requireConfirmation: true, // Emin misiniz sorusu sor
      confirmationMessage: "Are you sure you want to remove?",
    },
  ];

  // Image URL'i belirle
  const imageUrl =
    (section.design && section.design.thumbnailUrl) ||
    (section.design && section.design.resultImageUrl) ||
    section.thumbnailUrl ||
    section.resultImageUrl ||
    section.rootImageUrl ||
    "/assets/logo_big.png";

  // Click handler
  const handleClick = () => {
    if (!isActive && onSectionClick) {
      onSectionClick(section);
    }
  };

  return (
    <HoverThumbnailButton
      id={key}
      imageUrl={imageUrl}
      title={section.title}
      isActive={isActive}
      isLoading={section.design && section.design.status === "PROCESSING"}
      onClick={handleClick}
      onImageClick={onImageClick}
      duration={duration}
      actions={actions}
      className="section-thumbnail"
      editable={isActive}
      onTitleChange={onTitleChange}
      titlePlaceholder="Click to edit"
      titleClassName="section-thumbnail-name"
    />
  );
};

export default SectionThumbnail;
