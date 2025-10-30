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

  async function checkSession() {
    try {
      const res = await fetch(API_URL + "/user/me", {
        headers: { Authorization: "Bearer " + token },
        credentials: "include",
      });
      if (res.ok) {
        //const data = await res.json();
        setUser({ id: "data.id", name: "data.name", email: "" });
        navigate("/home");
      } else {
        navigate("/login");
        setUser(null);
      }
    } catch (error) {
      console.error("Session check failed:", error);
      navigate("/login");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(username, password) {
    const postData = {
      email: username,
      password: password,
      deviceUUID: undefined,
    };
    const res = await fetch(API_URL + "/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Giriş başarısız");
    res.json().then(async (data) => {
      setToken(data.accessToken);
      await checkSession();
    });
  }

  async function logout() {
    fetch(API_URL + "/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setToken(null);
    setUser(null);
  }

  const value = { user, loading, login, logout, isAuthenticated: !!user };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {/*children*/}
    </AuthContext.Provider>
  );
}
