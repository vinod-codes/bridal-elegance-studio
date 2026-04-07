import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/config/firebase";
import catNecklaces from "@/assets/cat-haldi.jpg";
import catEarrings from "@/assets/cat-mehndi.jpg";
import catRings from "@/assets/cat-bridal.jpg";
import catBracelets from "@/assets/cat-combos.jpg";

// Assets mapping for core categories
const ASSETS_MAP: Record<string, string> = {
  "Necklaces": catNecklaces,
  "Earrings": catEarrings,
  "Rings": catRings,
  "Bracelets": catBracelets,
};

interface CategoryDoc {
  id: string;
  name: string;
}

const CategorySection = () => {
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(collection(db, "categories"), orderBy("name", "asc"));
        const snap = await getDocs(q);
        const fetched = snap.docs.map((d) => ({ id: d.id, name: d.data().name }));
        
        // If we have categories, use them. Otherwise show nothing or fallback.
        setCategories(fetched);
      } catch (error) {
        console.error("Error fetching categories for home:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return null;
  if (categories.length === 0) return null;

  return (
    <section className="py-16 md:py-24 container">
      <div className="flex items-end justify-between mb-12 gap-6">
        <div className="text-left">
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-body mb-2">Collections</p>
          <h2 className="font-heading text-3xl md:text-4xl font-medium">Shop by Category</h2>
        </div>
        <Link 
          to="/categories" 
          className="group flex items-center gap-2 text-xs font-body tracking-wider uppercase text-foreground hover:text-gold transition-colors"
        >
          View All <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {categories.slice(0, 4).map((cat) => (
          <Link
            key={cat.id}
            to={`/shop?category=${cat.name}`}
            className="group relative aspect-[3/4] rounded-lg overflow-hidden hover-lift bg-muted"
          >
            {ASSETS_MAP[cat.name] ? (
              <img
                src={ASSETS_MAP[cat.name]}
                alt={cat.name}
                loading="lazy"
                width={640}
                height={800}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-6 bg-gold/5">
                 <span className="font-heading text-xl opacity-20">{cat.name}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <h3 className="font-heading text-lg md:text-xl text-primary-foreground font-medium">{cat.name}</h3>
              <span className="text-primary-foreground/70 text-xs font-body tracking-wider uppercase mt-1 inline-block group-hover:text-gold-light transition-colors">
                Explore →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
