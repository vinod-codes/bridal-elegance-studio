import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";
import { Check, ShoppingBag, ArrowRight, Package, Calendar, MapPin } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { OrderStatusTracker, OrderStatus } from "@/components/OrderStatusTracker";

interface Order {
  id: string;
  totalAmount: number;
  userName: string;
  fullAddress: string;
  createdAt: any;
  items: any[];
  orderFor: string;
  recipientName?: string;
  status: OrderStatus;
}

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    let timeoutId: any;

    const unsubscribe = onSnapshot(doc(db, "orders", orderId), (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as Order;
        setOrder(data);
        setLoading(false);
        if (timeoutId) clearTimeout(timeoutId);

        // Fire GA4 purchase once per order (guard against StrictMode dup)
        const key = `ga_purchase_${orderId}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          import("@/lib/analytics").then(({ trackPurchase }) =>
            trackPurchase(orderId, data.totalAmount, data.items || [])
          );
        }
      } else {
        // Don't redirect home — show not-found state instead
        setOrder(null);
      }
    }, (error) => {
      console.error("Error fetching order:", error);
      setLoading(false);
    });

    timeoutId = setTimeout(() => {
      setLoading(false);
    }, 10000);

    // Stop confetti after 8 seconds
    const timer = setTimeout(() => setShowConfetti(false), 8000);
    return () => {
      unsubscribe();
      clearTimeout(timer);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 font-medium text-xs uppercase tracking-widest">Confirming Your Masterpiece</p>
        </div>
      </div>
    );
  }

  if (!orderId || orderId === "undefined") {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col">
        <Header />
        <main className="flex-grow pt-32 pb-20 px-4 flex items-center justify-center">
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">Invalid Order</h2>
            <p className="text-muted-foreground mb-6">The order ID is missing or invalid. Please contact support if your payment was deducted.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/" className="px-5 py-3 border border-stone-300 rounded-sm uppercase tracking-wider text-xs font-bold">Return to Home</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col">
        <Header />
        <main className="flex-grow pt-32 pb-20 px-4 flex items-center justify-center">
          <div className="max-w-md text-center">
            <h1 className="font-heading text-3xl text-stone-900 mb-3">Order not found</h1>
            <p className="text-stone-500 mb-6">We couldn't locate this order. If you just paid, please check "My Orders" or contact support with your payment reference.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/my-orders" className="px-5 py-3 bg-gold text-white rounded-sm uppercase tracking-wider text-xs font-bold">My Orders</Link>
              <Link to="/shop" className="px-5 py-3 border border-stone-300 rounded-sm uppercase tracking-wider text-xs font-bold">Continue Shopping</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.1} colors={['#D4AF37', '#F5F5F4', '#1C1917', '#A8A29E']} />}
      <Header />
      
      <main className="flex-grow pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="w-24 h-24 bg-gold rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-gold/20"
            >
              <Check size={48} className="text-white" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="font-heading text-5xl md:text-6xl font-light text-stone-900 mb-4 tracking-tight">
                An Exquisite Choice.
              </h1>
              <p className="text-stone-500 font-body text-lg max-w-lg mx-auto">
                Thank you, {order.userName}. Your selection has been confirmed and we've begun preparing your order for its journey.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex flex-col items-center text-center gap-3">
              <Package size={20} className="text-gold" />
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Reference No.</p>
                <p className="font-mono text-sm font-semibold text-stone-900">#{order.id.slice(0, 12).toUpperCase()}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex flex-col items-center text-center gap-3">
              <Calendar size={20} className="text-gold" />
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Order Placed</p>
                <p className="text-sm font-semibold text-stone-900">
                  {order.createdAt?.toDate?.().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex flex-col items-center text-center gap-3">
              <MapPin size={20} className="text-gold" />
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Destination</p>
                <p className="text-sm font-semibold text-stone-900 truncate max-w-[150px]">{order.fullAddress.split(',')[0]}</p>
              </div>
            </div>
          </motion.div>

          {/* Progress Tracker */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-stone-900">Track Order</h3>
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                order.status === 'cancelled' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-stone-50 text-gold border-stone-100'
              }`}>
                {order.status || 'pending'}
              </span>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
              <OrderStatusTracker status={order.status || 'pending'} />
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="group relative overflow-hidden bg-stone-900 rounded-3xl p-8"
            >
              <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                <div className="space-y-2">
                  <h3 className="text-white font-heading text-2xl">Track Your Journey</h3>
                  <p className="text-stone-400 text-sm">Follow your bridal treasures from our studio to your doorstep in real-time.</p>
                </div>
                <Link 
                  to="/my-orders" 
                  className="inline-flex items-center gap-3 text-gold font-bold uppercase tracking-widest text-xs group-hover:gap-5 transition-all"
                >
                  View My Orders <ArrowRight size={16} />
                </Link>
              </div>
              <Package size={120} className="absolute -bottom-4 -right-4 text-white/5 rotate-12" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="group relative overflow-hidden bg-white rounded-3xl p-8 border border-stone-100 shadow-sm"
            >
              <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                <div className="space-y-2">
                  <h3 className="text-stone-900 font-heading text-2xl">Keep Exploring</h3>
                  <p className="text-stone-500 text-sm">Complement your selection with more pieces from our latest bridal couture.</p>
                </div>
                <Link 
                  to="/shop" 
                  className="inline-flex items-center gap-3 text-gold font-bold uppercase tracking-widest text-xs group-hover:gap-5 transition-all"
                >
                  Return to Studio <ArrowRight size={16} />
                </Link>
              </div>
              <ShoppingBag size={120} className="absolute -bottom-4 -right-4 text-stone-50 rotate-12" />
            </motion.div>
          </div>

          {/* Reward Section/Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-gold/5 rounded-3xl p-8 border border-gold/10 text-center"
          >
            <p className="text-stone-600 font-body text-sm italic">
                "Fashion is the most powerful art there is. Its movement, design, and architecture all in one. It shows the world who we are and who we'd like to be."
            </p>
            <p className="text-gold font-bold text-[10px] uppercase tracking-[0.2em] mt-4">— Unique Jewelry Studio</p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccess;
