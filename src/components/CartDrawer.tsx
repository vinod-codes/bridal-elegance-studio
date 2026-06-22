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
    if (!user) {
      closeCart();
      navigate("/auth", { state: { redirectTo: "/checkout" } });
      return;
    }
    closeCart();
    navigate("/cart");
  }, [closeCart, navigate, user]);

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
                  product.media?.[0]?.thumbnail ||
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
              className={`w-full py-3.5 rounded-sm font-body font-medium tracking-wide uppercase disabled:opacity-70 transition-all hover:opacity-90 mt-1 flex items-center justify-center gap-2 ${
                user
                  ? "bg-gold text-primary-foreground btn-glow"
                  : "bg-stone-800 text-white hover:bg-stone-700"
              }`}
            >
              {placing ? (
                <>
                  <span className="spinner" aria-hidden="true" /> Loading…
                </>
              ) : user ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  View Cart
                </>
              ) : (
                <>
                  <span>🔒</span> Login To Purchase
                </>
              )}
            </button>
            {!user && (
              <p className="text-[11px] text-center text-muted-foreground mt-1.5">
                Please login to continue your purchase securely.
              </p>
            )}

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
              href="https://wa.me/919529707370?text=Hi%20UJS%2C%20I%20need%20help%20with%20my%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs font-body text-stone-500 hover:text-stone-800 transition-colors pt-2 pb-2"
            >
              <span className="block font-medium mb-0.5">Need Assistance?</span>
              <span className="flex items-center justify-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[#25D366]"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                Chat with our Jewelry Expert
              </span>
            </a>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
