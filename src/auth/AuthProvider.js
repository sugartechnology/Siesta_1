import { createContext, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthToken } from "./useAuthToken";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const API_URL = process.env.REACT_APP_API_URL;
  const companySlug = process.env.REACT_APP_COMPANY_SLUG || "siesta";
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { setToken, token } = useAuthToken("local");

  function shouldRedirectAuthenticatedUserToHome() {
    const currentPath = window.location.pathname;
    return currentPath === "/" || currentPath === "/login";
  }

  function mapUserMeToSiesta(data) {
    if (!data) return null;
    const name =
      [data.firstName, data.lastName].filter(Boolean).join(" ") ||
      data.username ||
      "";
    return {
      id: data.id,
      name,
      email: data.email ?? "",
    };
  }

  const buildAuthHeaders = useCallback(
    (authToken) => {
      return {
        ...(authToken ? { Authorization: "Bearer " + authToken } : {}),
        ...(companySlug ? { "X-Company-Slug": companySlug } : {}),
      };
    },
    [companySlug]
  );

  const validateSession = useCallback(
    async ({ redirectOnSuccess = false, redirectOnFailure = true } = {}) => {
      try {
        const res = await fetch(API_URL + "/user/me", {
          headers: buildAuthHeaders(token),
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(mapUserMeToSiesta(data));
          if (redirectOnSuccess && shouldRedirectAuthenticatedUserToHome()) {
            navigate("/home");
          }
          return true;
        }

        setUser(null);
        setToken(null);
        if (redirectOnFailure) {
          navigate("/login");
        }
        return false;
      } catch (error) {
        console.error("Session check failed:", error);
        setUser(null);
        setToken(null);
        if (redirectOnFailure) {
          navigate("/login");
        }
        return false;
      }
    },
    [API_URL, buildAuthHeaders, navigate, setToken, token]
  );

  const checkSession = useCallback(async () => {
    try {
      await validateSession({
        redirectOnSuccess: true,
        redirectOnFailure: true,
      });
    } finally {
      setLoading(false);
    }
  }, [validateSession]);

  const requireAuth = useCallback(async () => {
    return validateSession({
      redirectOnSuccess: false,
      redirectOnFailure: true,
    });
  }, [validateSession]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  function mapLoginUserToSiesta(dataUser) {
    if (!dataUser) return { id: null, name: "", email: "" };
    const name =
      [dataUser.firstName, dataUser.lastName].filter(Boolean).join(" ") ||
      dataUser.username ||
      "";
    return {
      id: dataUser.id,
      name,
      email: dataUser.email ?? "",
    };
  }

  async function login(username, password) {
    const postData = {
      username,
      password,
      companySlug,
    };
    const res = await fetch(API_URL + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Giris basarisiz");
    }
    setToken(data.accessToken);
    setUser(mapLoginUserToSiesta(data.user));
  }

  async function register(name, email, password) {
    const postData = {
      name,
      email,
      password,
      companySlug,
    };
    const res = await fetch(API_URL + "/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
      credentials: "include",
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Kayit basarisiz");
    }
    const data = await res.json();
    return data;
  }

  async function logout() {
    setToken(null);
    setUser(null);
    navigate("/login");
  }

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    requireAuth,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
