import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useRef, lazy, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { trackPageView } from "@/lib/analytics";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartToastProvider } from "@/context/CartToastContext";
import CartDrawer from "@/components/CartDrawer";
import { FlyAnimationProvider } from "@/context/FlyAnimationContext";

const Index = lazy(() => import("./pages/Index.tsx"));
const Shop = lazy(() => import("./pages/Shop.tsx"));
const Categories = lazy(() => import("./pages/Categories.tsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.tsx"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy.tsx"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const Orders = lazy(() => import("./pages/Orders.tsx"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess.tsx"));
const Cart = lazy(() => import("./pages/Cart.tsx"));
const Checkout = lazy(() => import("./pages/Checkout.tsx"));

// New Collection Pages (We will create these next)
const HaldiPage = lazy(() => import("./pages/collections/HaldiPage"));
const MehndiPage = lazy(() => import("./pages/collections/MehndiPage"));
const BridalPage = lazy(() => import("./pages/collections/BridalPage"));
const TemplePage = lazy(() => import("./pages/collections/TemplePage"));
const KundanPage = lazy(() => import("./pages/collections/KundanPage"));
const ArtificialPage = lazy(() => import("./pages/collections/ArtificialPage"));


const queryClient = new QueryClient();

const RouteTracker = () => {
  const location = useLocation();
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
  return null;
};

const PageLoader = () => (
  <div className="flex justify-center items-center h-screen bg-background">
    <div className="w-10 h-10 border-4 border-muted border-t-gold rounded-full animate-spin" />
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <CartToastProvider>
            <FlyAnimationProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
              <RouteTracker />

              {/* ── Global Cart UX System ── */}
              {/* CartDrawer is always mounted so its slide animation works */}
              <CartDrawer />

              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/categories" element={<Categories />} />
                  
                  {/* Collections */}
                  <Route path="/collections/haldi-jewellery" element={<HaldiPage />} />
                  <Route path="/collections/mehndi-jewellery" element={<MehndiPage />} />
                  <Route path="/collections/bridal-jewellery-sets" element={<BridalPage />} />
                  <Route path="/collections/temple-jewellery" element={<TemplePage />} />
                  <Route path="/collections/kundan-jewellery" element={<KundanPage />} />
                  <Route path="/collections/artificial-jewellery" element={<ArtificialPage />} />

                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/my-orders" element={<Orders />} />
                  <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/refund" element={<RefundPolicy />} />
                  <Route path="/shipping" element={<ShippingPolicy />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
            </FlyAnimationProvider>
          </CartToastProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
