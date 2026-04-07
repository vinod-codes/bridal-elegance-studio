import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

const CartSidebar = () => {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!user) {
      closeCart();
      toast.error("Please sign in to place an order");
      navigate("/auth");
      return;
    }

    setPlacing(true);
    try {
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        userEmail: user.email,
        userName: profile?.name || user.displayName || user.email,
        items: items.map(({ product, quantity }) => ({
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        })),
        totalAmount: totalPrice,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      clearCart();
      closeCart();
      toast.success("🎉 Order placed! View your order history.", {
        action: { label: "My Orders", onClick: () => navigate("/orders") },
      });
    } catch (error: unknown) {
      console.error("Order placement failed:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
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
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4 pb-4 border-b border-border/50">
                  <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <h4 className="font-heading text-sm font-medium">{product.name}</h4>
                    <p className="text-sm text-gold font-medium mt-1">₹{product.price}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(product.id, quantity - 1)} className="p-1 border border-border rounded hover:bg-muted">
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1)} className="p-1 border border-border rounded hover:bg-muted">
                        <Plus size={14} />
                      </button>
                      <button onClick={() => removeFromCart(product.id)} className="ml-auto p-1 text-muted-foreground hover:text-destructive">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-border space-y-4">
              <div className="flex justify-between font-body">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">₹{totalPrice}</span>
              </div>
              {totalPrice < 999 && (
                <p className="text-xs text-muted-foreground text-center">
                  Add ₹{999 - totalPrice} more for free shipping!
                </p>
              )}
              <button
                onClick={handleCheckout}
                disabled={placing}
                className="w-full bg-gold text-primary-foreground py-3 rounded-sm font-body font-medium tracking-wide uppercase btn-glow disabled:opacity-70"
              >
                {placing ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
