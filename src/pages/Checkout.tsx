import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, MapPin, Truck, MapPinOff, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "../config/firebase";
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, updateDoc, increment, writeBatch, getDoc, onSnapshot } from "firebase/firestore";
import axios from "axios";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Address {
  id: string;
  full_name: string;
  phone_number: string;
  street_address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: "",
    phone_number: "",
    street_address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India"
  });

  const [shippingInfo, setShippingInfo] = useState<{
    serviceable: boolean;
    delivery_charge: number;
    estimated_days: number;
  }>({
    serviceable: true,
    delivery_charge: 50,
    estimated_days: 5
  });

  const [deliverySettings, setDeliverySettings] = useState({
    default_delivery_charge: 50,
    free_delivery_threshold: 999,
    force_free_delivery: false
  });

  useEffect(() => {
    const docRef = doc(db, "settings", "delivery");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDeliverySettings({
          default_delivery_charge: data.default_delivery_charge ?? 50,
          free_delivery_threshold: data.free_delivery_threshold ?? 999,
          force_free_delivery: data.force_free_delivery ?? false
        });
        setShippingInfo(prev => ({ ...prev, delivery_charge: data.default_delivery_charge ?? 50 }));
      }
    }, (err) => {
      console.error("Failed to fetch delivery settings:", err);
    });

    return () => unsubscribe();
  }, []);

  const [isValidatingPincode, setIsValidatingPincode] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch Addresses
  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchAddresses = async () => {
      try {
        const q = query(collection(db, "addresses"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        const fetchedAddresses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Address[];

        setAddresses(fetchedAddresses);
        if (fetchedAddresses.length > 0) {
          // Pre-select first address safely
          setSelectedAddressId(fetchedAddresses[0].id);
          validatePincode(fetchedAddresses[0].pincode);
        } else {
          setShowAddForm(true);
        }
      } catch (err) {
        console.error("Failed to fetch addresses", err);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [user, navigate]);

  // Handle Pincode Validation via Firestore
  const validatePincode = async (city: string) => {
    // Standardizing delivery charges for all locations
    setShippingInfo(prev => ({ 
      ...prev,
      serviceable: true, 
      estimated_days: 5
    }));
  };

  const [orderFor, setOrderFor] = useState<'self' | 'gift'>('self');
  const [giftDetails, setGiftDetails] = useState({
    recipient_name: "",
    message: ""
  });

  const handleCityChange = (city: string) => {
    setNewAddress({ ...newAddress, city });
  };

  const handleSelectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setShowAddForm(false);
    validatePincode(addr.city);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const addressData = {
        ...newAddress,
        userId: user!.uid,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, "addresses"), addressData);
      const added = { id: docRef.id, ...newAddress };
      setAddresses([...addresses, added]);
      setSelectedAddressId(added.id);
      setShowAddForm(false);
      setNewAddress({ full_name: "", phone_number: "", street_address: "", city: "", state: "", pincode: "", country: "India" });
      toast.success("Address saved!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save address");
    }
  };

  const handleCheckout = async () => {
    if (!user) return;

    if (!selectedAddressId) {
      toast.error("Please select a delivery address.");
      return;
    }

    setIsPlacingOrder(true);
    try {
      // Calculate final amount - smart shipping
      const shippingCharge = (deliverySettings.force_free_delivery || totalPrice >= deliverySettings.free_delivery_threshold) ? 0 : (shippingInfo.delivery_charge || 0);
      const finalAmount = totalPrice + shippingCharge;

      const selectedAddress = addresses.find(a => a.id === selectedAddressId);
      const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!RAZORPAY_KEY) {
        throw new Error("Razorpay Key ID is not configured.");
      }

      const options = {
        key: RAZORPAY_KEY,
        amount: Math.round(finalAmount * 100),
        currency: "INR",
        name: "Bridal Elegance Studio",
        description: "Exquisite Bridal Jewelry Purchase",
        image: "/logo.png",
        handler: async function (response: any) {
          try {
            // After successful payment, save order to Firestore
            const orderRef = await addDoc(collection(db, "orders"), {
              userId: user.uid,
              userEmail: user.email,
              userName: selectedAddress?.full_name || user.displayName || user.email,
              customerPhone: selectedAddress?.phone_number || "",
              fullAddress: `${selectedAddress?.street_address}, ${selectedAddress?.city}, ${selectedAddress?.state} - ${selectedAddress?.pincode}, ${selectedAddress?.country}`,
              city: selectedAddress?.city || "",
              pincode: selectedAddress?.pincode || "",
              country: selectedAddress?.country || "India",
              orderFor: orderFor,
              recipientName: orderFor === 'gift' ? giftDetails.recipient_name : "",
              giftMessage: orderFor === 'gift' ? giftDetails.message : "",
              items: items.map(({ product, quantity }) => ({
                productId: product.id,
                name: product.name,
                price: product.discountPrice ?? product.price,
                originalPrice: product.price,
                image: product.images?.[0] || product.image,
                quantity,
              })),
              totalAmount: finalAmount,
              shippingCharge,
              status: "pending", // Start with pending, updated by admin
              paymentId: response.razorpay_payment_id,
              paymentMethod: "Razorpay",
              createdAt: serverTimestamp(),
            });

            // Stock update logic
            const batch = writeBatch(db);
            items.forEach((item) => {
              const productRef = doc(db, "products", item.product.id);
              batch.update(productRef, {
                stock: increment(-item.quantity),
              });
            });
            await batch.commit();

            clearCart();
            toast.success("✨ Payment successful!");
            navigate(`/order-success/${orderRef.id}`);
          } catch (err) {
            console.error("Firestore post-payment error:", err);
            toast.error("Payment successful but failed to save order. Please contact support.");
          }
        },
        prefill: {
          name: selectedAddress?.full_name || user.displayName || "",
          email: user.email || "",
          contact: selectedAddress?.phone_number || "",
        },
        theme: {
          color: "#D4AF37",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error("Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (error: any) {
      console.error("Razorpay initiation failed:", error);
      toast.error("Failed to initiate payment: " + error.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };
   
  const finalDeliveryCharge = shippingInfo?.serviceable 
    ? (deliverySettings.force_free_delivery || totalPrice >= deliverySettings.free_delivery_threshold ? 0 : shippingInfo.delivery_charge || 0) 
    : 0;
  const finalTotal = totalPrice + finalDeliveryCharge;

  if (loading || (user && isLoadingAddresses)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="animate-spin text-gold" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <button 
            onClick={() => navigate("/cart")}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to Cart
          </button>
          
          <h1 className="text-3xl font-heading font-semibold mb-8">Checkout</h1>

          {items.length === 0 ? (
            <div className="bg-white rounded-lg p-12 shadow-sm text-center">
              <p className="text-xl text-muted-foreground mb-4">Your cart is empty.</p>
              <button 
                onClick={() => navigate("/shop")}
                className="bg-gold text-white px-8 py-3 rounded-sm font-medium tracking-wide uppercase"
              >
                Go to Shop
              </button>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column - Addresses */}
              <div className="flex-1 space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-4">
                    <MapPin className="text-gold" size={24} />
                    <h2 className="text-xl font-heading font-semibold">Delivery Address</h2>
                  </div>

                  {isLoadingAddresses ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-24 bg-muted rounded"></div>
                      <div className="h-24 bg-muted rounded"></div>
                    </div>
                  ) : (
                    <>
                      {addresses.length > 0 && !showAddForm && (
                        <div className="space-y-4 mb-6">
                          {addresses.map((addr) => (
                            <div 
                              key={addr.id}
                              onClick={() => handleSelectAddress(addr)}
                              className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-gold bg-gold/5 ring-1 ring-gold' : 'border-border hover:border-gold/50'}`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-foreground mb-1 flex items-center gap-2">
                                    {addr.full_name}
                                    {selectedAddressId === addr.id && <span className="bg-gold text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Selected</span>}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{addr.street_address}</p>
                                  <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}, {addr.country}</p>
                                  <p className="text-sm text-muted-foreground mt-1">Phone: {addr.phone_number}</p>
                                </div>
                                {selectedAddressId === addr.id && <Check className="text-gold" size={20} />}
                              </div>
                            </div>
                          ))}
                          <button 
                            onClick={() => { setShowAddForm(true); setShippingInfo(null); }}
                            className="text-gold font-medium text-sm hover:underline mt-2 inline-block"
                          >
                            + Add New Address
                          </button>
                        </div>
                      )}

                      {(showAddForm || addresses.length === 0) && (
                        <form onSubmit={handleSaveAddress} className="space-y-4 bg-stone-50/50 p-4 border border-border rounded-lg">
                          <h3 className="font-medium mb-2">{addresses.length === 0 ? "Add your first address" : "New Address"}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Full Name</label>
                              <input 
                                required
                                value={newAddress.full_name}
                                onChange={(e) => setNewAddress({...newAddress, full_name: e.target.value})}
                                type="text" className="w-full p-2.5 border border-border rounded-md focus:border-gold outline-none text-sm" placeholder="John Doe" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Phone Number</label>
                              <input 
                                required
                                value={newAddress.phone_number}
                                onChange={(e) => setNewAddress({...newAddress, phone_number: e.target.value})}
                                type="tel" className="w-full p-2.5 border border-border rounded-md focus:border-gold outline-none text-sm" placeholder="10-digit mobile number" 
                              />
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-2">
                              <label className="text-sm font-medium">Street Address</label>
                              <input 
                                required
                                value={newAddress.street_address}
                                onChange={(e) => setNewAddress({...newAddress, street_address: e.target.value})}
                                type="text" className="w-full p-2.5 border border-border rounded-md focus:border-gold outline-none text-sm" placeholder="Area, layout, street name" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">City</label>
                              <input 
                                required
                                value={newAddress.city}
                                onChange={(e) => handleCityChange(e.target.value)}
                                type="text" className="w-full p-2.5 border border-border rounded-md focus:border-gold outline-none text-sm" placeholder="City" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">State</label>
                              <input 
                                required
                                value={newAddress.state}
                                onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                                type="text" className="w-full p-2.5 border border-border rounded-md focus:border-gold outline-none text-sm" placeholder="State" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Pincode</label>
                              <input 
                                required
                                value={newAddress.pincode}
                                onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value.slice(0, 6)})}
                                maxLength={6}
                                type="text" className="w-full p-2.5 border border-border rounded-md focus:border-gold outline-none text-sm tracking-widest" placeholder="6 digits" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Country</label>
                              <input 
                                required
                                value={newAddress.country}
                                onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                                type="text" className="w-full p-2.5 border border-border rounded-md focus:border-gold outline-none text-sm" placeholder="India" 
                              />
                            </div>
                          </div>



                          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                            {addresses.length > 0 && (
                              <button 
                                type="button" 
                                onClick={() => {
                                  setShowAddForm(false);
                                  const sel = addresses.find(a => a.id === selectedAddressId);
                                  if (sel) validatePincode(sel.city);
                                }}
                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                            <button 
                              type="submit"
                              className="bg-gold text-white px-6 py-2 rounded-md font-medium text-sm hover:bg-gold/90 transition-colors"
                            >
                              Save & Select
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                </div>

                {/* Gift Selection */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                   <div className="flex items-center gap-2 mb-4">
                     <h2 className="text-xl font-heading font-semibold">Order Customization</h2>
                   </div>
                   <div className="space-y-4">
                     <div>
                       <label className="text-sm font-medium flex items-center gap-2 mb-2">
                         <input 
                           type="radio" 
                           checked={orderFor === 'self'} 
                           onChange={() => setOrderFor('self')} 
                           className="text-gold focus:ring-gold"
                         />
                         For Myself
                       </label>
                       <label className="text-sm font-medium flex items-center gap-2">
                         <input 
                           type="radio" 
                           checked={orderFor === 'gift'} 
                           onChange={() => setOrderFor('gift')} 
                           className="text-gold focus:ring-gold"
                         />
                         Send as a Gift
                       </label>
                     </div>

                     {orderFor === 'gift' && (
                        <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                          <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Recipient Name</label>
                            <input 
                              type="text" 
                              value={giftDetails.recipient_name}
                              onChange={(e) => setGiftDetails({...giftDetails, recipient_name: e.target.value})}
                              placeholder="Who is this gift for?"
                              className="w-full p-2.5 border border-border rounded-md focus:border-gold outline-none text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Gift Message (Optional)</label>
                            <textarea 
                              value={giftDetails.message}
                              onChange={(e) => setGiftDetails({...giftDetails, message: e.target.value})}
                              placeholder="Add a sweet message..."
                              rows={3}
                              className="w-full p-2.5 border border-border rounded-md focus:border-gold outline-none text-sm resize-none"
                            />
                          </div>
                        </div>
                     )}
                   </div>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:w-96">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                  <h3 className="text-xl font-heading font-semibold mb-6 border-b border-border/50 pb-4">Order Summary</h3>
                  
                  <div className="space-y-4 mb-6 max-h-[30vh] overflow-y-auto pr-2">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-4 items-center">
                        <img src={item.product.images?.[0] || item.product.image || "/placeholder.jpg"} className="w-16 h-16 object-cover rounded opacity-90" alt="" />
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium font-heading">₹{(item.product.discountPrice ?? item.product.price) * item.quantity}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 font-body text-sm border-t border-border/50 pt-4">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-medium text-foreground">₹{totalPrice}</span>
                    </div>
                    
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery Charge</span>
                      <span className="font-medium text-foreground">
                        {!selectedAddressId ? (
                          "—"
                        ) : (
                          (deliverySettings.force_free_delivery || totalPrice >= deliverySettings.free_delivery_threshold) ? <span className="text-green-600 font-semibold text-xs tracking-wider uppercase">Free</span> : `₹${shippingInfo.delivery_charge}`
                        )}
                      </span>
                    </div>

                    {orderFor === 'gift' && (
                       <div className="flex justify-between items-center text-gold text-xs font-medium py-1 px-2 bg-gold/5 rounded">
                         <span>✨ Gift Order</span>
                         <span className="text-[10px] uppercase font-bold tracking-tighter">Selected</span>
                       </div>
                    )}
                  </div>

                  <div className="border-t border-border/50 pt-4 mt-4 mb-6">
                    <div className="flex justify-between font-heading text-xl font-semibold">
                      <span>Total</span>
                      <span className="text-gold">₹{finalTotal}</span>
                    </div>
                  </div>



                  <button
                    onClick={handleCheckout}
                    disabled={isPlacingOrder || !selectedAddressId || showAddForm}
                    className="w-full bg-gold text-white py-3.5 rounded-sm font-body font-medium tracking-wide uppercase btn-glow hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {isPlacingOrder ? "Placing Order..." : "Place Order"}
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

export default Checkout;
