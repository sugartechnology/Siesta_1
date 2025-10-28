import { useState, useEffect, useCallback } from "react";

export function useAuthToken(storageType = "local") {
  const storage =
    storageType === "local" ? window.localStorage : window.sessionStorage;

  const [token, setTokenState] = useState(() => {
    try {
      console.log("Token yüklendi:", storage.getItem("auth_token"));
      alert(storage.getItem("auth_token"));
      return storage.getItem("auth_token");
    } catch {
      return null;
    }
  });

  // Token kaydet
  const setToken = useCallback(
    (newToken) => {
      try {
        storage.setItem("auth_token", newToken);
        console.log("Token kaydedildi:", newToken);
        setTokenState(newToken);
      } catch (err) {
        console.error("Token kaydedilemedi:", err);
      }
    },
    [storage]
  );

  // Token sil
  const removeToken = useCallback(() => {
    try {
      storage.removeItem("auth_token");
      setTokenState(null);
    } catch (err) {
      console.error("Token silinemedi:", err);
    }
  }, [storage]);

  // Tarayıcı sekmeleri arasında senkronizasyon
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "auth_token") {
        console.log("Storage değişikliği algılandı:", e.newValue);
        setTokenState(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return { token, setToken, removeToken };
}
