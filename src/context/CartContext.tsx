import React, { createContext, useContext, useState, useCallback } from "react";
import type { FirestoreProduct } from "@/hooks/useProducts";

// Re-export for convenience so existing imports still work
export type Product = FirestoreProduct;

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bridal_cart");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [isOpen, setIsOpen] = useState(false);

  // Save to localStorage on change
  React.useEffect(() => {
    localStorage.setItem("bridal_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    if (product.stock <= 0) {
      return; // Fallback security
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        const newQuantity = existing.quantity + quantity;
        if (newQuantity > product.stock) {
          // If we are over stock, cap it at stock
          return prev.map((i) =>
            i.product.id === product.id ? { ...i, quantity: product.stock } : i
          );
        }
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: newQuantity } : i
        );
      }
      // New item, cap quantity at stock just in case
      const finalQty = Math.min(quantity, product.stock);
      return [...prev, { product, quantity: finalQty }];
    });
    setIsOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      const item = prev.find(i => i.product.id === productId);
      if (!item) return prev;

      if (quantity <= 0) {
        return prev.filter((i) => i.product.id !== productId);
      }
      
      // Check stock limit
      if (quantity > item.product.stock) {
        return prev.map((i) => (i.product.id === productId ? { ...i, quantity: item.product.stock } : i));
      }

      return prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i));
    });
  }, []);

  const toggleCart = useCallback(() => setIsOpen((p) => !p), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  // Use discountPrice (sale price) if set, otherwise use original price
  const totalPrice = items.reduce((s, i) => {
    const unitPrice = i.product.discountPrice ?? i.product.price;
    return s + unitPrice * i.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{ items, isOpen, addToCart, removeFromCart, updateQuantity, toggleCart, closeCart, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
