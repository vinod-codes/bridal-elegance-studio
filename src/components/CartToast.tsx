import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, ShoppingBag, CreditCard } from "lucide-react";
import { useCartToast, type CartToastItem } from "@/context/CartToastContext";
import { useCart } from "@/context/CartContext";

/* ── Individual Toast ──────────────────────────────────── */
const SingleCartToast: React.FC<{
  toast: CartToastItem;
  onRemove: (id: number) => void;
  isMobile: boolean;
}> = ({ toast, onRemove, isMobile }) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const isHovered = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const { toggleCart } = useCart();

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 320);
  }, [onRemove, toast.id]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!isHovered.current) dismiss();
    }, 4000);
  }, [dismiss]);

  useEffect(() => {
    // Trigger enter animation
    const raf = requestAnimationFrame(() => setVisible(true));
    startTimer();
    return () => {
      cancelAnimationFrame(raf);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMouseEnter = () => {
    isHovered.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
  };
  const handleMouseLeave = () => {
    isHovered.current = false;
    startTimer();
  };

  const handleViewCart = () => {
    dismiss();
    setTimeout(() => toggleCart(), 160);
  };

  const handleCheckout = () => {
    dismiss();
    setTimeout(() => navigate("/checkout"), 160);
  };

  const productImage =
    toast.product.media?.[0]?.medium ||
    toast.product.images?.[0] ||
    toast.product.image ||
    "/placeholder.jpg";

  /* ── Dynamic animation classes ── */
  const enterClass = isMobile ? "slideInUp" : "slideInRight";
  const exitClass  = isMobile ? "slideOutDown" : "slideOutRight";

  const toastStyle: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #e8d8a0",
    borderRadius: "14px",
    padding: "16px 18px",
    maxWidth: isMobile ? "none" : "380px",
    width: isMobile ? "calc(100vw - 32px)" : undefined,
    boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
    pointerEvents: "auto",
    fontFamily: "system-ui, -apple-system, sans-serif",
    animation: `${exiting ? exitClass : (visible ? enterClass : "none")} ${exiting ? "300ms" : "420ms"} cubic-bezier(0.16, 1, 0.3, 1) forwards`,
    opacity: visible ? undefined : 0,
    willChange: "transform, opacity",
  };

  return (
    <div
      style={toastStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="status"
      aria-live="polite"
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <span style={{ fontSize: "17px" }}>🎉</span>
        <span style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a", flex: 1 }}>
          Added to Cart!
        </span>
        <button
          onClick={dismiss}
          aria-label="Close notification"
          style={{
            background: "none", border: "none", fontSize: "20px",
            color: "#aaa", cursor: "pointer", lineHeight: 1, padding: 0,
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Product info */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
        <img
          src={productImage}
          alt={toast.product.name}
          style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: "0 0 3px", fontSize: 14, fontWeight: 600, color: "#1a1a1a",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {toast.product.name}
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
            <span style={{ fontSize: 13, color: "#666" }}>Quantity: {toast.quantity}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#d4af37" }}>
              Subtotal: ₹{(toast.price * toast.quantity).toLocaleString("en-IN")}
            </span>
          </div>
          {toast.variantName && (
            <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
              Color: {toast.variantName}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={handleViewCart}
          style={{
            flex: 1, background: "transparent", border: "1.5px solid #d4af37",
            color: "#d4af37", padding: "9px 14px", borderRadius: 7,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            transition: "all 180ms",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#d4af37";
            (e.currentTarget as HTMLButtonElement).style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "#d4af37";
          }}
        >
          <ShoppingBag size={13} /> View Cart
        </button>
        <button
          onClick={handleCheckout}
          style={{
            flex: 1, background: "#d4af37", border: "none",
            color: "#fff", padding: "9px 14px", borderRadius: 7,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            transition: "background 180ms",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#b8931f"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#d4af37"; }}
        >
          <CreditCard size={13} /> Checkout
        </button>
      </div>
    </div>
  );
};

/* ── Toast Container ───────────────────────────────────── */
const CartToastContainer: React.FC = () => {
  return null;
};

export default CartToastContainer;
