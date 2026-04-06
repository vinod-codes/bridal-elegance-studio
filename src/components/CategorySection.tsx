import { Link } from "react-router-dom";
import catHaldi from "@/assets/cat-haldi.jpg";
import catMehndi from "@/assets/cat-mehndi.jpg";
import catBridal from "@/assets/cat-bridal.jpg";
import catCombos from "@/assets/cat-combos.jpg";

const cats = [
  { image: catHaldi, label: "Haldi Jewelry", slug: "haldi" },
  { image: catMehndi, label: "Mehndi Jewelry", slug: "mehndi" },
  { image: catBridal, label: "Bridal Sets", slug: "bridal" },
  { image: catCombos, label: "Combos", slug: "combo" },
];

const CategorySection = () => {
  return (
    <section className="py-16 md:py-24 container">
      <div className="text-center mb-12">
        <p className="text-gold text-xs tracking-[0.3em] uppercase font-body mb-2">Collections</p>
        <h2 className="font-heading text-3xl md:text-4xl font-medium">Shop by Occasion</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {cats.map((cat) => (
          <Link
            key={cat.slug}
            to={`/shop?category=${cat.slug}`}
            className="group relative aspect-[3/4] rounded-lg overflow-hidden hover-lift"
          >
            <img
              src={cat.image}
              alt={cat.label}
              loading="lazy"
              width={640}
              height={800}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <h3 className="font-heading text-lg md:text-xl text-primary-foreground font-medium">{cat.label}</h3>
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
