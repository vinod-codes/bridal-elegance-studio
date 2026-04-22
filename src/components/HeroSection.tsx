import { Link } from "react-router-dom";
import heroBridal from "@/assets/hero-bridal.jpg";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative h-[70vh] md:h-[85vh] overflow-hidden">
      <motion.img
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        src={heroBridal}
        alt="Unique Jewellery Studio - Handcrafted Jewellery"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-gradient-to-l from-foreground/70 via-foreground/40 to-transparent" />
      <div className="relative container h-full flex items-center justify-end">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-lg space-y-6 text-right"
        >
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-gold-light text-sm font-body tracking-[0.3em] uppercase"
          >
            Handcrafted with Love
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="font-heading text-4xl md:text-6xl lg:text-7xl font-light text-primary-foreground leading-[1.1]"
          >
            Unique <br />
            <span className="italic font-medium">Handcrafted Studio</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="text-primary-foreground/80 font-body text-base md:text-lg leading-relaxed"
          >
            Exquisite handmade jewellery — Necklaces, Earrings, Rings, Bracelets &amp; more. Each piece crafted with love by our talented artisans.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
            className="flex gap-4 justify-end"
          >
            <Link
              to="/shop"
              className="bg-gold text-primary-foreground px-8 py-3 rounded-sm font-body text-sm tracking-widest uppercase font-medium btn-glow transition-all hover:opacity-90"
            >
              Shop Now
            </Link>
            <Link
              to="/about"
              className="border border-primary-foreground/50 text-primary-foreground px-8 py-3 rounded-sm font-body text-sm tracking-widest uppercase font-medium hover:bg-primary-foreground/10 transition-all"
            >
              Discover
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
