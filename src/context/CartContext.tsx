import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { FirestoreProduct } from "@/hooks/useProducts";
import { trackAddToCart } from "@/lib/analytics";
import { db } from "@/config/firebase";
import { doc, getDoc, getDocs, collection, query } from "firebase/firestore";

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
  openCart: () => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate cart from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("bridal_cart");
    if (!saved) {
      setIsHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setIsHydrated(true);
        return;
      }

      // Check if old format (contains full product object)
      if (parsed[0].product) {
        localStorage.removeItem("bridal_cart");
        setIsHydrated(true);
        return;
      }

      // New minimal format: hydrate full products
      const hydrateCart = async () => {
        try {
          const hydratedItems = await Promise.all(
            parsed.map(async (item: any) => {
              const docRef = doc(db, "products", item.productId);
              const snap = await getDoc(docRef);
              if (!snap.exists()) return null;

              const product = { id: snap.id, ...snap.data() } as FirestoreProduct;
              
              if (item.variantId || (product.variants && product.variants.length > 0)) {
                const vSnap = await getDocs(query(collection(db, "products", item.productId, "variants")));
                product.variants = vSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
              }

              return {
                product,
                variantId: item.variantId,
                variantName: item.variantName,
                quantity: item.quantity
              } as CartItem;
            })
          );
          setItems(hydratedItems.filter(Boolean) as CartItem[]);
        } catch (error) {
          console.error("Failed to hydrate cart:", error);
          localStorage.removeItem("bridal_cart");
        } finally {
          setIsHydrated(true);
        }
      };

      hydrateCart();
    } catch (e) {
      console.error("Error parsing cart:", e);
      localStorage.removeItem("bridal_cart");
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage on change, but only minimal data
  useEffect(() => {
    if (!isHydrated) return; // Don't overwrite before hydration finishes
    
    const minimalCart = items.map(item => ({
      productId: item.product.id,
      variantId: item.variantId,
      variantName: item.variantName,
      quantity: item.quantity
    }));
    localStorage.setItem("bridal_cart", JSON.stringify(minimalCart));
  }, [items, isHydrated]);

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
    try { trackAddToCart(product as any, quantity, variantName); } catch {}
    // Cart toast handles visual feedback; don't auto-open the drawer
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

  const toggleCart = useCallback(() => setIsOpen(prev => !prev), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const p = item.variantId && item.product.variants
      ? item.product.variants.find(v => v.id === item.variantId)?.price ?? (item.product.discountPrice ?? item.product.price)
      : (item.product.discountPrice ?? item.product.price);
    return sum + (p * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{
      items, isOpen, addToCart, removeFromCart, updateQuantity,
      toggleCart, closeCart, openCart, clearCart, totalItems, totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
