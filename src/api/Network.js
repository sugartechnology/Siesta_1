const getStoredAuthToken = () => {
  const authToken = localStorage.getItem("auth_token");
  if (!authToken || authToken === "null" || authToken === "undefined") {
    return null;
  }
  return authToken;
};

const getTenantHeaders = () => {
  const companySlug = process.env.REACT_APP_COMPANY_SLUG;
  const tenantId = process.env.REACT_APP_TENANT_ID;

  return {
    ...(companySlug ? { "X-Company-Slug": companySlug } : {}),
    ...(tenantId ? { "X-Tenant-Id": tenantId } : {}),
  };
};

const getAuthHeaders = (customHeaders = {}) => {
  const authToken = getStoredAuthToken();
  const hasCustomAuth = customHeaders && customHeaders.Authorization;

  return {
    ...getTenantHeaders(),
    ...(!hasCustomAuth && authToken
      ? {
          Authorization: `Bearer ${authToken}`,
        }
      : {}),
    ...customHeaders,
  };
};

const parseResponsePayload = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch (error) {
      console.warn("Failed to parse JSON response:", error);
      return null;
    }
  }

  try {
    const text = await response.text();
    return text ? text : null;
  } catch (error) {
    console.warn("Failed to read response body:", error);
    return null;
  }
};

const buildHttpError = async (response) => {
  const payload = await parseResponsePayload(response);
  const message =
    (payload &&
      typeof payload === "object" &&
      (payload.message || payload.error)) ||
    (typeof payload === "string" && payload.trim()) ||
    `HTTP error! status: ${response.status}`;

  const error = new Error(message);
  error.status = response.status;
  error.payload = payload;
  return error;
};

export const fetchData = async (endpoint, headers = undefined) => {
  try {
    const response = await fetch(endpoint, {
      headers: getAuthHeaders(headers),
      credentials: "include",
    });
    if (!response.ok) {
      throw await buildHttpError(response);
    }
    const data = await parseResponsePayload(response);
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
    const hasPayload = payload !== undefined && payload !== null;
    const isFormData = payload instanceof FormData;

    const requestHeaders = {
      ...getAuthHeaders(headers),
    };

    if (hasPayload && !isFormData) {
      requestHeaders["Content-Type"] = "application/json";
    }

    const requestBody = !hasPayload
      ? undefined
      : isFormData
        ? payload
        : JSON.stringify(payload);

    const response = await fetch(endpoint, {
      method: method,
      headers: requestHeaders,
      body: requestBody,
      credentials: "include",
    });

    if (!response.ok) {
      throw await buildHttpError(response);
    }

    const data = await parseResponsePayload(response);
    if (data !== null) {
      return data;
    }

    return { success: true };
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
};

export const updateData = async (endpoint, payload) => {
  try {
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(payload),
      credentials: "include",
    });
    if (!response.ok) {
      throw await buildHttpError(response);
    }
    const data = await parseResponsePayload(response);
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
      headers: getAuthHeaders(),
      credentials: "include",
    });
    if (!response.ok) {
      throw await buildHttpError(response);
    }
    return true;
  } catch (error) {
    console.error("Error deleting data:", error);
    throw error;
  }
};
