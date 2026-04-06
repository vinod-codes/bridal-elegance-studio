import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  const { addToCart } = useCart();
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="group hover-lift rounded-lg overflow-hidden bg-card">
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={640}
          height={640}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-gold text-primary-foreground text-[10px] uppercase tracking-widest font-medium px-3 py-1 rounded-sm">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-[10px] uppercase tracking-wider font-medium px-2 py-1 rounded-sm">
            -{discount}%
          </span>
        )}
      </Link>
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-heading text-lg font-medium text-foreground leading-tight mb-1 group-hover:text-gold transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-body font-semibold text-foreground">₹{product.price}</span>
          {product.originalPrice > product.price && (
            <span className="font-body text-sm text-muted-foreground line-through">₹{product.originalPrice}</span>
          )}
        </div>
        <button
          onClick={() => addToCart(product)}
          className="w-full flex items-center justify-center gap-2 bg-gold text-primary-foreground py-2.5 rounded-sm text-sm font-body font-medium tracking-wide uppercase transition-all hover:opacity-90 btn-glow"
        >
          <ShoppingBag size={16} />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
