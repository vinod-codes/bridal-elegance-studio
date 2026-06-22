import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "../config/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, writeBatch } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import axios from "axios";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CartSidebar = () => {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCheckout = async () => {
    if (totalPrice <= 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!user) {
      closeCart();
      navigate("/auth", { state: { redirectTo: "/checkout" } });
      return;
    }
    closeCart();
    navigate("/checkout");
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-foreground/30 z-[60]" onClick={closeCart} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-background z-[60] shadow-2xl animate-slide-in-right flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-heading text-2xl font-semibold">Your Cart</h2>
          <button onClick={closeCart} className="p-1 text-muted-foreground hover:text-foreground">
            <X size={24} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground font-body">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.map(({ product, quantity, variantId, variantName }) => {
                const variant = variantId && product.variants ? product.variants.find(v => v.id === variantId) : null;
                const displayImage =
                  variant?.images?.[0] ||
                  product.media?.[0]?.small ||
                  product.images?.[0] ||
                  product.image ||
                  "/placeholder.jpg";
                const unitPrice = variant?.price ?? product.discountPrice ?? product.price;
                const stockLimit = variant?.stock ?? product.stock ?? 99;

                return (
                  <div key={`${product.id}-${variantId || 'base'}`} className="flex gap-4 pb-4 border-b border-border/50">
                    <img src={displayImage} alt={product.name} className="w-20 h-20 object-cover rounded shadow-sm" />
                    <div className="flex-1">
                      <h4 className="font-heading text-sm font-medium">{product.name}</h4>
                      {variantName && (
                        <p className="text-[10px] font-bold text-gold uppercase tracking-wider mt-0.5">Color: {variantName}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gold font-medium">₹{unitPrice}</p>
                        {product.discountPrice && !variant?.price && <p className="text-xs text-muted-foreground line-through">₹{product.price}</p>}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(product.id, quantity - 1, variantId)} className="p-1 border border-border rounded hover:bg-muted transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{quantity}</span>
                        <button 
                          onClick={() => {
                            if (quantity < stockLimit) {
                              updateQuantity(product.id, quantity + 1, variantId);
                            } else {
                              toast.error(`Only ${stockLimit} items left in stock`);
                            }
                          }} 
                          disabled={quantity >= stockLimit}
                          className="p-1 border border-border rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                        <button onClick={() => removeFromCart(product.id, variantId)} className="ml-auto p-1 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-6 border-t border-border space-y-4">
              <div className="flex justify-between font-body">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">₹{totalPrice}</span>
              </div>
              {totalPrice < 999 && (
                <p className="text-xs text-muted-foreground text-center">
                  Add ₹{999 - totalPrice} more for complimentary shipping!
                </p>
              )}
              <button
                onClick={handleCheckout}
                disabled={placing}
                className={`w-full py-3 rounded-sm font-body font-medium tracking-wide uppercase btn-glow disabled:opacity-70 flex items-center justify-center gap-2 ${
                  user
                    ? "bg-gold text-primary-foreground"
                    : "bg-stone-800 text-white hover:bg-stone-700"
                }`}
              >
                {user ? "Proceed to Checkout" : (
                  <><span>🔒</span> Login To Purchase</>
                )}
              </button>
              {!user && (
                <p className="text-xs text-center text-muted-foreground mt-1.5">
                  Please login to continue your purchase securely.
                </p>
              )}
              
              <div className="pt-2 text-center">
                <a 
                  href="https://wa.me/919529707370" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-muted-foreground hover:text-gold transition-colors inline-flex items-center gap-1.5"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Need Assistance? Chat with our Jewelry Expert
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
