import React, { createContext, useContext, useState, useCallback } from "react";
import type { FirestoreProduct } from "@/hooks/useProducts";

export interface CartToastItem {
  id: number;
  product: FirestoreProduct;
  variantName?: string;
  price: number;
  quantity: number;
}

interface CartToastContextType {
  toasts: CartToastItem[];
  showCartToast: (product: FirestoreProduct, quantity: number, variantName?: string, price?: number) => void;
  removeCartToast: (id: number) => void;
}

const CartToastContext = createContext<CartToastContextType | undefined>(undefined);

export const CartToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<CartToastItem[]>([]);

  const showCartToast = useCallback(
    (product: FirestoreProduct, quantity: number = 1, variantName?: string, price?: number) => {
      const id = Date.now() + Math.random();
      const resolvedPrice = price ?? product.discountPrice ?? product.price;
      setToasts((prev) => {
        const updated = [...prev, { id, product, variantName, price: resolvedPrice, quantity }];
        return updated.slice(-3); // Keep at most 3 toasts
      });
    },
    []
  );

  const removeCartToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <CartToastContext.Provider value={{ toasts, showCartToast, removeCartToast }}>
      {children}
    </CartToastContext.Provider>
  );
};

export const useCartToast = () => {
  const ctx = useContext(CartToastContext);
  if (!ctx) throw new Error("useCartToast must be used within CartToastProvider");
  return ctx;
};
