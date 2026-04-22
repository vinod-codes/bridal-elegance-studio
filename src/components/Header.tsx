import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { Search, User, ShoppingBag, Menu, X, LogOut, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import headerLogo from "@/assets/header-logo.png";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/categories", label: "Collections" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { toggleCart, totalItems } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await logout();
    setShowUserMenu(false);
    toast.success("Signed out successfully");
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-24 md:h-36 lg:h-40">
        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2 md:static md:transform-none flex-shrink-0 flex items-center justify-center z-10 py-2">
          <img src={headerLogo} alt="Unique Jewelry Studio - Handcrafted Elegance" className="h-20 md:h-32 lg:h-36 w-auto object-contain" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`text-sm font-body tracking-wide transition-colors hover:text-gold ${location.pathname === link.to ? "text-gold font-medium" : "text-foreground"
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

          {/* User menu */}
          <div className="relative hidden md:block">
            {user ? (
              <>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 focus:outline-none"
                  aria-label="Account"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-8 h-8 rounded-full border-2 border-gold object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-gold bg-gold/20 flex items-center justify-center text-gold font-bold text-sm">
                      {(user.displayName || user.email || "U")[0].toUpperCase()}
                    </div>
                  )}
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <p className="px-4 py-1 text-xs font-medium text-gray-700 truncate">
                      {user.displayName || "My Account"}
                    </p>
                    <p className="px-4 pb-1 text-xs text-gray-400 truncate">{user.email}</p>
                    <hr className="my-2" />
                    <Link
                      to="/orders"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Package size={14} /> My Orders
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/auth" className="p-2 text-foreground hover:text-gold transition-colors" aria-label="Sign In">
                <User size={20} />
              </Link>
            )}
          </div>

          {/* Cart */}
          <Link
            to="/cart"
            className="p-2 text-foreground hover:text-gold transition-colors relative"
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gold text-primary-foreground text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
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
            {user ? (
              <>
                <Link
                  to="/orders"
                  className="text-sm font-body tracking-wide py-2 border-b border-border/50 text-foreground hover:text-gold"
                  onClick={() => setMobileOpen(false)}
                >
                  My Orders
                </Link>
                <button
                  onClick={() => { handleSignOut(); setMobileOpen(false); }}
                  className="text-sm font-body text-left py-2 text-red-500"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="text-sm font-body tracking-wide py-2 text-gold font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
