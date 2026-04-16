import { useState, useEffect, useCallback } from "react";

const normalizeToken = (value) => {
  if (!value || value === "null" || value === "undefined") {
    return null;
  }
  return value;
};

export function useAuthToken(storageType = "local") {
  const storage =
    storageType === "local" ? window.localStorage : window.sessionStorage;

  const [token, setTokenState] = useState(() => {
    try {
      const storedToken = normalizeToken(storage.getItem("auth_token"));
      console.log("Token yuklendi:", storedToken);
      return storedToken;
    } catch {
      return null;
    }
  });

  const setToken = useCallback(
    (newToken) => {
      try {
        const normalizedToken = normalizeToken(newToken);
        if (normalizedToken) {
          storage.setItem("auth_token", normalizedToken);
        } else {
          storage.removeItem("auth_token");
        }
        console.log("Token kaydedildi:", normalizedToken);
        setTokenState(normalizedToken);
      } catch (err) {
        console.error("Token kaydedilemedi:", err);
      }
    },
    [storage]
  );

  const removeToken = useCallback(() => {
    try {
      storage.removeItem("auth_token");
      setTokenState(null);
    } catch (err) {
      console.error("Token silinemedi:", err);
    }
  }, [storage]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "auth_token") {
        const nextToken = normalizeToken(e.newValue);
        console.log("Storage degisikligi algilandi:", nextToken);
        setTokenState(nextToken);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return { token, setToken, removeToken };
}
