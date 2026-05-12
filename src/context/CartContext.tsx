import React, { createContext, useContext, useState, useCallback } from "react";
import type { FirestoreProduct } from "@/hooks/useProducts";

// Re-export for convenience so existing imports still work
export type Product = FirestoreProduct;

interface CartItem {
  product: Product;
  variantId?: string;
  variantName?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addToCart: (product: Product, quantity?: number, variantId?: string, variantName?: string) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
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

  const addToCart = useCallback((product: Product, quantity: number = 1, variantId?: string, variantName?: string) => {
    // Determine stock based on variant or master
    let availableStock = product.stock;
    let price = product.discountPrice ?? product.price;

    if (variantId && product.variants) {
      const variant = product.variants.find(v => v.id === variantId);
      if (variant) {
        if (variant.stock !== undefined) availableStock = variant.stock;
        if (variant.price !== undefined) price = variant.price;
      }
    }

    if (availableStock <= 0) {
      return; 
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.variantId === variantId);
      if (existing) {
        const newQuantity = existing.quantity + quantity;
        if (newQuantity > availableStock) {
          return prev.map((i) =>
            (i.product.id === product.id && i.variantId === variantId) ? { ...i, quantity: availableStock } : i
          );
        }
        return prev.map((i) =>
          (i.product.id === product.id && i.variantId === variantId) ? { ...i, quantity: newQuantity } : i
        );
      }
      const finalQty = Math.min(quantity, availableStock);
      return [...prev, { product, quantity: finalQty, variantId, variantName }];
    });
    setIsOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string, variantId?: string) => {
    setItems((prev) => prev.filter((i) => !(i.product.id === productId && i.variantId === variantId)));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, variantId?: string) => {
    setItems((prev) => {
      const item = prev.find(i => i.product.id === productId && i.variantId === variantId);
      if (!item) return prev;

      if (quantity <= 0) {
        return prev.filter((i) => !(i.product.id === productId && i.variantId === variantId));
      }
      
      let availableStock = item.product.stock;
      if (variantId && item.product.variants) {
        const variant = item.product.variants.find(v => v.id === variantId);
        if (variant && variant.stock !== undefined) availableStock = variant.stock;
      }

      if (quantity > availableStock) {
        return prev.map((i) => (i.product.id === productId && i.variantId === variantId ? { ...i, quantity: availableStock } : i));
      }

      return prev.map((i) => (i.product.id === productId && i.variantId === variantId ? { ...i, quantity } : i));
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
