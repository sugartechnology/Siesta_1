// Helper function to get auth headers
const getAuthHeaders = (customHeaders = {}) => {
  const authToken = localStorage.getItem("auth_token");

  // Eğer custom headers'da Authorization varsa onu kullan, yoksa localStorage'dan al
  const hasCustomAuth = customHeaders && customHeaders.Authorization;

  return {
    ...customHeaders,
    ...(authToken &&
      !hasCustomAuth && {
        Authorization: `Bearer ${authToken}`,
        "X-Tenant-Id": process.env.REACT_APP_TENANT_ID,
      }),
  };
};

export const fetchData = async (endpoint, headers = undefined) => {
  try {
    const response = await fetch(endpoint, {
      headers: getAuthHeaders(headers),
    });
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

export const postData = async (
  endpoint,
  payload,
  headers = undefined,
  method = "POST"
) => {
  try {
    // Check if payload is FormData (for multipart uploads)
    const isFormData = payload instanceof FormData;

    const requestHeaders = {
      ...getAuthHeaders(headers),
    };

    // Only set Content-Type for JSON payloads
    if (!isFormData) {
      requestHeaders["Content-Type"] = "application/json";
    }

    const requestBody = isFormData ? payload : JSON.stringify(payload);

    const response = await fetch(endpoint, {
      method: method,
      headers: requestHeaders,
      body: requestBody,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Handle different response types
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return data;
    } else {
      // For non-JSON responses (like DELETE operations)
      return { success: true };
    }
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
};

export const updateData = async (endpoint, payload) => {
  try {
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
};

export const deleteData = async (endpoint) => {
  try {
    const response = await fetch(endpoint, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error deleting data:", error);
    throw error;
  }
};
