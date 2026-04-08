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
    if (!user) {
      closeCart();
      toast.error("Please sign in to place an order");
      navigate("/auth");
      return;
    }

    if (totalPrice <= 0) {
      toast.error("Your cart is empty");
      return;
    }

    setPlacing(true);
    try {
      // 1. Create order on backend
      const { data: order } = await axios.post("/api/create-order", {
        amount: totalPrice,
        currency: "INR",
        receipt: `order_rcpt_${Date.now()}`,
      });

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_Sb16AhWMZG3LSJ",
        amount: order.amount,
        currency: order.currency,
        name: "Unique Jewelry Studio",
        description: "Studio Order Payment",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // 3. Save order to Firestore FIRST (critical — user has create permission)
            await addDoc(collection(db, "orders"), {
              userId: user.uid,
              userEmail: user.email,
              userName: profile?.name || user.displayName || user.email,
              items: items.map(({ product, quantity }) => ({
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || product.image,
                quantity,
              })),
              totalAmount: totalPrice,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              status: "paid",
              createdAt: serverTimestamp(),
            });

            // 4. Update stock in Firestore (best-effort — don't block order on failure)
            try {
              const batch = writeBatch(db);
              items.forEach((item) => {
                const productRef = doc(db, "products", item.product.id);
                batch.update(productRef, {
                  stock: increment(-item.quantity),
                });
              });
              await batch.commit();
            } catch (stockErr) {
              console.warn("Stock update failed (order was saved successfully):", stockErr);
              // Stock will be reconciled by admin — order is already recorded
            }

            clearCart();
            closeCart();
            toast.success("✨ Payment successful! Order placed.", {
              action: { label: "My Orders", onClick: () => navigate("/orders") },
            });
          } catch (err) {
            console.error("Failed to save order after payment:", err);
            toast.error("Payment was successful but we failed to record your order. Please contact support with Payment ID: " + response.razorpay_payment_id);
          } finally {
            setPlacing(false);
          }
        },
        prefill: {
          name: profile?.name || user.displayName || "",
          email: user.email || "",
        },
        theme: {
          color: "#D4AF37",
        },
        modal: {
          ondismiss: function() {
            setPlacing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Order initiation failed:", error);
      toast.error("Failed to initiate payment: " + (error.response?.data?.error || error.message));
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
              {items.map(({ product, quantity }) => {
                const displayImage = product.images?.[0] || product.image || "/placeholder.jpg";
                return (
                  <div key={product.id} className="flex gap-4 pb-4 border-b border-border/50">
                    <img src={displayImage} alt={product.name} className="w-20 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <h4 className="font-heading text-sm font-medium">{product.name}</h4>
                      <p className="text-sm text-gold font-medium mt-1">₹{product.price}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(product.id, quantity - 1)} className="p-1 border border-border rounded hover:bg-muted">
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{quantity}</span>
                        <button 
                          onClick={() => {
                            const stockLimit = product.stock ?? 99;
                            if (quantity < stockLimit) {
                              updateQuantity(product.id, quantity + 1);
                            } else {
                              toast.error(`Only ${stockLimit} items left in stock`);
                            }
                          }} 
                          disabled={quantity >= (product.stock ?? 99)}
                          className="p-1 border border-border rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus size={14} />
                        </button>
                        <button onClick={() => removeFromCart(product.id)} className="ml-auto p-1 text-muted-foreground hover:text-destructive">
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
