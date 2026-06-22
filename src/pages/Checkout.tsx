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
import SEO from "@/components/SEO";
import { trackBeginCheckout, trackPurchase, trackAddPaymentInfo, trackAddShippingInfo } from "@/lib/analytics";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Address {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  street_address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

const calculateDeliveryCharge = (items: any[], deliverySettings: any, shippingInfo: any) => {
  let globalItemsSubtotal = 0;
  let maxCustomDeliveryCharge = 0;

  items.forEach(i => {
    const product = i.product;
    let unitPrice = product.discountPrice ?? product.price;
    if (i.variantId && product.variants) {
      const variant = product.variants.find((v: any) => v.id === i.variantId);
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
      globalDeliveryContribution = shippingInfo?.delivery_charge || deliverySettings.default_delivery_charge;
  }
  
  let finalDeliveryCharge = Math.max(globalDeliveryContribution, maxCustomDeliveryCharge);
  if (!shippingInfo?.serviceable) finalDeliveryCharge = 0;
  if (deliverySettings.force_free_delivery) finalDeliveryCharge = 0;
  
  return finalDeliveryCharge;
};

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
    email: "",
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

  // Redirect guests immediately — no guest checkout allowed
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { state: { redirectTo: "/checkout" } });
    }
  }, [user, loading, navigate]);

  // Fetch Addresses
  useEffect(() => {
    if (loading) return;
    if (!user) return; // will be redirected by guard above

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
  }, [user, loading]);

  // Handle Pincode Validation via Firestore
  const validatePincode = async (city: string) => {
    // Standardizing delivery charges for all locations
    setShippingInfo({ 
      serviceable: true, 
      delivery_charge: deliverySettings.default_delivery_charge,
      estimated_days: 5
    });
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
      if (!user) {
        const added = { id: Date.now().toString(), ...newAddress };
        const newAddresses = [...addresses, added];
        sessionStorage.setItem("guestAddresses", JSON.stringify(newAddresses));
        setAddresses(newAddresses);
        setSelectedAddressId(added.id);
        setShowAddForm(false);
        setNewAddress({ full_name: "", phone_number: "", email: "", street_address: "", city: "", state: "", pincode: "", country: "India" });
        toast.success("Guest address saved!");
        return;
      }

      const addressData = {
        ...newAddress,
        userId: user.uid,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, "addresses"), addressData);
      const added = { id: docRef.id, ...newAddress };
      setAddresses([...addresses, added]);
      setSelectedAddressId(added.id);
      setShowAddForm(false);
      setNewAddress({ full_name: "", phone_number: "", email: "", street_address: "", city: "", state: "", pincode: "", country: "India" });
      toast.success("Address saved!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save address");
    }
  };

  const handleCheckout = async () => {

    if (!selectedAddressId) {
      toast.error("Please select a delivery address.");
      return;
    }

    try { trackBeginCheckout(items as any, totalPrice); trackAddShippingInfo(totalPrice); trackAddPaymentInfo(totalPrice, "razorpay"); } catch {}
    setIsPlacingOrder(true);
    try {
      let shippingCharge = calculateDeliveryCharge(items, deliverySettings, shippingInfo);
      
      const finalAmount = totalPrice + shippingCharge;

      const selectedAddress = addresses.find(a => a.id === selectedAddressId);
      const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

      if (!RAZORPAY_KEY) {
        throw new Error("Razorpay Key ID is not configured.");
      }

      // Prepare order data for Pending Order creation
      const orderData = {
        userId: user ? user.uid : "guest",
        userEmail: user ? user.email : selectedAddress?.email || "",
        userName: selectedAddress?.full_name || (user ? user.displayName || user.email : "Guest"),
        customerPhone: selectedAddress?.phone_number || "",
        fullAddress: `${selectedAddress?.street_address}, ${selectedAddress?.city}, ${selectedAddress?.state} - ${selectedAddress?.pincode}, ${selectedAddress?.country}`,
        city: selectedAddress?.city || "",
        pincode: selectedAddress?.pincode || "",
        country: selectedAddress?.country || "India",
        orderFor: orderFor,
        recipientName: orderFor === 'gift' ? giftDetails.recipient_name : "",
        giftMessage: orderFor === 'gift' ? giftDetails.message : "",
        totalAmount: finalAmount,
        shippingCharge,
        paymentMethod: "Razorpay"
      };

      const orderItems = items.map(({ product, quantity, variantId, variantName }) => {
        const variant = variantId && product.variants ? product.variants.find(v => v.id === variantId) : null;
        // Use Cloudinary thumbnail — never send base64 or original heavy URLs
        const rawImg = variant?.images?.[0] || product.media?.[0]?.small || product.images?.[0] || product.image;
        const safeImg = (typeof rawImg === 'string' && rawImg.startsWith('data:image')) ? '' : (rawImg || '');
        return {
          productId: product.id,
          variantId: variantId || null,
          variantName: variantName || null,
          name: product.name,
          price: variant?.price ?? product.discountPrice ?? product.price,
          originalPrice: product.price,
          image: safeImg,
          quantity,
        };
      });

      // 2. Create Razorpay order on backend (HMAC-signed, tamper-proof, auth-protected)
      const API_URL = import.meta.env.VITE_API_URL || "";
      // Attach Firebase ID token — backend verifyFirebaseToken middleware requires this
      const idToken = user ? await user.getIdToken() : "";
      const { data: razorpayOrder } = await axios.post(`${API_URL}/api/create-order`, {
        amount: finalAmount,
        currency: "INR",
        receipt: `checkout_${Date.now()}`,
        orderData: orderData,
        items: orderItems
      }, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      const pendingOrderId = razorpayOrder.pendingOrderId;

      const options = {
        key: RAZORPAY_KEY,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.id,
        name: "Unique Jewellery Studio",
        description: "Premium Handcrafted Jewellery",
        image: "/favicon.png",
        handler: async function (response: any) {
          try {
            // 3. Verify signature and create order backend-side
            const API_URL = import.meta.env.VITE_API_URL || "";
            const { data: verifyResult } = await axios.post(`${API_URL}/api/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              pendingOrderId: pendingOrderId,
              orderData: orderData,
              items: orderItems
            });

            if (!verifyResult.verified) {
              toast.error("Payment verification failed. Please contact support.");
              return;
            }

            if (!verifyResult.orderId) {
              toast.error("Payment received but order creation failed. Please contact support.");
              return;
            }

            clearCart();
            try {
              trackPurchase(verifyResult.orderId, finalAmount, orderItems, shippingCharge);
              sessionStorage.setItem(
                `purchase_${verifyResult.orderId}`,
                JSON.stringify({ value: finalAmount, shipping: shippingCharge })
              );
            } catch {}
            toast.success("✨ Payment successful!");
            navigate(`/order-success/${verifyResult.orderId}`, { replace: true });
          } catch (err) {
            console.error("Firestore post-payment error:", err);
            toast.error("Payment successful but failed to save order. Please contact support at uniquejewelrystudio@gmail.com with payment ID: " + response.razorpay_payment_id);
          }
        },
        prefill: {
          name: selectedAddress?.full_name || (user ? user.displayName : ""),
          email: user ? user.email : selectedAddress?.email || "",
          contact: selectedAddress?.phone_number || "",
        },
        theme: {
          color: "#D4AF37",
        },
        modal: {
          ondismiss: function() {
            setIsPlacingOrder(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error("Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (error: any) {
      console.error("Razorpay initiation failed:", error);
      toast.error("Failed to initiate payment: " + (error.response?.data?.error || error.message));
    } finally {
      setIsPlacingOrder(false);
    }
  };
   
  let finalDeliveryCharge = calculateDeliveryCharge(items, deliverySettings, shippingInfo);

  const finalTotal = totalPrice + finalDeliveryCharge;

  if (loading || (user && isLoadingAddresses && addresses.length === 0 && !showAddForm)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="animate-spin text-gold" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <SEO title="Secure Checkout | Unique Jewelry Studio" description="Complete your bridal jewellery order securely." path="/checkout" noindex />
      {isPlacingOrder && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl px-8 py-10 max-w-sm mx-4 text-center shadow-2xl">
            <Loader2 className="animate-spin text-gold mx-auto mb-4" size={40} />
            <h3 className="font-heading text-xl text-stone-900 mb-2">Processing Payment</h3>
            <p className="text-sm text-stone-500">Please don't close or refresh this window. Your order is being secured.</p>
          </div>
        </div>
      )}
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
                            onClick={() => { setShowAddForm(true); setShippingInfo({ serviceable: true, delivery_charge: deliverySettings.default_delivery_charge, estimated_days: 5 }); }}
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
                            {!user && (
                              <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <input 
                                  required
                                  value={newAddress.email}
                                  onChange={(e) => setNewAddress({...newAddress, email: e.target.value})}
                                  type="email" className="w-full p-2.5 border border-border rounded-md focus:border-gold outline-none text-sm" placeholder="For order updates" 
                                />
                              </div>
                            )}
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
                          {finalDeliveryCharge === 0 ? (
                            <span className="text-green-600 font-semibold text-xs tracking-wider uppercase">Complimentary</span>
                          ) : (
                            `₹${finalDeliveryCharge}`
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
