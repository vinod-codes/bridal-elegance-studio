import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import logo from "@/assets/logo.png";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/shop?category=haldi", label: "Haldi Jewelry" },
  { to: "/shop?category=mehndi", label: "Mehndi Jewelry" },
  { to: "/shop?category=bridal", label: "Bridal Sets" },
  { to: "/shop?category=combo", label: "Custom Orders" },
  { to: "/about", label: "About" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toggleCart, totalItems } = useCart();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img src={logo} alt="Unique Jewelry Studio" className="h-10 md:h-14 w-auto" width={800} height={512} />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`text-sm font-body tracking-wide transition-colors hover:text-gold ${
                location.pathname === link.to ? "text-gold font-medium" : "text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-foreground hover:text-gold transition-colors" aria-label="Search">
            <Search size={20} />
          </button>
          <button className="p-2 text-foreground hover:text-gold transition-colors hidden md:block" aria-label="Account">
            <User size={20} />
          </button>
          <button
            className="p-2 text-foreground hover:text-gold transition-colors relative"
            onClick={toggleCart}
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gold text-primary-foreground text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-border animate-fade-in">
          <nav className="container py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm font-body tracking-wide py-2 border-b border-border/50 text-foreground hover:text-gold"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
