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
  ChevronRight,
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
  const [isFavorite, setIsFavorite] = useState(false); 
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const uniqueColors = Array.from(new Map(product?.variants?.filter((v: any) => v.colorName).map((v: any) => [v.colorName, v.colorHex])).entries());
  
  // Find current variant based on color and size
  let currentVariant = product?.variants?.find((v: any) => v.colorName === selectedColor && v.size === selectedSize);
  
  // Fallback: if no exact color/size matched, use first variant of selected color or the first overall
  if (!currentVariant && product?.variants?.length > 0) {
     currentVariant = product.variants.find((v: any) => v.colorName === selectedColor) || product.variants[0];
  }
  const selectedVariantId = currentVariant?.id;

  const currentPrice = currentVariant?.price ?? product?.discountPrice ?? product?.price ?? 0;
  const originalPrice = currentVariant?.price ? null : (product?.discountPrice ? product?.price : null);
  const currentStock = currentVariant?.stock ?? product?.stock ?? 0;
  
  let variantImages: string[] = [];
  if (currentVariant) {
    if (currentVariant.images && currentVariant.images.length > 0) {
      variantImages = currentVariant.images;
    } else if (currentVariant.previewImage) {
      variantImages = [currentVariant.previewImage];
    }
  }

  const currentImages = variantImages.length > 0 
    ? variantImages 
    : (product?.media?.length 
        ? product.media.map((m: any) => m.large || m.original)
        : (product?.images?.length ? product.images : [product?.image || "/placeholder.jpg"]));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!product?.variants?.length) return;
    if (!selectedColor) {
      setSelectedColor(product.variants[0].colorName);
      setSelectedSize(product.variants[0].size);
    }
  }, [product, selectedColor]);

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

  const images = currentImages;
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const discount = originalPrice && originalPrice > currentPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const isOutOfStock = currentStock <= 0;

  const handleBuyNow = () => {
    if (!isOutOfStock) {
      addToCart(product, qty, selectedVariantId || undefined, currentVariant?.colorName);
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

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
          {/* LEFT COLUMN: Image Gallery (Sticky) */}
          <div className="w-full lg:w-3/5 lg:sticky lg:top-24 space-y-4">
            <div className="relative group overflow-hidden rounded-2xl bg-[#f8f9fa] aspect-[4/5] border border-[#e9ecef]">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03] cursor-zoom-in"
              />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm transition-all">
                  <span className="bg-white text-black px-8 py-3 rounded-full font-heading text-sm font-bold tracking-[0.2em] uppercase shadow-2xl">Out of Stock</span>
                </div>
              )}
              <div className="absolute top-5 right-5 flex flex-col gap-3">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-lg hover:scale-110 text-foreground transition-all border border-black/5"
                >
                  <Heart
                    size={22}
                    strokeWidth={1.5}
                    className={cn(
                      "transition-all duration-300",
                      isFavorite ? "fill-red-500 text-red-500" : "fill-transparent text-[#2c3e50]"
                    )}
                  />
                </button>
                <button className="bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-lg hover:scale-110 text-foreground transition-all border border-black/5">
                  <Share2 size={22} strokeWidth={1.5} className="text-[#2c3e50]" />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "relative w-24 aspect-[4/5] flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all snap-start",
                      activeImage === idx ? "border-[#2c3e50] shadow-md scale-100" : "border-transparent opacity-60 hover:opacity-100 scale-95 hover:scale-100"
                    )}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Product Info & Buy Box */}
          <div className="w-full lg:w-2/5 flex flex-col">
            <div className="space-y-8">
              
              {/* Header Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Link to={`/category/${product.category}`} className="text-[#7f8c8d] font-body text-[11px] font-bold tracking-[0.2em] uppercase hover:text-[#2c3e50] transition-colors">
                    {product.category}
                  </Link>
                  {product.badge && (
                    <span className="bg-[#e67586]/10 text-[#e67586] text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full">
                      {product.badge}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-heading font-medium text-[#2c3e50] tracking-tight leading-[1.1] uppercase">
                  {product.name}
                </h1>

                {/* Ratings Strip */}
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1.5 bg-[#f8f9fa] border border-[#e9ecef] px-3 py-1.5 rounded-lg">
                    <span className="text-sm font-bold text-[#2c3e50]">{avgRating}</span>
                    <Star size={14} className="fill-[#e67586] text-[#e67586]" />
                  </div>
                  <a href="#reviews" className="text-sm text-[#7f8c8d] font-body hover:text-[#2c3e50] transition-colors underline underline-offset-4 decoration-[#dee2e6]">
                    See all {(totalRatings / 1000).toFixed(1)}k reviews
                  </a>
                </div>
              </div>

              {/* Pricing Block */}
              <div className="p-6 rounded-2xl bg-[#f8f9fa] border border-[#e9ecef] space-y-2">
                <div className="flex items-end gap-3 flex-wrap">
                  <span className="text-4xl font-heading text-[#2c3e50] font-medium tracking-tight">₹{currentPrice.toLocaleString('en-IN')}</span>
                  {originalPrice && originalPrice > currentPrice && (
                    <>
                      <span className="text-lg text-[#7f8c8d] line-through font-body mb-1">₹{originalPrice.toLocaleString('en-IN')}</span>
                      <span className="text-sm text-emerald-600 font-bold font-body mb-1.5 px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-100">
                        Save {discount}%
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-[#7f8c8d] font-body uppercase tracking-wider">
                  Inclusive of all taxes
                </p>
              </div>

              {/* Variants Section */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-8 pt-2">
                  
                  {/* Color Selection */}
                  {uniqueColors.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-xs font-heading font-bold uppercase tracking-[0.15em] text-[#7f8c8d]">Color</h3>
                        <span className="text-[#2c3e50] font-medium font-body">{selectedColor || "Select an option"}</span>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {uniqueColors.map(([colorName, colorHex]: any) => {
                          const isSelected = selectedColor === colorName;
                          return (
                            <button
                              key={colorName}
                              onClick={() => {
                                setSelectedColor(colorName);
                                // Auto-select first available size for this color if current size is invalid
                                const sizesForColor = product.variants.filter((v: any) => v.colorName === colorName && v.size).map((v: any) => v.size);
                                if (sizesForColor.length > 0 && (!selectedSize || !sizesForColor.includes(selectedSize))) {
                                  setSelectedSize(sizesForColor[0]);
                                }
                                setActiveImage(0);
                              }}
                              className={cn(
                                "group relative w-12 h-12 rounded-full border-2 transition-all p-[3px]",
                                isSelected ? "border-[#2c3e50] scale-110 shadow-md" : "border-transparent hover:border-[#dee2e6] hover:scale-105"
                              )}
                              title={colorName}
                            >
                              <div 
                                className="w-full h-full rounded-full border border-black/10 shadow-inner" 
                                style={{ backgroundColor: colorHex || '#eee' }}
                              />
                              {isSelected && (
                                <div className="absolute -bottom-1 -right-1 bg-[#2c3e50] text-white rounded-full p-1 shadow-sm border-2 border-white">
                                  <CheckCircle2 size={10} strokeWidth={3} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Size Selection */}
                  {product.variants.some((v: any) => v.size) && (
                    <div className="space-y-4">
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-xs font-heading font-bold uppercase tracking-[0.15em] text-[#7f8c8d]">Size</h3>
                          <span className="text-[#2c3e50] font-medium font-body">{selectedSize || "Select an option"}</span>
                        </div>
                        <button className="text-[11px] text-[#7f8c8d] underline underline-offset-4 decoration-[#dee2e6] hover:text-[#2c3e50] transition-colors">Size Guide</button>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                        {Array.from(new Set(product.variants.filter((v: any) => v.colorName === selectedColor).map((v: any) => v.size).filter(Boolean))).map((size: any) => {
                          const isSelected = selectedSize === size;
                          const variantForSize = product.variants.find((v: any) => v.colorName === selectedColor && v.size === size);
                          const isSizeOutOfStock = (variantForSize?.stock || 0) <= 0;

                          return (
                            <button
                              key={size}
                              onClick={() => {
                                if (!isSizeOutOfStock) setSelectedSize(size);
                              }}
                              disabled={isSizeOutOfStock}
                              className={cn(
                                "py-3 rounded-xl font-heading font-bold text-sm uppercase transition-all flex items-center justify-center border",
                                isSelected 
                                  ? "border-[#2c3e50] bg-[#2c3e50] text-white shadow-md" 
                                  : isSizeOutOfStock
                                    ? "border-[#e9ecef] bg-[#f8f9fa] text-[#adb5bd] cursor-not-allowed opacity-50 relative overflow-hidden"
                                    : "border-[#e9ecef] text-[#495057] hover:border-[#2c3e50] hover:bg-white"
                              )}
                            >
                              {size}
                              {isSizeOutOfStock && (
                                <div className="absolute inset-0 w-full h-full">
                                  <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#adb5bd] -rotate-12 transform origin-center"></div>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Description Snippet */}
              <div className="prose prose-sm max-w-none text-[#495057] font-body leading-relaxed border-t border-[#e9ecef] pt-8">
                <p>
                  {product.description || "A beautifully crafted piece from Unique Jewelry Studio, designed to make your special moments unforgettable. Experience premium quality materials and meticulous attention to detail."}
                </p>
              </div>

              {/* Action Area (Buy Box) */}
              <div className="pt-6 space-y-5">
                
                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", isOutOfStock ? "bg-red-500" : (currentStock < 5 ? "bg-orange-500" : "bg-emerald-500"))}></div>
                  <span className={cn("text-sm font-bold font-body", isOutOfStock ? "text-red-500" : (currentStock < 5 ? "text-orange-600" : "text-emerald-600"))}>
                    {isOutOfStock ? "Currently Unavailable" : (currentStock < 5 ? `Hurry! Only ${currentStock} left in stock` : "In Stock & Ready to Ship")}
                  </span>
                </div>

                {!isOutOfStock && (
                  <div className="flex items-stretch gap-4 h-14">
                    {/* Quantity */}
                    <div className="flex items-center rounded-xl border border-[#dee2e6] bg-white w-32 shrink-0 overflow-hidden shadow-sm">
                      <button
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="flex-1 flex items-center justify-center h-full hover:bg-[#f8f9fa] transition-colors text-[#495057]"
                        disabled={qty <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-10 text-center font-heading font-bold text-lg text-[#2c3e50] select-none">{qty}</span>
                      <button
                        onClick={() => setQty(Math.min(currentStock || 99, qty + 1))}
                        className="flex-1 flex items-center justify-center h-full hover:bg-[#f8f9fa] transition-colors text-[#495057]"
                        disabled={qty >= (currentStock || 99)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Add to Cart */}
                    <button
                      onClick={() => {
                        addToCart(product, qty, selectedVariantId || undefined, currentVariant?.colorName);
                        toast.success(`${product.name} added to cart`, {
                          icon: '🛍️',
                          action: { label: "Checkout", onClick: () => navigate("/cart") }
                        });
                      }}
                      className="flex-1 bg-[#2c3e50] hover:bg-[#1a252f] text-white rounded-xl font-heading font-bold tracking-[0.1em] uppercase text-sm shadow-lg shadow-black/10 transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={18} />
                      Add to Bag
                    </button>
                  </div>
                )}

                {/* Buy Now (Full Width) */}
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="w-full h-14 bg-[#e67586] hover:bg-[#d66576] text-white rounded-xl font-heading font-bold tracking-[0.15em] uppercase text-sm shadow-xl shadow-[#e67586]/20 transition-all disabled:bg-[#e9ecef] disabled:text-[#adb5bd] disabled:cursor-not-allowed disabled:shadow-none"
                >
                  Buy It Now
                </button>
              </div>

              {/* Value Props / Trust Badges */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 pt-8 border-t border-[#e9ecef]">
                <div className="flex items-start gap-3">
                  <div className="bg-[#f8f9fa] p-2.5 rounded-full shrink-0 border border-[#e9ecef]">
                    <Truck size={18} className="text-[#2c3e50]" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold font-heading uppercase tracking-widest text-[#2c3e50] mb-0.5">Free Shipping</h4>
                    <p className="text-[11px] text-[#7f8c8d] leading-tight">On all orders over ₹5,000</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-[#f8f9fa] p-2.5 rounded-full shrink-0 border border-[#e9ecef]">
                    <RefreshCcw size={18} className="text-[#2c3e50]" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold font-heading uppercase tracking-widest text-[#2c3e50] mb-0.5">Easy Returns</h4>
                    <p className="text-[11px] text-[#7f8c8d] leading-tight">7-day return policy</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-[#f8f9fa] p-2.5 rounded-full shrink-0 border border-[#e9ecef]">
                    <ShieldCheck size={18} className="text-[#2c3e50]" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold font-heading uppercase tracking-widest text-[#2c3e50] mb-0.5">Authentic</h4>
                    <p className="text-[11px] text-[#7f8c8d] leading-tight">100% genuine products</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-[#f8f9fa] p-2.5 rounded-full shrink-0 border border-[#e9ecef]">
                    <CheckCircle2 size={18} className="text-[#2c3e50]" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold font-heading uppercase tracking-widest text-[#2c3e50] mb-0.5">Secure Pay</h4>
                    <p className="text-[11px] text-[#7f8c8d] leading-tight">Encrypted checkout</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ─── Ratings & Analytics Section ─── */}
        <section id="reviews" className="mt-24 pt-16 border-t border-[#e9ecef]">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-2xl lg:text-3xl font-heading font-medium uppercase tracking-tight text-[#2c3e50]">Customer Feedback</h2>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-[#e9ecef] to-transparent" />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#f8f9fa] border border-[#e9ecef] rounded-3xl p-8 hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10">
                <DonutChart />
                <div className="w-full max-w-sm">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#2c3e50] mb-4 text-center sm:text-left">Rating Distribution</h4>
                  <RatingBars />
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#e9ecef] rounded-3xl p-8 hover:shadow-lg transition-shadow">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#2c3e50] mb-8 text-center sm:text-left">Quality Metrics</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center">
                {qualityMetrics.map((m) => (
                  <MiniRadial key={m.label} label={m.label} value={m.value} color={m.color} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Related Products Section */}
        {related.length > 0 && (
          <section className="mt-24 pt-16 border-t border-[#e9ecef]">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl lg:text-3xl font-heading font-medium uppercase tracking-tight text-[#2c3e50]">You May Also Like</h2>
              <Link to="/shop" className="text-[#e67586] font-bold text-xs uppercase tracking-[0.2em] hover:text-[#d66576] transition-colors flex items-center gap-2">
                View Collection <ChevronRight size={14} strokeWidth={3} />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
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
