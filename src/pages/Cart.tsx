import { Link, useNavigate } from "react-router-dom";
import { Plus, Minus, Trash2, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleProceedToCheckout = () => {
    if (!user) {
      toast.error("Please sign in to proceed to checkout");
      navigate("/auth");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-semibold">Your Cart</h1>
            <Link to="/shop" className="inline-flex items-center text-sm text-muted-foreground hover:text-gold mt-2 transition-colors">
              <ArrowLeft size={16} className="mr-2" /> Continue Shopping
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-lg p-12 shadow-sm text-center">
              <p className="text-xl text-muted-foreground font-body mb-6">Your cart is empty</p>
              <Link to="/shop" className="bg-gold text-white px-8 py-3 rounded-sm font-medium tracking-wide uppercase hover:bg-gold/90 transition-colors">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
                <div className="space-y-6">
                  {items.map(({ product, quantity }) => {
                    const displayImage = product.images?.[0] || product.image || "/placeholder.jpg";
                    return (
                      <div key={product.id} className="flex flex-col sm:flex-row gap-6 pb-6 border-b border-border/50 last:border-0 last:pb-0">
                        <img src={displayImage} alt={product.name} className="w-24 h-24 object-cover rounded shadow-sm" />
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-heading text-lg font-medium">{product.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{product.description}</p>
                            </div>
                            <p className="text-lg text-gold font-semibold">₹{product.price * quantity}</p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3">
                              <button onClick={() => updateQuantity(product.id, quantity - 1)} className="p-1.5 border border-border rounded hover:bg-muted transition-colors">
                                <Minus size={14} />
                              </button>
                              <span className="text-base font-medium w-6 text-center">{quantity}</span>
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
                                className="p-1.5 border border-border rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button onClick={() => removeFromCart(product.id)} className="flex items-center text-sm text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 size={16} className="mr-1" /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="lg:w-80">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                  <h3 className="text-xl font-heading font-semibold mb-4 border-b border-border/50 pb-4">Order Summary</h3>
                  <div className="space-y-3 mb-6 font-body">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-medium text-foreground">₹{totalPrice}</span>
                    </div>
                    {totalPrice < 999 && (
                      <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded text-center">
                        Add ₹{999 - totalPrice} more for free shipping!
                      </p>
                    )}
                  </div>
                  <div className="border-t border-border/50 pt-4 mb-6">
                    <div className="flex justify-between font-heading text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-gold">₹{totalPrice}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-gold text-primary-foreground py-3.5 rounded-sm font-body font-medium tracking-wide uppercase btn-glow hover:bg-gold/90 transition-all"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
