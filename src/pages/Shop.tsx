import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";

type SortOption = "default" | "price-asc" | "price-desc" | "newest";

// These slugs map to the category values stored by the admin panel
const categories = [
  { slug: "Necklaces", label: "Necklaces" },
  { slug: "Rings", label: "Rings" },
  { slug: "Earrings", label: "Earrings" },
  { slug: "Bracelets", label: "Bracelets" },
] as const;

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const [sort, setSort] = useState<SortOption>("default");
  const { products, loading } = useProducts();

  const filtered = useMemo(() => {
    let list = activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    // "newest" is already the default order from the hook (ordered by createdAt desc)
    return list;
  }, [products, activeCategory, sort]);

  return (
    <div className="min-h-screen">
      <AnnouncementBar />
      <Header />
      <main className="container py-10">
        <div className="text-center mb-10">
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-body mb-2">Our Collection</p>
          <h1 className="font-heading text-3xl md:text-5xl font-medium">Shop All Jewelry</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSearchParams({})}
              className={`px-4 py-2 rounded-sm text-xs font-body uppercase tracking-wider transition-all ${
                activeCategory === "all" ? "bg-gold text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-gold/10"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSearchParams({ category: cat.slug })}
                className={`px-4 py-2 rounded-sm text-xs font-body uppercase tracking-wider transition-all ${
                  activeCategory === cat.slug ? "bg-gold text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-gold/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="bg-muted text-foreground px-4 py-2 rounded-sm text-xs font-body uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="default">Best Selling</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">New Arrivals</option>
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-center text-muted-foreground font-body py-16">No products found in this category.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
