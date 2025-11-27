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
  const index = NavigationState.project.sections.findIndex((s) =>
    replaceSection ? replaceSection == s : s.id === section.id
  );
  if (index !== -1) {
    NavigationState.project.sections[index] = section;
  } else {
    NavigationState.project.sections.push(section);
  }
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
  { id: 1, name: "Balcony & Terrace", image: "/assets/product-02.png" },
  { id: 2, name: "Garden", image: "/assets/product-03.png" },
  { id: 3, name: "Cafe", image: "/assets/product-04.png" },
  { id: 4, name: "Pool", image: "/assets/product-05.png" },
  /*{ id: 5, name: "Gazebo", image: "/assets/product-07.png" },*/
  { id: 6, name: "Home", image: "/assets/product-09.png" },
  { id: 7, name: "Office", image: "/assets/product-10.png" },
  { id: 8, name: "Event", image: "/assets/product-11.png" },
  { id: 9, name: "Wedding", image: "/assets/product-12.png" },
  { id: 10, name: "Bar & Pub", image: "/assets/product-13.png" },
  { id: 11, name: "Restaurant", image: "/assets/product-14.png" },
  { id: 12, name: "Meeting Room", image: "/assets/product-15.png" },
  { id: 13, name: "Mall & Food Court", image: "/assets/product-16.png" },
  /*{ id: 6, name: "Rattan", image: "/assets/product-08.png" },
  { id: 7, name: "Piknik", image: "/assets/product-09.png" },
  { id: 8, name: "Restaurant", image: "/assets/product-10.png" },*/
];

export const categoriesMap = {
  contract: [
    {
      id: 1,
      name: "Chairs",
      value: "chairs",
      image: "/assets/subcategory-chairs.png",
      multiline: false,
      gridArea: "row-column-span-3",
    },

    {
      id: 3,
      name: "Stools &\nComplements",
      value: "stools & complements",
      image: "/assets/subcategory-stools.png",
      multiline: true,
      gridArea: "row-span-2",
    },

    {
      id: 4,
      name: "Sunlounger &\nLounge",
      value: "sunlounger & lounge",
      image: "/assets/subcategory-sunlounger.png",
      multiline: true,
      gridArea: "row-column-span-3",
    },
    {
      id: 2,
      name: "Lighting",
      value: "lighting",
      image: "/assets/subcategory-lighting.png",
      multiline: false,
      gridArea: "row-column-span-3",
    },
    {
      id: 5,
      name: "Tables",
      value: "tables",
      image: "/assets/subcategory-tables.png",
      multiline: false,
      gridArea: "row-column-span-3",
    },
  ],

  garden: [
    {
      id: 1,
      name: "Chairs",
      value: "chairs",
      image: "/assets/subcategory0-chairs.png",
      gridArea: "",
      multiline: false,
    },
    {
      id: 3,
      name: "Children Group",
      value: "children group",
      image: "/assets/subcategory0-children-group.jpg",

      gridArea: "",
      multiline: true,
    },
    {
      id: 5,
      name: "Tables",
      value: "tables",
      image: "/assets/subcategory0-tables.png",
      gridArea: "",
      multiline: false,
    },
    {
      id: 2,
      name: "Stools & Multi Purpose",
      value: "stools & multi purpose",
      image: "/assets/subcategory0-stool-multipurpose.jpg",

      multiline: true,
      gridArea: "column-span-3",
    },

    {
      id: 4,
      name: "Sunloungers",
      value: "sunloungers",
      image: "/assets/subcategory0-sunloungers.jpg",

      gridArea: "column-span-3",
      multiline: true,
    },
  ],

  rattan: [
    {
      id: 1,
      name: "Chairs",
      value: "chairs",
      image: "/assets/subcategory1-chairs.png",
      gridArea: "",
      multiline: false,
    },
    {
      id: 5,
      name: "Bar Stool",
      value: "bar-stool",
      image: "/assets/subcategory1-bar-stool.jpg",
      multiline: false,
    },
    {
      id: 2,
      name: "Tables",
      value: "tables",
      image: "/assets/subcategory1-tables.png",
      gridArea: "",
      multiline: false,
    },
    {
      id: 3,
      name: "Lounge",
      value: "lounge",
      image: "/assets/subcategory1-lounge.png",
      multiline: true,
      gridArea: "column-span-3",
    },
    {
      id: 4,
      name: "Sunloungers",
      value: "sunloungers",
      image: "/assets/subcategory1-sunloungers.png",
      multiline: true,
      gridArea: "column-span-3",
    },
  ],
};
