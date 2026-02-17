import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthToken } from "./useAuthToken";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const API_URL = process.env.REACT_APP_API_URL;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { setToken, token } = useAuthToken("local");

  useEffect(() => {
    checkSession();
    //setLoading(false);
  }, []);

  /** Map CRM UserResponse (user/me) to Siesta user shape */
  function mapUserMeToSiesta(data) {
    if (!data) return null;
    const name = [data.firstName, data.lastName].filter(Boolean).join(" ") || data.username || "";
    return {
      id: data.id,
      name,
      email: data.email ?? "",
    };
  }

  async function checkSession() {
    try {
      const res = await fetch(API_URL + "/user/me", {
        headers: { Authorization: "Bearer " + token },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(mapUserMeToSiesta(data));
        navigate("/home");
      } else {
        setUser(null);
        setToken(null);
        navigate("/login");
      }
    } catch (error) {
      console.error("Session check failed:", error);
      navigate("/login");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  /** Map CRM UserInfo (login response) to Siesta user shape */
  function mapLoginUserToSiesta(dataUser) {
    if (!dataUser) return { id: null, name: "", email: "" };
    const name = [dataUser.firstName, dataUser.lastName].filter(Boolean).join(" ") || dataUser.username || "";
    return {
      id: dataUser.id,
      name,
      email: dataUser.email ?? "",
    };
  }

  async function login(username, password) {
    const companySlug = process.env.REACT_APP_COMPANY_SLUG || "siesta";
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
      throw new Error(data.error || "Giriş başarısız");
    }
    setToken(data.accessToken);
    setUser(mapLoginUserToSiesta(data.user));
  }

  async function register(name, email, password) {
    const postData = {
      name: name,
      email: email,
      password: password,
      companySlug: process.env.REACT_APP_COMPANY_SLUG 
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
      throw new Error(errorData.message || "Kayıt başarısız");
    }
    const data = await res.json();
    return data;
  }

  async function logout() {
    /*fetch(API_URL + "/auth/logout", {
      method: "POST",
      credentials: "include",
    });*/
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
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {/*children*/}
    </AuthContext.Provider>
  );
}
