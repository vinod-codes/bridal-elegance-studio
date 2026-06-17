import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Minus, Trash2, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { db } from "../config/firebase";
import { doc, onSnapshot } from "firebase/firestore";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliverySettings, setDeliverySettings] = useState({
    free_delivery_threshold: 999,
    force_free_delivery: false
  });

  useEffect(() => {
    const docRef = doc(db, "settings", "delivery");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDeliverySettings({
          free_delivery_threshold: data.free_delivery_threshold ?? 999,
          force_free_delivery: data.force_free_delivery ?? false
        });
      }
    }, (err) => {
      console.error("Failed to fetch delivery settings:", err);
    });

    return () => unsubscribe();
  }, []);

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
                  {items.map(({ product, quantity, variantId, variantName }) => {
                    // Find specific variant data for images and pricing
                    const variant = variantId && product.variants ? product.variants.find(v => v.id === variantId) : null;
                    const displayImage = variant?.images?.[0] || product.images?.[0] || product.image || "/placeholder.jpg";
                    const unitPrice = variant?.price ?? product.discountPrice ?? product.price;
                    const originalPrice = variant?.price ? null : (product.discountPrice ? product.price : null);
                    const stockLimit = variant?.stock ?? product.stock ?? 99;

                    return (
                      <div key={`${product.id}-${variantId || 'base'}`} className="flex flex-col sm:flex-row gap-6 pb-6 border-b border-border/50 last:border-0 last:pb-0">
                        <img src={displayImage} alt={product.name} className="w-24 h-24 object-cover rounded shadow-sm" />
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-heading text-lg font-medium">{product.name}</h4>
                              {variantName && (
                                <p className="text-xs font-bold text-gold uppercase tracking-wider mt-0.5">Color: {variantName}</p>
                              )}
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{product.description}</p>
                              {/* Show per-unit price with original if discounted */}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-semibold text-gold">₹{unitPrice} each</span>
                                {originalPrice && (
                                  <span className="text-xs text-muted-foreground line-through">₹{originalPrice}</span>
                                )}
                              </div>
                            </div>
                            <p className="text-lg text-gold font-semibold">₹{unitPrice * quantity}</p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3">
                              <button onClick={() => updateQuantity(product.id, quantity - 1, variantId)} className="p-1.5 border border-border rounded hover:bg-muted transition-colors">
                                <Minus size={14} />
                              </button>
                              <span className="text-base font-medium w-6 text-center">{quantity}</span>
                              <button 
                                onClick={() => {
                                  if (quantity < stockLimit) {
                                    updateQuantity(product.id, quantity + 1, variantId);
                                  } else {
                                    toast.error(`Only ${stockLimit} items left in stock`);
                                  }
                                }} 
                                disabled={quantity >= stockLimit}
                                className="p-1.5 border border-border rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button onClick={() => removeFromCart(product.id, variantId)} className="flex items-center text-sm text-muted-foreground hover:text-destructive transition-colors">
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
                    
                    <div className="flex justify-between text-muted-foreground">
                      <span>Estimated Delivery</span>
                      <span className="font-medium text-foreground">
                        {(() => {
                          if (deliverySettings.force_free_delivery) return <span className="text-green-600 font-semibold text-xs tracking-wider uppercase">Complimentary</span>;
                          
                          let globalItemsSubtotal = 0;
                          let maxCustomDeliveryCharge = 0;

                          items.forEach(i => {
                            const product = i.product;
                            let unitPrice = product.discountPrice ?? product.price;
                            if (i.variantId && product.variants) {
                              const variant = product.variants.find(v => v.id === i.variantId);
                              if (variant?.price !== undefined) unitPrice = variant.price;
                            }
                            const itemTotal = unitPrice * i.quantity;

                            const deliveryConfig = product.deliveryConfig || { useGlobalDelivery: true, customDeliveryCharge: 0, freeDelivery: false };
                            if (deliveryConfig.freeDelivery) {
                              // no charge
                            } else if (!deliveryConfig.useGlobalDelivery) {
                              const customCharge = Number(deliveryConfig.customDeliveryCharge || 0);
                              if (customCharge > maxCustomDeliveryCharge) maxCustomDeliveryCharge = customCharge;
                            } else {
                              globalItemsSubtotal += itemTotal;
                            }
                          });

                          let globalDeliveryContribution = 0;
                          if (globalItemsSubtotal > 0 && globalItemsSubtotal < deliverySettings.free_delivery_threshold) {
                              globalDeliveryContribution = 50; // Default estimate
                          }
                          
                          let finalDeliveryCharge = Math.max(globalDeliveryContribution, maxCustomDeliveryCharge);
                          
                          if (finalDeliveryCharge === 0) {
                            return <span className="text-green-600 font-semibold text-xs tracking-wider uppercase">Complimentary</span>;
                          }
                          return `₹${finalDeliveryCharge}`;
                        })()}
                      </span>
                    </div>

                    {(() => {
                        let globalItemsSubtotal = 0;
                        items.forEach(i => {
                          const product = i.product;
                          let unitPrice = product.discountPrice ?? product.price;
                          if (i.variantId && product.variants) {
                            const variant = product.variants.find(v => v.id === i.variantId);
                            if (variant?.price !== undefined) unitPrice = variant.price;
                          }
                          const deliveryConfig = product.deliveryConfig || { useGlobalDelivery: true, customDeliveryCharge: 0, freeDelivery: false };
                          if (!deliveryConfig.freeDelivery && deliveryConfig.useGlobalDelivery) {
                            globalItemsSubtotal += (unitPrice * i.quantity);
                          }
                        });

                        if (!deliverySettings.force_free_delivery && globalItemsSubtotal > 0 && globalItemsSubtotal < deliverySettings.free_delivery_threshold) {
                          return (
                            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded text-center">
                              Add ₹{deliverySettings.free_delivery_threshold - globalItemsSubtotal} more in eligible items for complimentary shipping!
                            </p>
                          );
                        }
                        return null;
                    })()}
                  </div>
                  <div className="border-t border-border/50 pt-4 mb-6">
                    <div className="flex justify-between font-heading text-lg font-semibold">
                      <span>Estimated Total</span>
                      <span className="text-gold">
                        {(() => {
                           let globalItemsSubtotal = 0;
                           let maxCustomDeliveryCharge = 0;
 
                           items.forEach(i => {
                             const product = i.product;
                             let unitPrice = product.discountPrice ?? product.price;
                             if (i.variantId && product.variants) {
                               const variant = product.variants.find(v => v.id === i.variantId);
                               if (variant?.price !== undefined) unitPrice = variant.price;
                             }
                             const itemTotal = unitPrice * i.quantity;
 
                             const deliveryConfig = product.deliveryConfig || { useGlobalDelivery: true, customDeliveryCharge: 0, freeDelivery: false };
                             if (deliveryConfig.freeDelivery) {
                               // no charge
                             } else if (!deliveryConfig.useGlobalDelivery) {
                               const customCharge = Number(deliveryConfig.customDeliveryCharge || 0);
                               if (customCharge > maxCustomDeliveryCharge) maxCustomDeliveryCharge = customCharge;
                             } else {
                               globalItemsSubtotal += itemTotal;
                             }
                           });
 
                           let globalDeliveryContribution = 0;
                           if (!deliverySettings.force_free_delivery && globalItemsSubtotal > 0 && globalItemsSubtotal < deliverySettings.free_delivery_threshold) {
                               globalDeliveryContribution = 50; // Default estimate
                           }
                           
                           let finalDeliveryCharge = Math.max(globalDeliveryContribution, maxCustomDeliveryCharge);
                           if (deliverySettings.force_free_delivery) finalDeliveryCharge = 0;

                           return `₹${totalPrice + finalDeliveryCharge}`;
                        })()}
                      </span>
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
