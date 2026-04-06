import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { products } from "@/data/products";

const FeaturedProducts = () => {
  const featured = products.slice(0, 8);

  return (
    <section className="py-16 md:py-24 bg-blush/30">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-body mb-2">Curated for You</p>
          <h2 className="font-heading text-3xl md:text-4xl font-medium">Bestsellers</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            to="/shop"
            className="inline-block border-2 border-gold text-gold px-10 py-3 rounded-sm font-body text-sm tracking-widest uppercase font-medium hover:bg-gold hover:text-primary-foreground transition-all"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
