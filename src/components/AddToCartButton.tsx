import React, { useState, useRef } from "react";
import { ShoppingBag, Check } from "lucide-react";
import type { FirestoreProduct } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useCartToast } from "@/context/CartToastContext";
import { useFlyAnimation } from "@/context/FlyAnimationContext";

interface Props {
  product: FirestoreProduct;
  variantId?: string;
  variantName?: string;
  /** Unit price after applying variant/discount. Falls back to product price. */
  price?: number;
  className?: string;
  /** When true renders a compact icon-only button suitable for cards */
  compact?: boolean;
  /** Quantity to add. Defaults to 1 */
  quantity?: number;
}

type BtnStatus = "idle" | "loading" | "success";

const AddToCartButton: React.FC<Props> = ({
  product,
  variantId,
  variantName,
  price,
  className = "",
  compact = false,
  quantity = 1,
}) => {
  const { addToCart } = useCart();
  const { showCartToast } = useCartToast();
  const { triggerFlyAnimation } = useFlyAnimation();
  const [status, setStatus] = useState<BtnStatus>("idle");
  const btnRef = useRef<HTMLButtonElement>(null);

  const isOutOfStock = (() => {
    if (variantId && product.variants) {
      const v = product.variants.find((x) => x.id === variantId);
      if (v) return (v.stock ?? 0) <= 0;
    }
    return (product.stock ?? 0) <= 0;
  })();

  const handleClick = async () => {
    if (isOutOfStock || status === "loading") return;

    /* Tactile scale feedback via CSS class */
    btnRef.current?.classList.add("scale-95");
    setTimeout(() => btnRef.current?.classList.remove("scale-95"), 100);

    setStatus("loading");

    try {
      addToCart(product, quantity, variantId, variantName);
      setStatus("success");

      /* Trigger fly animation if image exists */
      const displayImage = variantId && product.variants 
        ? product.variants.find(v => v.id === variantId)?.images?.[0] || product.images?.[0] || product.image 
        : product.images?.[0] || product.image;
        
      if (btnRef.current && displayImage) {
        // We use the closest product image or the button itself as the source rect
        const cardElement = btnRef.current.closest('.group');
        const imgElement = cardElement?.querySelector('img');
        const sourceRect = (imgElement || btnRef.current).getBoundingClientRect();
        triggerFlyAnimation(displayImage, sourceRect);
      }

      /* Show premium toast */
      showCartToast(
        product,
        variantName,
        Number(price ?? product.discountPrice ?? product.price ?? 0)
      );

      setTimeout(() => setStatus("idle"), 1600);
    } catch {
      setStatus("idle");
    }
  };

  /* ── Background & label by state ── */
  const bg = isOutOfStock
    ? "bg-gray-200 cursor-not-allowed"
    : status === "loading"
    ? "bg-[#b8931f] cursor-wait"
    : status === "success"
    ? "bg-[#27ae60]"
    : "bg-gold hover:opacity-90 btn-glow";

  if (compact) {
    return (
      <button
        ref={btnRef}
        onClick={handleClick}
        disabled={isOutOfStock || status === "loading"}
        aria-label={isOutOfStock ? "Out of stock" : "Add to cart"}
        className={`
          flex items-center justify-center gap-2
          text-primary-foreground py-2.5 rounded-sm text-sm font-body font-medium
          tracking-wide uppercase transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${bg} ${className}
        `}
      >
        {status === "loading" ? (
          <span className="spinner" aria-hidden="true" />
        ) : status === "success" ? (
          <><Check size={15} /> Added!</>
        ) : (
          <><ShoppingBag size={15} /> {isOutOfStock ? "Out of Stock" : "Add to Cart"}</>
        )}
      </button>
    );
  }

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      disabled={isOutOfStock || status === "loading"}
      aria-label={isOutOfStock ? "Out of stock" : "Add to cart"}
      className={`
        w-full flex items-center justify-center gap-2
        text-primary-foreground py-3 px-6 rounded-sm text-sm font-body font-medium
        tracking-wide uppercase transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${bg} ${className}
      `}
    >
      {status === "loading" ? (
        <span className="spinner" aria-hidden="true" />
      ) : status === "success" ? (
        <>
          <Check size={16} />
          ✓ Added to Cart!
        </>
      ) : (
        <>
          <ShoppingBag size={16} />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </>
      )}
    </button>
  );
};

export default AddToCartButton;
