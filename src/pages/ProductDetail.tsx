import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { ShoppingBag, Minus, Plus, ChevronLeft } from "lucide-react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const { product, loading } = useProduct(id);
  const { products: allProducts } = useProducts();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  if (loading) {
    return (
      <div className="min-h-screen">
        <AnnouncementBar />
        <Header />
        <main className="container py-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="aspect-square rounded-lg bg-muted animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-6 bg-muted rounded animate-pulse w-1/4" />
              <div className="h-24 bg-muted rounded animate-pulse" />
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
        <main className="container py-8">
          <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gold font-body mb-6">
            <ChevronLeft size={16} /> Back to Shop
          </Link>
          <div className="flex items-center justify-center py-24">
            <p className="text-muted-foreground font-body">Product not found.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const isOutOfStock = product.stock === 0;

  return (
    <div className="min-h-screen">
      <AnnouncementBar />
      <Header />
      <main className="container py-8">
        <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gold font-body mb-6">
          <ChevronLeft size={16} /> Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Image */}
          <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" width={640} height={640} />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
                <span className="text-white font-body text-lg font-medium tracking-widest uppercase">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {product.badge && (
              <span className="bg-gold text-primary-foreground text-[10px] uppercase tracking-widest font-medium px-3 py-1 rounded-sm">
                {product.badge}
              </span>
            )}
            <h1 className="font-heading text-3xl md:text-4xl font-medium leading-tight">{product.name}</h1>
            <div className="flex items-baseline gap-3">
              <span className="font-heading text-2xl text-gold font-semibold">₹{product.price}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-muted-foreground line-through font-body">₹{product.originalPrice}</span>
                  <span className="text-sm text-accent-foreground bg-accent px-2 py-0.5 rounded-sm font-body">{discount}% off</span>
                </>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground font-body leading-relaxed">{product.description}</p>
            )}

            <div className="bg-blush/50 p-4 rounded-lg">
              <p className="font-heading text-sm font-semibold mb-1">Category</p>
              <p className="text-sm font-body text-muted-foreground capitalize">{product.category}</p>
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              {!isOutOfStock && (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-body text-muted-foreground">Quantity:</span>
                  <div className="flex items-center border border-border rounded-sm">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-muted"><Minus size={16} /></button>
                    <span className="px-4 font-body font-medium">{qty}</span>
                    <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="p-2 hover:bg-muted"><Plus size={16} /></button>
                  </div>
                  <span className="text-xs text-muted-foreground font-body">{product.stock} in stock</span>
                </div>
              )}
              <button
                onClick={() => { if (!isOutOfStock) { for (let i = 0; i < qty; i++) addToCart(product); } }}
                disabled={isOutOfStock}
                className="w-full flex items-center justify-center gap-2 bg-gold text-primary-foreground py-3.5 rounded-sm font-body font-medium tracking-widest uppercase btn-glow hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={18} />
                {isOutOfStock ? "Out of Stock" : `Add to Cart — ₹${product.price * qty}`}
              </button>
            </div>

            <p className="text-xs text-muted-foreground font-body text-center">
              🎨 Want customization?{" "}
              <a href="#" className="text-gold underline">Contact us on WhatsApp</a>
            </p>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-heading text-2xl font-medium mb-8 text-center">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
