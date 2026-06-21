import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "../config/firebase";
import {
  collection, addDoc, serverTimestamp, doc, increment, writeBatch,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

declare global {
  interface Window { Razorpay: any; }
}

const FREE_SHIPPING_THRESHOLD = 999;

const CartDrawer = () => {
  const {
    items, isOpen, closeCart, removeFromCart,
    updateQuantity, totalPrice, clearCart,
  } = useCart();
  const { user, profile } = useAuth();
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  /* ── Touch-to-swipe close ── */
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 60) closeCart(); // Swipe right to close
    touchStartX.current = null;
  };

  /* ── Escape key ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeCart();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  /* ── Body scroll lock ── */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleCheckout = useCallback(() => {
    closeCart();
    navigate("/cart");
  }, [closeCart, navigate]);

  const subtotal = totalPrice;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
  const total = subtotal + shipping;

  /* ── Render: always mount so animation plays ── */
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        aria-hidden="true"
        className="fixed inset-0 z-[60] transition-all duration-300"
        style={{
          background: "#000",
          opacity: isOpen ? 0.45 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-background z-[61] shadow-2xl flex flex-col"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 400ms cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "transform",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <h2 className="font-heading text-xl font-semibold flex items-center gap-2">
            <ShoppingBag size={20} className="text-gold" />
            My Cart
            {items.length > 0 && (
              <span className="text-sm font-body text-muted-foreground font-normal">
                ({items.reduce((s, i) => s + i.quantity, 0)} item{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""})
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart drawer"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Free shipping progress bar */}
        {items.length > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
          <div className="px-5 py-3 bg-blush/30 border-b border-border/50 flex-shrink-0">
            <div className="flex justify-between text-xs font-body text-muted-foreground mb-1.5">
              <span>Add ₹{(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString("en-IN")} for FREE shipping</span>
              <span>₹{FREE_SHIPPING_THRESHOLD.toLocaleString("en-IN")}</span>
            </div>
            <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gold rounded-full transition-all duration-500"
                style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
        {items.length > 0 && subtotal >= FREE_SHIPPING_THRESHOLD && (
          <div className="px-5 py-2.5 bg-green-50 border-b border-green-100 text-center text-xs font-body text-green-700 flex-shrink-0">
            🎉 You've unlocked FREE shipping!
          </div>
        )}

        {/* Cart body */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6 py-16 text-center">
              <div
                className="text-6xl"
                style={{ animation: "bounce 2s ease-in-out infinite" }}
                aria-hidden="true"
              >
                🛒
              </div>
              <h3 className="font-heading text-lg font-semibold">Your cart is empty</h3>
              <p className="font-body text-sm text-muted-foreground">
                Add some beautiful jewellery to get started!
              </p>
              <button
                onClick={() => { closeCart(); navigate("/shop"); }}
                className="mt-2 bg-gold text-primary-foreground px-8 py-3 rounded-sm font-body font-medium tracking-wide uppercase btn-glow transition-all hover:opacity-90"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {items.map(({ product, quantity, variantId, variantName }) => {
                const variant =
                  variantId && product.variants
                    ? product.variants.find((v) => v.id === variantId)
                    : null;
                const displayImage =
                  variant?.images?.[0] ||
                  product.images?.[0] ||
                  product.image ||
                  "/placeholder.jpg";
                const unitPrice = variant?.price ?? product.discountPrice ?? product.price;
                const stockLimit = variant?.stock ?? product.stock ?? 99;

                return (
                  <div
                    key={`${product.id}-${variantId || "base"}`}
                    className="flex gap-4 p-5 relative"
                  >
                    <img
                      src={displayImage}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg shadow-sm flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 pr-7">
                      <h4 className="font-heading text-sm font-medium leading-snug line-clamp-2">
                        {product.name}
                      </h4>
                      {variantName && (
                        <p className="text-[10px] font-bold text-gold uppercase tracking-wider mt-0.5">
                          Color: {variantName}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gold font-semibold">
                          ₹{unitPrice.toLocaleString("en-IN")}
                        </p>
                        {product.discountPrice && !variant?.price && (
                          <p className="text-xs text-muted-foreground line-through">
                            ₹{product.price.toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>

                      {/* Quantity selector */}
                      <div className="flex items-center mt-2.5 gap-0">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1, variantId)}
                          aria-label="Decrease quantity"
                          className="w-8 h-8 bg-muted border border-border rounded-l-md flex items-center justify-center hover:bg-border transition-colors"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-9 h-8 flex items-center justify-center text-sm font-medium border-y border-border">
                          {quantity}
                        </span>
                        <button
                          onClick={() => {
                            if (quantity < stockLimit) {
                              updateQuantity(product.id, quantity + 1, variantId);
                            } else {
                              toast.error(`Only ${stockLimit} items left in stock`);
                            }
                          }}
                          disabled={quantity >= stockLimit}
                          aria-label="Increase quantity"
                          className="w-8 h-8 bg-muted border border-border rounded-r-md flex items-center justify-center hover:bg-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(product.id, variantId)}
                      aria-label={`Remove ${product.name} from cart`}
                      className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-border bg-background flex-shrink-0 space-y-2">
            <div className="flex justify-between font-body text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span className="text-foreground font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between font-body text-sm text-muted-foreground">
              <span>Shipping</span>
              <span className={shipping === 0 ? "text-green-600 font-semibold" : "text-foreground font-medium"}>
                {shipping === 0 ? "FREE 🎉" : `₹${shipping}`}
              </span>
            </div>
            <div className="flex justify-between font-body font-semibold text-base pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-gold">₹{total.toLocaleString("en-IN")}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={placing}
              className="w-full bg-gold text-primary-foreground py-3.5 rounded-sm font-body font-medium tracking-wide uppercase btn-glow disabled:opacity-70 transition-all hover:opacity-90 mt-1 flex items-center justify-center gap-2"
            >
              {placing ? (
                <>
                  <span className="spinner" aria-hidden="true" /> Placing Order…
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Checkout Securely
                </>
              )}
            </button>

            {/* Conversion Optimization Badges */}
            <div className="flex flex-col items-center gap-2 pt-3 pb-1 text-[11px] font-body text-muted-foreground uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>Secure Razorpay Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
                <span>Free Shipping Above ₹999</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                <span>Easy Returns</span>
              </div>
            </div>

            <a
              href="https://wa.me/919529707370?text=Hi%20UJS%2C%20I%20need%20help%20with%20my%20cart"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs font-body text-[#25D366] hover:underline pt-1 pb-2"
            >
              💬 Need help? Chat on WhatsApp
            </a>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
