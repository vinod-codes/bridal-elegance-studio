import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Minus,
  Plus,
  Star,
  Truck,
  RefreshCcw,
  ShieldCheck,
  Heart,
  Share2,
  CheckCircle2,
} from "lucide-react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ─── Rating Donut Chart ─── */
const ratingData = [
  { stars: 5, count: 1420, color: "#22c55e" },
  { stars: 4, count: 640, color: "#86efac" },
  { stars: 3, count: 210, color: "#fbbf24" },
  { stars: 2, count: 90, color: "#fb923c" },
  { stars: 1, count: 40, color: "#f87171" },
];
const totalRatings = ratingData.reduce((s, r) => s + r.count, 0);
const avgRating = (
  ratingData.reduce((s, r) => s + r.stars * r.count, 0) / totalRatings
).toFixed(1);

function DonutChart() {
  const size = 140;
  const strokeWidth = 18;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  const segments = ratingData.map((d) => {
    const pct = d.count / totalRatings;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const segment = {
      color: d.color,
      strokeDasharray: `${dash} ${gap}`,
      strokeDashoffset: -offset,
    };
    offset += dash;
    return segment;
  });

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-heading font-bold text-foreground leading-none">
            {avgRating}
          </span>
          <div className="flex items-center gap-0.5 mt-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={8}
                className={
                  s <= Math.round(Number(avgRating))
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted"
                }
              />
            ))}
          </div>
          <span className="text-[9px] text-muted-foreground font-body mt-0.5">
            {(totalRatings / 1000).toFixed(1)}k
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground font-body mt-2 text-center">
        Overall Rating
      </p>
    </div>
  );
}

function RatingBars() {
  return (
    <div className="flex flex-col gap-2 flex-1 min-w-0">
      {ratingData.map((d) => {
        const pct = Math.round((d.count / totalRatings) * 100);
        return (
          <div key={d.stars} className="flex items-center gap-2">
            <span className="text-xs font-body text-muted-foreground w-3 shrink-0">
              {d.stars}
            </span>
            <Star size={10} className="fill-amber-400 text-amber-400 shrink-0" />
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: d.color }}
              />
            </div>
            <span className="text-[11px] font-body text-muted-foreground w-8 text-right shrink-0">
              {d.count >= 1000 ? `${(d.count / 1000).toFixed(1)}k` : d.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Circular quality indicators ─── */
const qualityMetrics = [
  { label: "Craft", value: 96, color: "#b8860b" },
  { label: "Comfort", value: 89, color: "#d4a843" },
  { label: "Value", value: 92, color: "#c9954c" },
  { label: "Delivery", value: 95, color: "#22c55e" },
];

function MiniRadial({ label, value, color }: { label: string; value: number; color: string }) {
  const size = 68;
  const sw = 7;
  const radius = (size - sw) / 2;
  const circ = 2 * Math.PI * radius;
  const filled = (value / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f3f3f3" strokeWidth={sw} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={sw}
            strokeDasharray={`${filled} ${circ - filled}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[13px] font-heading font-bold" style={{ color }}>
            {value}%
          </span>
        </div>
      </div>
      <span className="text-[11px] font-body text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

/* ─── Main Component ─── */
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, loading } = useProduct(id);
  const { products: allProducts } = useProducts();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false); // ← local state, fixes TS error

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen animate-pulse">
        <AnnouncementBar />
        <Header />
        <main className="container py-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="aspect-[3/4] bg-muted rounded-xl" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(i => <div key={i} className="w-20 h-24 bg-muted rounded-md" />)}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-4 bg-muted w-1/4 rounded" />
              <div className="h-10 bg-muted w-3/4 rounded" />
              <div className="h-6 bg-muted w-1/3 rounded" />
              <div className="h-32 bg-muted rounded" />
              <div className="h-12 bg-muted rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <AnnouncementBar />
        <Header />
        <main className="container py-24 text-center">
          <h2 className="text-2xl font-heading mb-4">Product Not Found</h2>
          <Link to="/shop" className="text-gold underline font-body">Return to Shop</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [product.image || "/placeholder.jpg"];
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isOutOfStock = (product.stock || 0) <= 0;

  const handleBuyNow = () => {
    if (!isOutOfStock) {
      addToCart(product, qty);
      navigate("/cart");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8 font-body">
          <Link to="/" className="hover:text-gold uppercase tracking-tighter">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-gold uppercase tracking-tighter">Shop</Link>
          <span>/</span>
          <span className="text-foreground font-medium uppercase tracking-tighter truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* LEFT COLUMN: Image Gallery */}
          <div className="flex-1 space-y-4">
            <div className="relative group overflow-hidden rounded-xl bg-muted aspect-[3/4]">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 cursor-zoom-in"
              />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="bg-white/90 text-black px-6 py-2 rounded-full font-heading text-sm font-semibold tracking-widest uppercase shadow-xl">Out of Stock</span>
                </div>
              )}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {/* ✅ Fixed: uses local isFavorite state instead of product.isFavorite */}
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="bg-white/90 p-2.5 rounded-full shadow-lg hover:bg-white text-foreground hover:text-red-500 transition-all"
                >
                  <Heart
                    size={20}
                    className={cn(
                      "transition-all duration-200",
                      isFavorite ? "fill-red-500 text-red-500" : "fill-transparent"
                    )}
                  />
                </button>
                <button className="bg-white/90 p-2.5 rounded-full shadow-lg hover:bg-white text-foreground transition-all">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "relative w-24 aspect-[3/4] flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                      activeImage === idx ? "border-gold shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Product Info */}
          <div className="flex-1 max-w-xl">
            <div className="space-y-6">
              {/* Product Header */}
              <div className="space-y-2 border-b border-muted pb-6">
                <div className="flex items-center gap-2">
                  <span className="text-gold font-body text-xs font-semibold tracking-widest uppercase">{product.category}</span>
                  {product.badge && (
                    <span className="bg-accent text-accent-foreground text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded">
                      {product.badge}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl lg:text-4xl font-heading font-medium text-foreground tracking-tight leading-none uppercase">{product.name}</h1>

                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded text-green-700">
                    <span className="text-sm font-bold">{avgRating}</span>
                    <Star size={14} className="fill-green-700" />
                  </div>
                  <span className="text-sm text-muted-foreground font-body border-l border-muted pl-3">
                    {(totalRatings / 1000).toFixed(1)}k Ratings
                  </span>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="space-y-1">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-heading text-foreground font-semibold tracking-tight">₹{product.price}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="flex items-center gap-3">
                      <span className="text-xl text-muted-foreground line-through font-body">MRP ₹{product.originalPrice}</span>
                      <span className="text-xl text-orange-500 font-bold font-body">({discount}% OFF)</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-green-600 font-medium font-body flex gap-1 items-center italic">
                  Inclusive of all taxes
                </p>
              </div>

              {/* Description Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-heading font-bold uppercase tracking-widest text-foreground">Product Description</h3>
                <p className="text-muted-foreground font-body leading-relaxed text-[15px]">
                  {product.description || "A beautifully crafted piece from Bridal Elegance Studio, designed to make your special moments unforgettable. Experience premium quality materials and meticulous attention to detail."}
                </p>
              </div>

              {/* Delivery info & Options */}
              <div className="space-y-8 pt-4">
                {/* Quantity Selector */}
                {!isOutOfStock && (
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-heading font-bold uppercase tracking-widest">Select Quantity</span>
                    <div className="flex items-center w-fit border border-muted-foreground/30 rounded-lg bg-muted/5">
                      <button
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="p-3 hover:text-gold transition-colors disabled:opacity-30"
                        disabled={qty <= 1}
                      >
                        <Minus size={18} />
                      </button>
                      <span className="px-6 text-xl font-heading font-bold border-x border-muted-foreground/30">{qty}</span>
                      <button
                        onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}
                        className="p-3 hover:text-gold transition-colors"
                        disabled={qty >= (product.stock || 99)}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    {(product.stock || 0) < 5 && product.stock > 0 && (
                      <p className="text-xs text-red-500 font-medium">Only {product.stock} left! Hurry up!</p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={() => {
                      if (!isOutOfStock) {
                        addToCart(product, qty);
                        toast.success(`Success! ${product.name} added to cart`, {
                          action: {
                            label: "View Cart",
                            onClick: () => navigate("/cart")
                          }
                        });
                      }
                    }}
                    disabled={isOutOfStock}
                    className="flex-1 flex items-center justify-center gap-3 bg-foreground text-background py-5 rounded-lg font-heading text-lg font-bold tracking-widest uppercase hover:opacity-90 transition-all disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed group shadow-xl"
                  >
                    <ShoppingBag size={22} className="group-hover:scale-110 transition-transform" />
                    {isOutOfStock ? "Out of Stock" : "Add to Bag"}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="flex-1 flex items-center justify-center gap-3 border-2 border-gold text-gold py-5 rounded-lg font-heading text-lg font-bold tracking-widest uppercase hover:bg-gold/5 transition-all disabled:bg-muted disabled:text-muted-foreground disabled:border-transparent disabled:cursor-not-allowed shadow-lg shadow-gold/5"
                  >
                    Buy Now
                  </button>
                </div>

                {/* Trust Badges & Delivery Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-muted">
                  <div className="flex items-start gap-4">
                    <div className="bg-blush p-2 rounded-full">
                      <Truck size={20} className="text-gold" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider mb-1">Fast Delivery</h4>
                      <p className="text-xs text-muted-foreground leading-snug">Expected in 3-5 working days within India.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-blush p-2 rounded-full">
                      <RefreshCcw size={20} className="text-gold" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider mb-1">Easy Returns</h4>
                      <p className="text-xs text-muted-foreground leading-snug">7-day hassle-free return policy if not satisfied.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-blush p-2 rounded-full">
                      <ShieldCheck size={20} className="text-gold" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider mb-1">100% Original</h4>
                      <p className="text-xs text-muted-foreground leading-snug">Genuine quality materials from specialized artisans.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-blush p-2 rounded-full">
                      <CheckCircle2 size={20} className="text-gold" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider mb-1">Quality Guaranteed</h4>
                      <p className="text-xs text-muted-foreground leading-snug">Hand-checked for defects before every shipment.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Ratings & Analytics Section ─── */}
        <section className="mt-16 pt-12 border-t border-muted">
          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-heading font-medium uppercase tracking-tight">Ratings & Reviews</h2>
            <div className="h-1 w-16 bg-gold rounded-full" />
          </div>

          {/* Top row: Donut + Bars */}
          <div className="bg-gradient-to-br from-[#fdf8f2] to-white border border-muted/60 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <DonutChart />
              <RatingBars />
            </div>
          </div>

          {/* Quality metric circles */}
          <div className="bg-gradient-to-br from-white to-[#fdf8f2] border border-muted/60 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-heading font-bold uppercase tracking-widest text-muted-foreground mb-5">Quality Breakdown</p>
            <div className="grid grid-cols-4 gap-2 sm:gap-6 justify-items-center">
              {qualityMetrics.map((m) => (
                <MiniRadial key={m.label} label={m.label} value={m.value} color={m.color} />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground font-body text-center mt-5 italic">
              Based on {(totalRatings / 1000).toFixed(1)}k verified customer reviews
            </p>
          </div>
        </section>

        {/* Related Products Section */}
        {related.length > 0 && (
          <section className="mt-20 pt-12 border-t border-muted">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-2">
                <h2 className="text-2xl font-heading font-medium uppercase tracking-tight">You May Also Like</h2>
                <div className="h-1 w-16 bg-gold rounded-full" />
              </div>
              <Link to="/shop" className="text-gold font-bold text-sm uppercase tracking-widest hover:underline decoration-2 underline-offset-8">View All</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
