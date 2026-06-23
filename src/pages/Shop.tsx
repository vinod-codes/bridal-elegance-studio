import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/config/firebase";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import SEO from "@/components/SEO";

type SortOption = "default" | "price-asc" | "price-desc" | "newest";

interface Category {
  id: string;
  name: string;
}

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const [sort, setSort] = useState<SortOption>("default");
  const { products, loading } = useProducts();

  // Dynamic categories from Firestore (same collection the admin manages)
  const [categories, setCategories] = useState<Category[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(collection(db, "categories"), orderBy("name", "asc"));
        const snap = await getDocs(q);
        setCategories(snap.docs.map((d) => ({ id: d.id, name: d.data().name })));
      } catch {
        // Fallback without ordering
        try {
          const snap = await getDocs(collection(db, "categories"));
          setCategories(snap.docs.map((d) => ({ id: d.id, name: d.data().name })));
        } catch {
          setCategories([]);
        }
      } finally {
        setCatsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filtered = useMemo(() => {
    let list =
      activeCategory === "all"
        ? products
        : products.filter((p) => p.category === activeCategory);

    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, activeCategory, sort]);

  const catLabel = activeCategory === "all" ? "All Bridal Jewellery" : activeCategory;
  return (
    <div className="min-h-screen">
      <SEO
        title={activeCategory === "all" ? "Shop Bridal Jewellery | Haldi, Mehndi & Wedding | UJS" : `${catLabel} | Bridal Jewellery Online — UJS`}
        description={`Browse ${catLabel.toLowerCase()} — handmade gold-plated bridal jewellery for Haldi, Mehndi & Weddings. Free shipping above ₹999. Shop at UJS.`.slice(0, 158)}
        path={activeCategory === "all" ? "/shop" : `/shop?category=${encodeURIComponent(activeCategory)}`}
        jsonLd={activeCategory === "all" ? {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Handmade Bridal Jewellery Collections",
          "description": "Shop handmade gold-plated bridal jewellery for Indian wedding ceremonies. Collections include Haldi jewelry sets, Mehndi ceremony jewelry, and full wedding bridal sets.",
          "url": "https://www.theujs.com/shop",
          "hasPart": [
            { "@type": "ItemList", "name": "Haldi Jewellery Sets", "url": "https://www.theujs.com/shop?category=Haldimehndi%20Jewellery" },
            { "@type": "ItemList", "name": "Bridal Sets", "url": "https://www.theujs.com/shop?category=Bridal" },
            { "@type": "ItemList", "name": "Earrings", "url": "https://www.theujs.com/shop?category=Earrings" },
            { "@type": "ItemList", "name": "Necklaces", "url": "https://www.theujs.com/shop?category=Necklaces" }
          ]
        } : undefined}
      />
      <AnnouncementBar />
      <Header />
      <main className="container py-10">
        <div className="text-center mb-10">
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-body mb-2">Our Collection</p>
          <h1 className="font-heading text-3xl md:text-5xl font-medium">
            {activeCategory === "all" ? "Handmade Bridal Jewellery" : catLabel}
          </h1>
          {activeCategory === "all" && (
            <p className="mt-3 font-body text-muted-foreground max-w-xl mx-auto text-sm">
              Gold-plated handmade sets for Haldi, Mehndi &amp; Wedding ceremonies — crafted by Indian artisans. Free shipping above ₹999.
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {/* All button */}
            <button
              onClick={() => setSearchParams({})}
              className={`px-4 py-2 rounded-sm text-xs font-body uppercase tracking-wider transition-all ${activeCategory === "all"
                  ? "bg-gold text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-gold/10"
                }`}
            >
              All
            </button>

            {/* Dynamic category buttons from Firestore */}
            {catsLoading ? (
              // Skeleton placeholders while loading
              [...Array(4)].map((_, i) => (
                <div key={i} className="w-24 h-8 rounded-sm bg-muted animate-pulse" />
              ))
            ) : (
              categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSearchParams({ category: cat.name })}
                  className={`px-4 py-2 rounded-sm text-xs font-body uppercase tracking-wider transition-all ${activeCategory === cat.name
                      ? "bg-gold text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-gold/10"
                    }`}
                >
                  {cat.name}
                </button>
              ))
            )}
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

        {/* Product Grid */}
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
          <p className="text-center text-muted-foreground font-body py-16">
            No products found{activeCategory !== "all" ? ` in "${activeCategory}"` : ""}.
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
