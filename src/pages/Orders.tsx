import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircle, Package, ArrowRight, ShoppingBag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { Timestamp } from "firebase/firestore";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
  createdAt: Timestamp;
}

const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
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

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
      } catch (error: unknown) {
        // Fallback without ordering
        try {
          const snap = await getDocs(
            query(collection(db, "orders"), where("userId", "==", user.uid))
          );
          setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
        } catch (fallbackError: unknown) {
          console.error("Could not load orders:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, authLoading, navigate]);

  if (authLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-24">
        <div className="flex items-center gap-3 mb-8">
          <Package size={28} className="text-gold" />
          <h1 className="font-heading text-3xl font-medium text-foreground tracking-widest uppercase">
            My Orders
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-6 py-20 text-center">
            <ShoppingBag size={64} className="text-gold/30" />
            <p className="text-muted-foreground font-body text-lg">You haven't placed any orders yet.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-gold text-white px-8 py-3 rounded-full font-body uppercase tracking-widest text-sm hover:bg-gold/90 transition-colors"
            >
              Browse Collection <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-border/40">
                <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-body uppercase tracking-widest">Order ID</p>
                    <p className="font-mono text-sm font-semibold text-foreground mt-0.5">#{order.id.slice(0, 12).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColor[order.status] || statusColor.pending}`}>
                      {order.status || "pending"}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : ""}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-border/40">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 py-3">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
                      )}
                      <div className="flex-1">
                        <p className="font-heading text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle size={16} className="text-emerald-500" />
                    {order.status === "completed" ? "Delivered" : "Order confirmed — we'll contact you soon"}
                  </div>
                  <p className="font-heading font-semibold text-lg">
                    ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
