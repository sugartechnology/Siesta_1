import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { NavigationState } from "../utils/NavigationState";

const ProductCartContext = createContext(null);

const buildCartItem = (product, quantity = 1) => ({
  quantity: Math.max(1, quantity),
  productId: product.productId,
  baseName: product.name || product.baseName,
  description: product.description,
  url:
    product.images?.[1] ||
    product.images?.[0] ||
    product.thumbnailUrl ||
    product.thumbnail ||
    product.url ||
    "/assets/product-placeholder.png",
});

export function ProductCartProvider({ children }) {
  const [items, setItems] = useState(() => NavigationState.selectedProducts || []);

  useEffect(() => {
    NavigationState.selectedProducts = items;
  }, [items]);

  const addProduct = (product, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.productId
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.max(0, updated[existingIndex].quantity + quantity),
        };
        return updated;
      }

      return [...prev, buildCartItem(product, quantity)];
    });
  };

  const removeProduct = (productId, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === productId);
      if (existingIndex < 0) return prev;

      const updated = [...prev];
      const newQuantity = updated[existingIndex].quantity - quantity;

      if (newQuantity <= 0) {
        return updated.filter((item) => item.productId !== productId);
      }

      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQuantity,
      };
      return updated;
    });
  };

  const setProductQuantity = (productId, quantity) => {
    const parsed = Number(quantity);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setItems((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: parsed } : item
      )
    );
  };

  const getQuantity = (productId) => {
    const item = items.find((entry) => entry.productId === productId);
    return item ? item.quantity : 0;
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      setItems,
      addProduct,
      removeProduct,
      setProductQuantity,
      getQuantity,
      clearCart,
      totalCount,
    }),
    [items, totalCount]
  );

  return (
    <ProductCartContext.Provider value={value}>{children}</ProductCartContext.Provider>
  );
}

export function useProductCart() {
  const context = useContext(ProductCartContext);
  if (!context) {
    throw new Error("useProductCart must be used within ProductCartProvider");
  }
  return context;
}
