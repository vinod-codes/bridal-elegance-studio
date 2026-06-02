import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/config/firebase";
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
import catHaldiMehndi from "@/assets/cat-haldi-mehndi.png";
import catKundan from "@/assets/cat-kundan.jpeg";
import catPearls from "@/assets/cat-pearls.jpeg";

const ASSETS_MAP: Record<string, string> = {
  "Necklaces": catNecklaces,
  "Earrings": catEarrings,
  "Rings": catRings,
  "Bracelets": catBracelets,
  "Choker Sets": catChokerSets,
  "Maang Tikka": catMaangTikka,
  "Haldi Jewelry": catHaldi,
  "Mehndi Jewelry": catMehndi,
  "Combos": catCombos,
  "Nath": catNath,
  "Bridal Sets": catChokerSets,
  "Haldi": catHaldi,
  "Mehndi": catMehndi,
  "Anti tarnish jewellery": catAntiTarnish,
  "Baby Shower jewellery": catBabyShower,
  "Fabric jewellery": catFabric,
  "Haldimehndi Jewellery ": catHaldiMehndi,
  "Haldimehndi Jewellery": catHaldiMehndi,
  "Navratri jewellery": catNavratri,
  "Kundan Jewellery": catKundan,
  "Pearls Jewellery": catPearls,
};

// Fallback images consistent with Categories page
const FALLBACK_IMAGES = [catNecklaces, catEarrings, catRings, catBracelets, catChokerSets, catMaangTikka, catHaldi, catMehndi, catCombos, catNath];

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
        {categories.slice(0, 4).map((cat, index) => {
          const image = resolveCategoryImage(cat.name) || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
          
          return (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.name}`}
              className="group relative aspect-[3/4] rounded-lg overflow-hidden hover-lift bg-muted"
            >
              <img
                src={image}
                alt={cat.name}
                loading="lazy"
                width={640}
                height={800}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <h3 className="font-heading text-lg md:text-xl text-primary-foreground font-medium">{cat.name}</h3>
                <span className="text-primary-foreground/70 text-xs font-body tracking-wider uppercase mt-1 inline-block group-hover:text-gold-light transition-colors">
                  Explore →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CategorySection;
