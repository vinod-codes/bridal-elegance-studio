import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/config/firebase";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import catNecklaces from "@/assets/cat-necklaces.jpg";
import catEarrings from "@/assets/cat-earrings-green.png";
import catRings from "@/assets/cat-rings.jpg";
import catBracelets from "@/assets/cat-accessories.png";
import catChokerSets from "@/assets/cat-bridal-new.png";
import catMaangTikka from "@/assets/cat-maang-tikka.jpg";
import catHaldi from "@/assets/cat-haldi-new.png";
import catMehndi from "@/assets/cat-mehndi-new.jpg";
import catCombos from "@/assets/cat-maternity.png";
import catNath from "@/assets/cat-nath.jpg";
import catAntiTarnish from "@/assets/cat-anti-tarnish.png";
import catNavratri from "@/assets/cat-navratri.png";
import catFabric from "@/assets/cat-fabric.png";
import catBabyShower from "@/assets/cat-baby-shower.jpg";

const CATEGORY_METADATA: Record<string, { image: string; description: string }> = {
  "Necklaces": {
    image: catNecklaces,
    description: "Timeless pieces that frame your elegance with intricate craftsmanship.",
  },
  "Earrings": {
    image: catEarrings,
    description: "Delicate details for a radiant glow, from studs to dramatic drops.",
  },
  "Rings": {
    image: catRings,
    description: "Symbols of love and eternal beauty, crafted in premium gold and stones.",
  },
  "Bracelets": {
    image: catBracelets,
    description: "Sophisticated accents for every gesture, designed for modern luxury.",
  },
  "Choker Sets": {
    image: catChokerSets,
    description: "Statement chokers with layered elegance, perfect for bridal grandeur.",
  },
  "Maang Tikka": {
    image: catMaangTikka,
    description: "Graceful headpieces adorned with pearls and kundan for the perfect bridal look.",
  },
  "Haldi Jewelry": {
    image: catHaldi,
    description: "Vibrant marigold-inspired floral jewelry to brighten your Haldi ceremony.",
  },
  "Haldi": {
    image: catHaldi,
    description: "Vibrant marigold-inspired floral jewelry to brighten your Haldi ceremony.",
  },
  "Mehndi Jewelry": {
    image: catMehndi,
    description: "Playful pink and green floral sets to celebrate your Mehndi night.",
  },
  "Mehndi": {
    image: catMehndi,
    description: "Playful pink and green floral sets to celebrate your Mehndi night.",
  },
  "Combos": {
    image: catCombos,
    description: "Heartfelt maternity and family jewelry sets featuring customized tags for a personal touch.",
  },
  "Bridal Sets": {
    image: catChokerSets,
    description: "Exquisite full bridal sets featuring shells and pearls for your most unforgettable day.",
  },
  "Nath": {
    image: catNath,
    description: "Pearl chain nose rings with floral accents, the finishing bridal touch.",
  },
  "Anti tarnish jewellery": {
    image: catAntiTarnish,
    description: "Tarnish-resistant pieces that stay brilliant for years, perfect for daily luxury.",
  },
  "Baby Shower jewellery": {
    image: catBabyShower,
    description: "Adorable and elegant jewelry sets specially designed for traditional baby shower ceremonies.",
  },
  "Fabric jewellery": {
    image: catFabric,
    description: "Artisanal handcrafted fabric and floral jewelry, lightweight and perfect for intimate celebrations.",
  },
  "Haldimehndi Jewellery ": {
    image: catCombos,
    description: "Vibrant yellow and green themed sets for the most joyful moments of your wedding journey.",
  },
  "Navratri jewellery": {
    image: catNavratri,
    description: "Bold and colorful oxidised pieces to celebrate the spirit of Navratri with style.",
  },
};

// Fallback images to cycle through for unknown categories
const FALLBACK_IMAGES = [catNecklaces, catEarrings, catRings, catBracelets, catChokerSets, catMaangTikka, catHaldi, catMehndi, catCombos, catNath];

interface CategoryDoc {
  id: string;
  name: string;
  imageUrl?: string;
  productCount?: number;
}

const Categories = () => {
  const { products, loading: productsLoading } = useProducts();
  const [dbCategories, setDbCategories] = useState<CategoryDoc[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchCategories = async () => {
      try {
        const q = query(collection(db, "categories"), orderBy("name", "asc"));
        const snap = await getDocs(q);
        const fetched = snap.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
          imageUrl: d.data().imageUrl,
          productCount: d.data().productCount || 0,
        }));
        setDbCategories(fetched);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const loading = productsLoading || categoriesLoading;

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--gold)/0.05),transparent_50%)]" />
          <div className="container relative z-10 text-center">
            <p className="text-gold text-xs tracking-[0.4em] uppercase font-body mb-4 animate-fade-in">Our Collections</p>
            <h1 className="font-heading text-4xl md:text-6xl font-medium tracking-tight mb-6">Explore the Artistry</h1>
            <p className="max-w-2xl mx-auto text-muted-foreground font-body leading-relaxed md:text-lg">
              Each piece in our boutique is meticulously curated to tell a unique story of heritage, love, and timeless elegance.
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="container pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {dbCategories.map((cat, index) => {
              const metadata = CATEGORY_METADATA[cat.name] || {
                image: FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
                description: "Discover our premium collection of artisanal jewelry.",
              };
              
              const displayImage = cat.imageUrl || metadata.image;

              return (
                <div
                  key={cat.id}
                  className="group relative"
                  onMouseEnter={() => setHoveredCategory(cat.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link to={`/shop?category=${cat.name}`} className="block">
                    <div className="aspect-[16/9] md:aspect-[4/3] overflow-hidden rounded-2xl relative shadow-2xl transition-all duration-500 group-hover:shadow-gold/10">
                      <img
                        src={displayImage}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                      <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                        <div className="overflow-hidden mb-2">
                          <span className="inline-block text-gold-light text-xs font-body tracking-[0.2em] uppercase transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 delay-100">
                            {categoryCounts[cat.name] || cat.productCount || 0} Pieces
                          </span>
                        </div>
                        <h2 className="font-heading text-3xl md:text-4xl text-primary-foreground font-medium mb-3">
                          {cat.name}
                        </h2>
                        <p className="text-primary-foreground/80 font-body text-sm md:text-base max-w-sm transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-200 line-clamp-2">
                          {metadata.description}
                        </p>

                        <div className="mt-6 flex items-center gap-2 text-gold group-hover:text-gold-light transition-colors transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-300">
                          <span className="text-sm font-body tracking-wider uppercase">View Collection</span>
                          <div className="h-[1px] w-8 bg-current transition-all duration-500 group-hover:w-12" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Featured Preview Section */}
        <section className="bg-muted/30 py-24">
          <div className="container">
            <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
              <div className="max-w-xl">
                <p className="text-gold text-xs tracking-[0.3em] uppercase font-body mb-2">Handpicked</p>
                <h2 className="font-heading text-3xl md:text-4xl font-medium">New Arrivals in Jewelry</h2>
              </div>
              <Link
                to="/shop"
                className="group flex items-center gap-3 text-sm font-body tracking-wider uppercase text-foreground hover:text-gold transition-colors"
              >
                Explore Full Shop
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {products.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Categories;
