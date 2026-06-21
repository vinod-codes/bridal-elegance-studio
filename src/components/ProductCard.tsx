import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import type { FirestoreProduct } from "@/hooks/useProducts";
import QuantityModal from "@/components/QuantityModal";
import { Heart } from "lucide-react";

interface Props {
  product: FirestoreProduct;
}

const ProductCard = ({ product }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAnimatingWishlist, setIsAnimatingWishlist] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const displayPrice = product.discountPrice ?? product.price;
  const originalPrice = product.discountPrice ? product.price : null;
  const discount =
    originalPrice && product.discountPrice
      ? Math.round(((originalPrice - product.discountPrice) / originalPrice) * 100)
      : 0;

  const displayImage =
    product.media?.[0]?.medium ||
    product.images?.[0] ||
    product.image ||
    "/placeholder.jpg";

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isWishlisted) {
      setIsAnimatingWishlist(true);
      setTimeout(() => setIsAnimatingWishlist(false), 300);
    }
    setIsWishlisted(!isWishlisted);
  };

  return (
    <>
      <div className="group hover-lift rounded-lg overflow-hidden bg-card flex flex-col h-full border border-transparent hover:border-gold/20 transition-all duration-300 shadow-sm hover:shadow-md">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted/20">
          <Link to={`/product/${product.id}`} className="block w-full h-full">
            <img
              src={displayImage}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </Link>
          
          {product.badge && (
            <span className="absolute top-3 left-3 bg-gold text-primary-foreground text-[10px] uppercase tracking-widest font-medium px-2.5 py-1 rounded-sm shadow-sm">
              {product.badge}
            </span>
          )}
          
          <button 
            onClick={toggleWishlist}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-transform duration-300 hover:scale-110 ${isAnimatingWishlist ? 'scale-125' : ''}`}
            aria-label="Add to Wishlist"
          >
            <Heart 
              size={16} 
              className={`transition-colors duration-300 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
            />
            {isAnimatingWishlist && (
              <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-20"></span>
            )}
          </button>

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center backdrop-blur-[1px]">
              <span className="text-white font-body text-sm font-medium tracking-widest uppercase bg-black/50 px-4 py-2 rounded-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <Link to={`/product/${product.id}`} className="mt-1">
            <h3 className="font-heading text-[15px] font-medium text-foreground leading-snug group-hover:text-gold transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-2 mt-2 mb-1.5">
            <span className="font-body font-semibold text-foreground">₹{displayPrice}</span>
            {originalPrice && (
              <span className="font-body text-xs text-muted-foreground line-through">
                ₹{originalPrice}
              </span>
            )}
            {discount > 0 && (
              <span className="text-[10px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                {discount}% OFF
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 mb-2.5">
            <div className="flex text-gold text-[10px]">
              ★★★★★
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">(4.8)</span>
          </div>

          <div className="text-[11px] text-muted-foreground mt-auto mb-4 flex items-center gap-1.5">
            <span className="font-medium text-foreground/70">Anti Tarnish</span>
            <span className="w-1 h-1 rounded-full bg-border"></span>
            <span className="font-medium text-foreground/70">Lightweight</span>
          </div>

          <button
            ref={btnRef}
            onClick={(e) => {
              e.preventDefault();
              setIsModalOpen(true);
            }}
            disabled={product.stock === 0}
            className="w-full h-10 border border-gold/30 text-gold font-body font-medium text-xs tracking-widest uppercase rounded-sm hover:bg-gold hover:text-primary-foreground transition-all duration-300 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gold"
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>

      <QuantityModal 
        product={product} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        triggerRect={btnRef.current?.getBoundingClientRect() || null}
      />
    </>
  );
};

export default ProductCard;
