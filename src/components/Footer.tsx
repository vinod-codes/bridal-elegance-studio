import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";
import ujsWordmark from "@/assets/ujs-wordmark.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground/80">
      <div className="container py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="space-y-4">
          <Link to="/" className="inline-flex items-center gap-3">
            <img src="/logo.png" alt="Unique Jewelry Studio" className="h-20 md:h-24 object-contain" />
            <img src={ujsWordmark} alt="UJS" className="h-10 md:h-12 object-contain brightness-150" />
          </Link>
          <p className="text-sm font-body leading-relaxed text-primary-foreground/60">
            Handcrafted bridal jewelry for your most cherished moments. Each piece is made with love and attention to detail.
          </p>
          <div className="flex gap-3">
            {[
              { Icon: Instagram, href: "#" },
              { Icon: Facebook, href: "https://www.facebook.com/profile.php?id=100093316487849&ref=NONE_xav_ig_profile_page_web#" },
            ].map(({ Icon, href }, i) => (
              <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-heading text-lg font-medium text-primary-foreground mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm font-body">
            {["Home", "Shop", "About"].map((l) => (
              <li key={l}><Link to={`/${l === "Home" ? "" : l.toLowerCase()}`} className="hover:text-gold transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-heading text-lg font-medium text-primary-foreground mb-4">Categories</h4>
          <ul className="space-y-2 text-sm font-body">
            {[
              { label: "Haldi Jewelry", cat: "haldi" },
              { label: "Mehndi Jewelry", cat: "mehndi" },
              { label: "Bridal Sets", cat: "bridal" },
              { label: "Combos", cat: "combo" },
            ].map((c) => (
              <li key={c.cat}><Link to={`/shop?category=${c.cat}`} className="hover:text-gold transition-colors">{c.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact & Policies */}
        <div>
          <h4 className="font-heading text-lg font-medium text-primary-foreground mb-4">Contact</h4>
          <ul className="space-y-3 text-sm font-body">
            <li className="flex items-center gap-2"><Mail size={14} className="text-gold" /> uniquejewelrystudio@gmail.com</li>
            <li className="flex items-center gap-2"><Phone size={14} className="text-gold" /> +91 98765 43210</li>
          </ul>
          <h4 className="font-heading text-lg font-medium text-primary-foreground mt-6 mb-3">Policies</h4>
          <ul className="space-y-2 text-sm font-body">
            {[
              { label: "Privacy Policy", path: "/privacy" },
              { label: "Refund Policy", path: "/refund" },
              { label: "Shipping Policy", path: "/shipping" }
            ].map((p) => (
              <li key={p.label}><Link to={p.path} className="hover:text-gold transition-colors">{p.label}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-6">
        <p className="text-center text-xs font-body text-primary-foreground/40">
          © 2026 Unique Jewelry Studio. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
