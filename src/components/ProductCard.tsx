import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import type { FirestoreProduct } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";

interface Props {
  product: FirestoreProduct;
}

const ProductCard = ({ product }: Props) => {
  const { addToCart } = useCart();
  const displayPrice = product.discountPrice ?? product.price;
  const originalPrice = product.discountPrice ? product.price : null;
  const discount = originalPrice && product.discountPrice
    ? Math.round(((originalPrice - product.discountPrice) / originalPrice) * 100)
    : 0;

  const displayImage = product.media?.[0]?.medium || product.images?.[0] || product.image || "/placeholder.jpg";

  return (
    <div className="group hover-lift rounded-lg overflow-hidden bg-card">
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden">
        <img
          src={displayImage}
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
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
            <span className="text-white font-body text-sm font-medium tracking-widest uppercase">Out of Stock</span>
          </div>
        )}
      </Link>
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-heading text-lg font-medium text-foreground leading-tight mb-1 group-hover:text-gold transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Color Variants Indicators */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex gap-1.5 mb-2 mt-1">
            {product.variants.slice(0, 5).map((v) => (
              <div 
                key={v.id} 
                className="w-3 h-3 rounded-full border border-foreground/10" 
                style={{ backgroundColor: v.colorHex }}
                title={v.colorName}
              />
            ))}
            {product.variants.length > 5 && (
              <span className="text-[10px] text-muted-foreground">+{product.variants.length - 5}</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className="font-body font-semibold text-foreground">₹{displayPrice}</span>
          {originalPrice && (
            <span className="font-body text-sm text-muted-foreground line-through">₹{originalPrice}</span>
          )}
        </div>
        <button
          onClick={() => addToCart(product)}
          disabled={product.stock === 0}
          className="w-full flex items-center justify-center gap-2 bg-gold text-primary-foreground py-2.5 rounded-sm text-sm font-body font-medium tracking-wide uppercase transition-all hover:opacity-90 btn-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingBag size={16} />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
