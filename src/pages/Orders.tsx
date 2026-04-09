import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Package, ArrowRight, ShoppingBag, Truck, MapPin, CheckCircle2, Clock, XCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Timestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

import { OrderStatusTracker, OrderStatus } from "@/components/OrderStatusTracker";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
  images?: string[];
}

interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  shippingCharge: number;
  city: string;
  orderFor: string;
  recipientName: string;
  giftMessage: string;
  items: OrderItem[];
  createdAt: Timestamp;
}

const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  processing: "bg-emerald-100 text-emerald-700 border-emerald-200",
  shipped: "bg-blue-100 text-blue-700 border-blue-200",
  out_for_delivery: "bg-purple-100 text-purple-700 border-purple-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-rose-100 text-rose-700 border-rose-200",
};

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (!user) return;

    // Real-time synchronization
    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    }, (error) => {
      console.error("Orders sync error:", error);
      // Fallback for missing index
      const fallbackQuery = query(collection(db, "orders"), where("userId", "==", user.uid));
      onSnapshot(fallbackQuery, (snapshot) => {
        const sorted = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Order))
          .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        setOrders(sorted);
        setLoading(false);
      });
    });

    return () => unsubscribe();
  }, [user, authLoading, navigate]);

  if (authLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 font-medium text-xs uppercase tracking-widest">Bridal Elegance Studio</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header />
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-32">
        <div className="flex flex-col gap-2 mb-12">
          <div className="flex items-center gap-3">
            <Package size={24} className="text-gold" />
            <h1 className="font-heading text-4xl font-light text-foreground">
              Your Orders
            </h1>
          </div>
          <p className="text-stone-500 text-sm">Review your exquisite collection and track their journey.</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 shadow-sm border border-stone-100 flex flex-col items-center text-center gap-6">
            <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center text-stone-200">
              <ShoppingBag size={48} />
            </div>
            <div className="space-y-2">
              <p className="text-stone-900 font-heading text-xl">No orders yet</p>
              <p className="text-stone-400 max-w-xs mx-auto text-sm">Every masterpiece begins somewhere. Start your collection today.</p>
            </div>
            <Link
              to="/shop"
              className="mt-4 bg-stone-900 text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-stone-800 transition-all flex items-center gap-2"
            >
              Express Your Selection <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <AnimatePresence mode="popLayout">
              {orders.map((order) => (
                <motion.div
                  layout
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 p-8"
                >
                  <div className="flex items-start justify-between flex-wrap gap-6 mb-8">
                    <div className="space-y-1">
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Reference No.</p>
                      <p className="font-mono text-sm font-semibold text-stone-900">#{order.id.slice(0, 12).toUpperCase()}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 text-right">
                      <span className={`text-[10px] font-bold px-4 py-1.5 rounded-full border uppercase tracking-wider ${statusColor[order.status] || statusColor.pending}`}>
                        {order.status === "out_for_delivery" ? "On the Way" : order.status}
                      </span>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                        {order.createdAt?.toDate?.().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  <div className="bg-stone-50/50 rounded-2xl p-4 mb-8 border border-stone-100/50">
                    <OrderStatusTracker status={order.status} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-8 pt-8 border-t border-stone-50">
                    <div className="space-y-4">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 group">
                          <div className="w-16 h-16 bg-stone-50 rounded-2xl overflow-hidden flex-shrink-0 border border-stone-100">
                             {item.image || (item.images && (item.images as string[])[0]) ? (
                                <img src={item.image || (item.images as string[])[0]} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-200">
                                  <ShoppingBag size={20} />
                                </div>
                              )}
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-heading text-sm text-stone-800">{item.name}</h4>
                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-mono text-sm font-medium text-stone-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-6 bg-stone-50/50 rounded-2xl p-6">
                      <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-stone-400">
                          <span>Subtotal</span>
                          <span className="text-stone-900">₹{(order.totalAmount - order.shippingCharge).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-stone-400">
                          <span>Shipping to {order.city}</span>
                          <span className="text-emerald-600 font-bold">
                            {order.shippingCharge === 0 ? "Complimentary" : `₹${order.shippingCharge}`}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
                          <span className="font-heading text-stone-900">Grand Total</span>
                          <span className="font-heading text-2xl text-gold">₹{order.totalAmount?.toLocaleString()}</span>
                        </div>
                      </div>

                      {order.orderFor === 'gift' && (
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-stone-100 space-y-2">
                           <div className="flex items-center gap-2 text-gold">
                            <ShoppingBag size={12} fill="currentColor" />
                            <span className="text-[10px] font-bold tracking-widest uppercase">Gifting Note</span>
                          </div>
                          <p className="text-xs text-stone-800 font-medium italic">"{order.giftMessage}"</p>
                          <p className="text-[10px] text-stone-400 font-bold text-right uppercase tracking-widest">— For {order.recipientName}</p>
                        </div>
                      )}
                      
                      {order.status === "cancelled" && (
                         <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-xl text-rose-700">
                            <XCircle size={18} />
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold uppercase tracking-widest">Order Cancelled</p>
                              <p className="text-[10px] opacity-70">Refund initiated (if applicable)</p>
                            </div>
                         </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Orders;

