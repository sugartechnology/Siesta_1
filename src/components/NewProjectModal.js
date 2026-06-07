import React, { useEffect, useState } from "react";
import { IMaskInput } from "react-imask";
import LocationMapModal from "./LocationMapModal";
import { createProject } from "../api/Api";
import { generateSectionName } from "../utils/projectNaming";
import "./NewProjectModal.css";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/useAuth";

export default function NewProjectModal({
  isOpen,
  onClose,
  onSubmit,
  suggestedProjectName = "",
  suggestedSectionName = "",
}) {
  const { t } = useTranslation();
  const { requireAuth } = useAuth();
  const [formData, setFormData] = useState({
    projectName: "",
    sectionName: "",
    countryCode: "+1",
    phoneNumber: "",
    location: "",
    locationCoords: null,
    additionalInfo: "",
  });

  const [showMapModal, setShowMapModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    setFormData((prev) => ({
      ...prev,
      projectName: suggestedProjectName || prev.projectName,
      sectionName: suggestedSectionName || prev.sectionName,
    }));
  }, [isOpen, suggestedProjectName, suggestedSectionName]);

  const countryCodes = [
    { code: "+1", country: "USA/Canada", flag: "🇺🇸" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
    { code: "+90", country: "Turkey", flag: "🇹🇷" },
    { code: "+49", country: "Germany", flag: "🇩🇪" },
    { code: "+33", country: "France", flag: "🇫🇷" },
    { code: "+39", country: "Italy", flag: "🇮🇹" },
    { code: "+34", country: "Spain", flag: "🇪🇸" },
    { code: "+81", country: "Japan", flag: "🇯🇵" },
    { code: "+86", country: "China", flag: "🇨🇳" },
    { code: "+91", country: "India", flag: "🇮🇳" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationClick = () => {
    setShowMapModal(true);
  };

  const handleLocationSelect = (location, coords) => {
    setFormData((prev) => ({
      ...prev,
      location: location,
      locationCoords: coords,
    }));
    setShowMapModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const isAuthenticated = await requireAuth();
      if (!isAuthenticated) {
        setSubmitError("Please sign in to create a project.");
        return;
      }

      const projectName = formData.projectName.trim() || suggestedProjectName;
      const sectionName =
        formData.sectionName.trim() || suggestedSectionName || generateSectionName(1);

      // Prepare project data for API (ProjectDTO format)
      const projectData = {
        name: projectName,
        details: formData.additionalInfo,
        mobilePhone: `${formData.countryCode}${formData.phoneNumber}`,
        address: {
          line1: formData.location,
          line2: "",
          district: "",
          city: "",
          state: "",
          postalCode: "",
          countryCode: "",
          lat: formData.locationCoords?.lat || null,
          lon: formData.locationCoords?.lng || null,
          placeId: "",
          timeZone: "",
          formatted: formData.location,
        },
        // Create initial section with sectionName
        sections: [
          {
            title: sectionName,
            content: "",
            type: null,
            style: null,
            rootImageUrl: null,
            resultImageUrl: null,
            thumbnailUrl: null,
            designs: [],
            productIds: [],
            status: null,
          },
        ],
        // Optional fields that can be set later
        rootImageUrl: null,
        resultImageUrl: null,
        thumbnailUrl: null,
        type: null,
        style: null,
      };

      // Create project via API
      const createdProject = await createProject(projectData);
      console.log("Project created successfully:", createdProject);

      // Call parent onSubmit with the created project data
      if (typeof onSubmit === "function") {
        onSubmit(createdProject);
      }

      // Reset form and close modal
      setFormData({
        projectName: "",
        sectionName: "",
        countryCode: "+1",
        phoneNumber: "",
        location: "",
        locationCoords: null,
        additionalInfo: "",
      });
      onClose();
    } catch (error) {
      console.error("Error creating project:", error);
      setSubmitError(
        error?.message || "Failed to create project. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      projectName: "",
      sectionName: "",
      countryCode: "+1",
      phoneNumber: "",
      location: "",
      locationCoords: null,
      additionalInfo: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={handleCancel} />
      <div className="new-project-modal">
        <div className="new-modal-header">
          <h2>{t('newProjectModal.title')}</h2>
          <button className="close-btn" onClick={handleCancel}>
            <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
              <path
                d="M16 5L5 16M5 5L16 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="auto-name-preview">
            <span className="input-label">{t("newProjectModal.autoNameLabel")}</span>
            <p className="auto-name-value">{formData.projectName}</p>
          </div>

          <div className="form-row">
            <div className="form-group phone-group">
              <label htmlFor="phoneNumber" className="input-label">{t('newProjectModal.phoneNumber')}</label>
              <div className="phone-input-container">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleInputChange}
                  className="country-code-select"
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <IMaskInput
                  mask="(000) 000-0000"
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onAccept={(value, mask) => {
                    setFormData({ ...formData, phoneNumber: value });
                  }}
                  placeholder="(555) 123-4567"
                  className="phone-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="additionalInfo" className="input-label">{t('newProjectModal.additionalInfo')}</label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                className="input-field"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                placeholder={t('newProjectModal.additionalInfoPlaceholder')}
                rows="4"
              />
            </div>
          </div>

          {submitError && <div className="error-message">{submitError}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {t('newProjectModal.cancel')}
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('newProjectModal.creating') : t('newProjectModal.create')}
            </button>
          </div>
        </form>
      </div>

      {showMapModal && (
        <LocationMapModal
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
          onSelectLocation={handleLocationSelect}
          currentLocation={formData.locationCoords}
        />
      )}
    </>
  );
}
