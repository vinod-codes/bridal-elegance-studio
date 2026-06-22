import React, { useState, useRef, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { FirestoreProduct } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useCartToast } from "@/context/CartToastContext";
import { useFlyAnimation } from "@/context/FlyAnimationContext";

interface Props {
  product: FirestoreProduct;
  isOpen: boolean;
  onClose: () => void;
  triggerRect: DOMRect | null;
  variantId?: string;
  variantName?: string;
  price?: number;
  image?: string;
}

const QuantityModal: React.FC<Props> = ({ product, isOpen, onClose, triggerRect, variantId, variantName, price, image }) => {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const { addToCart, openCart } = useCart();
  const { showCartToast } = useCartToast();
  const { triggerFlyAnimation } = useFlyAnimation();
  const imgRef = useRef<HTMLImageElement>(null);

  const displayPrice = price ?? product.discountPrice ?? product.price;
  const originalPrice = price ? null : (product.discountPrice ? product.price : null);
  const discount =
    originalPrice && product.discountPrice
      ? Math.round(((originalPrice - product.discountPrice) / originalPrice) * 100)
      : 0;

  const displayImage =
    image ||
    product.media?.[0]?.medium ||
    product.images?.[0] ||
    product.image ||
    "/placeholder.jpg";

  // Reset quantity when opened
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setAdding(false);
    }
  }, [isOpen]);

  const handleAdd = () => {
    if (adding) return;
    setAdding(true);
    
    // Play sequence: fly -> bounce -> toast -> drawer
    // 0ms: Add to cart state
    addToCart(product, quantity, variantId, variantName);

    // 300ms: Fly animation
    setTimeout(() => {
      const sourceRect = imgRef.current?.getBoundingClientRect() || triggerRect;
      if (sourceRect) {
        triggerFlyAnimation(displayImage, sourceRect);
      }
      onClose(); // Close modal here so fly animation is visible over the page
    }, 300);

    // 500ms: Cart bounce (handled by Header listening to totalItems change, 
    // but the state update already happened at 0ms. We'll add a trigger or just rely on the React state update delay. 
    // Actually, setting a global trigger for bounce is better, or Header reacts to `totalItems` changes.)
    
    // 700ms: Success Toast (Removed based on user feedback)
    
    // 1200ms: Cart drawer slides in
    setTimeout(() => {
      openCart();
    }, 1200);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-all data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-xl md:w-full bottom-0 md:bottom-auto translate-y-0 md:translate-y-[-50%] top-auto md:top-[50%] rounded-t-2xl md:rounded-2xl pb-8 md:pb-6">
          
          {/* Mobile handle */}
          <div className="mx-auto mt-[-10px] mb-2 h-1.5 w-12 rounded-full bg-muted md:hidden" />

          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Dialog.Close>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border shadow-sm">
              <img
                ref={imgRef}
                src={displayImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <Dialog.Title className="font-heading text-xl font-medium text-foreground">
                {product.name}
              </Dialog.Title>
              <div className="flex items-center justify-center gap-2">
                <span className="font-body font-semibold text-lg text-foreground">₹{displayPrice}</span>
                {originalPrice && (
                  <span className="font-body text-sm text-muted-foreground line-through">
                    ₹{originalPrice}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                    {discount}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Tags & Estimated Delivery */}
            <div className="flex flex-col items-center gap-2 w-full py-2 border-y border-border/40">
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                <span className="flex items-center gap-1"><span className="text-gold">✓</span> Anti Tarnish</span>
                <span className="flex items-center gap-1"><span className="text-gold">✓</span> Skin Friendly</span>
                <span className="flex items-center gap-1"><span className="text-gold">✓</span> Lightweight</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Estimated Delivery: <span className="font-medium text-foreground">3-7 Business Days</span>
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex flex-col items-center gap-2 w-full pt-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Select Quantity</span>
              <div className="flex items-center border border-border rounded-md h-12 w-32 justify-between">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors rounded-l-md"
                  disabled={adding}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                </button>
                <span className="flex-1 text-center font-medium font-body">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock ?? 99, q + 1))}
                  className="w-10 h-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors rounded-r-md disabled:opacity-30"
                  disabled={adding || (product.stock !== undefined && quantity >= product.stock)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                </button>
              </div>
              {product.stock !== undefined && product.stock > 0 && product.stock < 10 && (
                <p className="text-[11px] font-medium text-amber-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Only {product.stock} left in stock
                </p>
              )}
            </div>

            <button
              onClick={handleAdd}
              disabled={adding}
              className="w-full mt-4 bg-gold text-primary-foreground h-12 rounded-sm font-body font-medium tracking-wider uppercase btn-glow hover:opacity-90 transition-all flex items-center justify-center"
            >
              {adding ? (
                <span className="spinner w-5 h-5" />
              ) : (
                `ADD ${quantity} TO CART`
              )}
            </button>
            <button
              onClick={onClose}
              className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              Cancel
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default QuantityModal;
