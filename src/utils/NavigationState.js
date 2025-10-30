// Navigation ve Section işlemleri için state management
export const DefaultNavigationState = {
  // Mevcut section ID (varsa)
  section: {
    title: "New Section",
    content: "",
    type: "",
    style: "",
    rootImageUrl: "",
    resultImageUrl: "",
    thumbnailUrl: "",
    designs: [],
    productIds: [],
  },

  // Yeni section oluşturuluyor mu?
  isCreatingNewSection: false,

  // Project ID (yeni section için gerekli)
  project: {
    name: "New Project",
    details: "",
    mobilePhone: "",
    address: {
      line1: "",
      line2: "",
    },
    rootImageUrl: "",
    resultImageUrl: "",
    thumbnailUrl: "",
    type: "",
    style: "",
    sections: [],
  },

  // İşlem akışı: 'existing' | 'new'
  flowType: "existing", // 'existing' veya 'new'

  // Geçici veriler
  image: "",
  roomType: undefined,
  selectedProducts: [],
  originalImage: "",
};

// Navigation flow maps
const flowMap = {
  existing: {
    "*": "/section-details",
    camera: "/photograph",
    photograph: "/section-details",
    products: "/section-details",
    "room-type": "/section-details",
  },
  new: {
    "*": "/camera",
    camera: "/photograph",
    photograph: "/room-type",
    "room-type": "/products",
    products: "/section-details",
  },
};

const backMap = {
  existing: {
    photograph: "/section-details",
    products: "/section-details",
    "room-type": "/section-details",
  },
  new: {
    photograph: "/camera",
    "room-type": "/photograph",
    products: "/room-type",
    "section-details": "/products",
  },
};

export const NavigationState = { ...DefaultNavigationState };

// State'i güncelle
export const updateNavigationState = (updates) => {
  // Native JavaScript ile deep merge
  const deepMerge = (target, source) => {
    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        if (!target[key]) target[key] = {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  };

  deepMerge(NavigationState, updates);
};

// State'i temizle
export const clearNavigationState = () => {
  Object.assign(NavigationState, DefaultNavigationState);
};

export const setContextSection = (section, replaceSection = undefined) => {
  NavigationState.section = section;
  if (replaceSection) {
    NavigationState.project.sections = NavigationState.project.sections.filter(
      (s) => s != replaceSection
    );
  }
  NavigationState.project.sections = NavigationState.project.sections.filter(
    (s) => s.id !== section.id
  );
  NavigationState.project.sections.push(section);
};

// Yeni section akışı başlat
export const startNewSectionFlow = (project, section) => {
  clearNavigationState();
  if (project) NavigationState.project = project;
  else project = { ...DefaultNavigationState.project };

  if (section) NavigationState.section = section;
  else section = { ...DefaultNavigationState.section };

  NavigationState.section = section;
  NavigationState.project = project;
  setContextSection(section);

  NavigationState.flowType = "new";
  NavigationState.sectionMode = "update-section";
};

// Mevcut section akışı başlat
export const startExistingSectionFlow = (project, section) => {
  clearNavigationState();
  NavigationState.project = project;
  NavigationState.section = section;
  NavigationState.flowType = "existing";
};

// Sonraki sayfayı belirle
export const getNextPage = (currentPage = "*", data = {}) => {
  // Geçici verileri güncelle (sadece yeni veri varsa)
  updateNavigationState(data);
  // Akış tipine göre sonraki sayfayı döndür
  const nextPage = flowMap[NavigationState.flowType]?.[currentPage];

  if (!nextPage) {
    console.warn(
      `No next page found for flow: ${NavigationState.flowType}, page: ${currentPage}`
    );
    return "/";
  }

  return nextPage;
};

// Geri dönüş sayfasını belirle
export const getBackPage = (currentPage) => {
  const backPage = backMap[NavigationState.flowType]?.[currentPage];

  if (!backPage) {
    console.warn(
      `No back page found for flow: ${NavigationState.flowType}, page: ${currentPage}`
    );
    return "/";
  }
  return backPage;
};

// Room types for the project
export const roomTypes = [
  { id: 1, name: "Balcony", image: "/assets/product-02.png" },
  { id: 2, name: "Garden", image: "/assets/product-03.png" },
  { id: 3, name: "Cafe", image: "/assets/product-04.png" },
  { id: 4, name: "Pool", image: "/assets/product-05.png" },
  { id: 5, name: "Gazebo", image: "/assets/product-07.png" },
  { id: 6, name: "Rattan", image: "/assets/product-08.png" },
  { id: 7, name: "Piknik", image: "/assets/product-09.png" },
  { id: 8, name: "Restaurant", image: "/assets/product-10.png" },
];
