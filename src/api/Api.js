import { fetchData, postData } from "./Network";

export const getUserProfile = async (userId) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/users/${userId}/profile`;
  return await fetchData(endpoint);
};

export const loginUser = async (email, password) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/v1/auth/login`;
  const payload = { email, password };
  return await postData(endpoint, payload);
};

export const fetchProducts = async (
  defaultFilters,
  filter = undefined,
  pageNumber = 0,
  sort = "baseName Asc" // Default: A'dan Z'ye
) => {
  try {
    const hasDefaultFilters = Boolean(
      defaultFilters.type || defaultFilters.style || defaultFilters.colorPalette
    );

    const requestBody = filter
      ? hasDefaultFilters
        ? { ...filter, defaultFilters, sort }
        : { ...filter, sort }
      : hasDefaultFilters
      ? { defaultFilters, sort }
      : { sort };

    const url =
      process.env.REACT_APP_SEARCY_API_URL +
      `/search/v2/products?page=${pageNumber}`;

    console.log("url", url);
    console.log(JSON.stringify(requestBody), "Request");
    const response = await postData(url, requestBody, {
      "X-Tenant-Id": process.env.REACT_APP_TENANT_ID,
      "Accept-Language": "en",
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    });
    console.log(JSON.stringify(response.data), "Response");
    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const fetchProductVariants = async (name) => {
  try {
    const url =
      process.env.REACT_APP_API_URL + `/projects/products/variants/${name}`;

    console.log("url", url);
    const response = await postData(url);
    console.log(JSON.stringify(response.data), "Response");
    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

// ===== PROJECT MANAGEMENT API =====

// Get user's projects (summary)
export const getUserProjects = async () => {
  const endpoint = `${process.env.REACT_APP_API_URL}/projects/my-projects`;
  return await fetchData(endpoint);
};

// Get user's projects (detailed)
export const getUserProjectsDetailed = async () => {
  const endpoint = `${process.env.REACT_APP_API_URL}/projects/my-projects/detailed`;
  return await fetchData(endpoint);
};

// Get project by ID - single call
export const getProjectById = async (projectId) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/projects/${projectId}`;
  return await fetchData(endpoint);
};

// Get project sections
export const getProjectSections = async (projectId) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/projects/${projectId}/sections`;
  return await fetchData(endpoint);
};

// Get section by ID
export const getSectionById = async (sectionId) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/projects/sections/${sectionId}`;
  return await fetchData(endpoint);
};

// Create new project
export const createProject = async (projectData) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/projects`;
  return await postData(endpoint, projectData);
};

// Remove project
export const removeProject = async (projectId) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/projects/${projectId}`;
  return await postData(endpoint, null, undefined, "DELETE");
};

// Create new project
export const updateProjectName = async (projectId, projectName) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/projects/${projectId}/update-name/${projectName}`;
  return await postData(endpoint);
};

export const updateSectionName = async (sectionId, sectionName) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/projects/sections/${sectionId}/update-name/${sectionName}`;
  return await postData(endpoint);
};

// Add section to project
export const addSectionToProject = async (
  projectId,
  sectionData,
  imageFile
) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/projects/${projectId}/sections`;

  const formData = new FormData();

  // JSON string'i Blob olarak ekle ve Content-Type belirt
  const sectionBlob = new Blob([JSON.stringify(sectionData)], {
    type: "application/json",
  });
  formData.append("section", sectionBlob);

  if (imageFile) {
    formData.append("image", imageFile, "image.jpg");
  }
  return await postData(endpoint, formData, undefined, "POST");
};

// Update section (JSON only)
export const updateSectionJson = async (sectionId, sectionData) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/projects/sections/${sectionId}`;
  return await postData(endpoint, sectionData, undefined, "PUT");
};

// Update section with image (multipart form data)
export const updateSectionWithImage = async (
  sectionId,
  sectionData,
  imageFile
) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/projects/sections/${sectionId}/with-image`;

  const formData = new FormData();

  // JSON string'i Blob olarak ekle ve Content-Type belirt
  const sectionBlob = new Blob([JSON.stringify(sectionData)], {
    type: "application/json",
  });
  formData.append("section", sectionBlob);

  if (imageFile) {
    formData.append("image", imageFile);
  }

  return await postData(endpoint, formData, undefined, "PUT");
};

// Update section image only
export const updateSectionImage = async (sectionId, imageFile) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/projects/sections/${sectionId}/image`;

  const formData = new FormData();
  formData.append("image", imageFile);

  return await postData(endpoint, formData, undefined, "PUT");
};

// Add product to section
export const addProductToSection = async (sectionId, productData) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/projects/sections/${sectionId}/products`;
  return await postData(endpoint, productData);
};

// Remove product from section
export const removeProductFromSection = async (sectionId, productId) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/projects/sections/${sectionId}/products/${productId}`;
  return await postData(endpoint, null, undefined, "DELETE");
};

// Delete section
export const deleteSection = async (sectionId) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/projects/sections/${sectionId}`;
  return await postData(endpoint, null, undefined, "DELETE");
};

// Generate AI design for section
export const generateDesignForSection = async (sectionId) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/projects/sections/${sectionId}/generate-design`;
  return await postData(endpoint, null);
};

// Get products by IDs
export const getProductsByIds = async (productIds) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/projects/products/by-ids`;
  return await postData(endpoint, productIds);
};

export const fetchSampleRooms = async () => {
  const endpoint = `${process.env.REACT_APP_URL}/api/similar-rooms`;

  return await fetchData(endpoint);
};
// ===== USAGE EXAMPLES =====

/*
// Example usage in React components:

// 1. Get user's projects
const projects = await getUserProjects();

// 2. Create a new project
const newProject = await createProject({
  name: "My Living Room",
  description: "Modern living room design",
  address: {
    street: "123 Main St",
    city: "New York",
    country: "USA"
  }
});

// 3. Add a section to project
const newSection = await addSectionToProject(projectId, {
  name: "Living Room Section",
  roomType: "LIVING_ROOM",
  style: "MODERN",
  colorPalette: "NEUTRAL"
});

// 4. Update section with image
const updatedSection = await updateSectionWithImage(sectionId, {
  name: "Updated Section Name",
  style: "CONTEMPORARY"
}, imageFile);

// 5. Add product to section
const updatedSection = await addProductToSection(sectionId, {
  productId: "prod-123",
  name: "Sofa",
  quantity: 1
});

// 6. Generate AI design
const design = await generateDesignForSection(sectionId);

// 7. Get products by IDs
const products = await getProductsByIds(["prod-123", "prod-456", "prod-789"]);

// ===== ENVIRONMENT VARIABLES =====
// Add to your .env file:
// REACT_APP_API_URL=https://api.local.test:4764
// REACT_APP_SEARCY_API_URL=https://search-api.example.com
// REACT_APP_TENANT_ID=your-tenant-id
*/
