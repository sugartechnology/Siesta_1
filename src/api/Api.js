import { fetchData, postData } from "./Network";

export const getUserProfile = async (userId) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/users/${userId}/profile`;
  return await fetchData(endpoint);
};

/** CRM login: POST /api/login, body { username, password, companySlug? }. Returns { accessToken, refreshToken, user }. */
export const loginUser = async (usernameOrEmail, password) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/login`;
  const companySlug = process.env.REACT_APP_COMPANY_SLUG ;
  const payload = { username: usernameOrEmail, password, companySlug };
  return await postData(endpoint, payload);
};

// ===== USER MANAGEMENT API =====

// Register user
export const registerUser = async (name, email, password) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/auth/register`;
  const companySlug = process.env.REACT_APP_COMPANY_SLUG ;
  const payload = { name, email, password, companySlug };
  return await postData(endpoint, payload);
};

// Get current user profile
export const getCurrentUser = async () => {
  const endpoint = `${process.env.REACT_APP_API_URL}/user/me`;
  return await fetchData(endpoint);
};

// Update user profile
export const updateUserProfile = async (userData) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/user/me`;
  return await postData(endpoint, userData, undefined, "PUT");
};

// Suspend user account
export const suspendUserAccount = async () => {
  const endpoint = `${process.env.REACT_APP_API_URL}/user/suspend`;
  return await postData(endpoint, null, undefined, "POST");
};

// Reactivate user account
export const reactivateUserAccount = async () => {
  const endpoint = `${process.env.REACT_APP_API_URL}/user/reactivate`;
  return await postData(endpoint, null, undefined, "POST");
};

/**
 * Siesta filter/sort → CRM SearchCriteria dönüşümü.
 * CRM product index'te "baseName" yok; "name.keyword" ile sıralama yapılır.
 * Sort örn. "baseName Asc" → [{ field: "name.keyword", order: "ASC" }]
 */
const SORT_FIELD_MAP = {
  baseName: "name.keyword",
  name: "name.keyword",
};

const parseSort = (sortStr) => {
  if (!sortStr || typeof sortStr !== "string") {
    return [{ field: "name.keyword", order: "ASC" }];
  }
  const parts = sortStr.trim().split(/\s+/);
  const rawField = parts[0] || "baseName";
  const field = SORT_FIELD_MAP[rawField] ?? rawField;
  const order = (parts[1] || "Asc").toUpperCase() === "DESC" ? "DESC" : "ASC";
  return [{ field, order }];
};

/**
 * Backend fieldToKeyMap sadece küçük harf anahtar kabul ediyor (category, collection).
 * Siesta "Category", "SubCategory" vb. gönderdiği için alan adını küçük harfe çeviriyoruz.
 */
const FILTER_KEY_TO_FIELD = {
  Category: "collection",
  SubCategory: "category",
  Rooms: "rooms",
  Styles: "styles",
  Collection: "collection",
};

/**
 * Siesta filter.filters → CRM SearchCriteria.filters (SearchFilter[])
 * Siesta: [{ key: "Category", options: [{ key, selected }] | value[] }]
 * CRM SearchFilter: { field, query?, min?, max?, options: [{ value, label }] }
 */
const mapFiltersToSearchCriteria = (filters) => {
  if (!Array.isArray(filters) || filters.length === 0) {
    return [];
  }
  return filters.map((f) => {
    const rawKey = f.key || f.field;
    const field =
      typeof rawKey === "string"
        ? FILTER_KEY_TO_FIELD[rawKey] ?? rawKey.toLowerCase()
        : rawKey;
    const options = (f.options || []).map((o) => {
      const val = o?.key ?? o?.value ?? o;
      const label = o?.label ?? o?.key ?? o?.value ?? o;
      return { value: String(val), label: String(label) };
    });
    return {
      field,
      query: null,
      min: null,
      max: null,
      options,
    };
  });
};

/**
 * CRM products search: POST /api/products/search (company_id gerekmez; şirket kapsamı oturum açan kullanıcıdan türetilir).
 * Body: SearchCriteria { query, page, size, sort, filters }
 * Query params: includeImages (boolean, default: false) - Images'ları DB'den yüklemek için
 * Response: PagedFilterable { content, page: { size, number, totalElements, totalPages } }
 */
export const fetchProducts = async (
  defaultFilters,
  filter = undefined,
  pageNumber = 0,
  sort = "baseName Asc", // Default: A'dan Z'ye
  includeImages = true // Images'ları DB'den yüklemek için (default: false)
) => {
  try {
    const searchCriteria = {
      query: filter?.search ?? "",
      page: pageNumber,
      size: 24,
      sort: parseSort(sort),
      filters: mapFiltersToSearchCriteria(filter?.filters ?? []),
      includeImages: includeImages,
      groupBy: "name", // Ürünleri isimlere göre gruplandır
    };

    // URL'e query parametrelerini ekle
    const baseUrl = `${process.env.REACT_APP_API_URL}/products/search`;
    const queryParams = new URLSearchParams();
    if (includeImages) {
      queryParams.append("includeImages", "true");
    }
    const url = queryParams.toString() 
      ? `${baseUrl}?${queryParams.toString()}` 
      : baseUrl;

    const response = await postData(url, searchCriteria);
    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const fetchProductVariants = async (name) => {
  try {
    const url =
      process.env.REACT_APP_API_URL + `/projects/products/variants/${encodeURIComponent(name)}`;

    const response = await postData(url);
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
export const generateDesignForSection = async (projectId, sectionId, prompt) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/projects/${projectId}/sections/${sectionId}/generate-design`;
  const payload = new FormData();
  payload.append("prompt", prompt);
  return await postData(endpoint, payload);
};

// Get products by IDs
export const getProductsByIds = async (productIds) => {
  const endpoint = `${process.env.REACT_APP_API_URL}/projects/products/by-ids`;
  return await postData(endpoint, productIds);
};

export const fetchSampleRooms = async () => {
  const endpoint = `${process.env.REACT_APP_URL}/similar-rooms`;
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
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
// REACT_APP_API_URL=https://api.local.test:4764/api  (CRM base URL)
// REACT_APP_TENANT_ID=your-tenant-id
// (products/search company_id istemez; şirket kapsamı kullanıcı yetkisinden alınır)
*/
