import {
  startNewSectionFlow,
  startExistingSectionFlow,
} from "./NavigationState";

// Yeni section oluşturma akışını başlat
export const startNewSection = (projectId, navigate) => {
  startNewSectionFlow(projectId);
  navigate("/camera", {
    state: {
      projectId: projectId,
      isCreatingNewSection: true,
    },
  });
};

// Mevcut section düzenleme akışını başlat
export const startEditSection = (sectionId, navigate) => {
  startExistingSectionFlow(sectionId);
  navigate("/section-details", {
    state: {
      sectionId: sectionId,
      isEditingSection: true,
    },
  });
};

// Section akışını başlat (otomatik tespit)
export const startSectionFlow = (projectId, sectionId, navigate) => {
  if (sectionId) {
    // Mevcut section düzenle
    startEditSection(sectionId, navigate);
  } else {
    // Yeni section oluştur
    startNewSection(projectId, navigate);
  }
};
