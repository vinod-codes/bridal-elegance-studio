import { Link } from "react-router-dom";
import heroBridal from "@/assets/hero-bridal.jpg";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative h-[80vh] md:h-[90vh] overflow-hidden">
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
      {/* Layered gradients for premium depth and readability */}
      <div className="absolute inset-0 bg-gradient-to-l from-foreground/80 via-foreground/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />

      <div className="relative container h-full flex items-center justify-end">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-xl space-y-7 text-right pr-2 md:pr-6"
        >
          {/* Eyebrow with decorative line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-end gap-3"
          >
            <span className="h-px w-12 bg-gold" />
            <p className="text-gold text-xs md:text-sm font-body tracking-[0.4em] uppercase">
              Handcrafted with Love
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="font-heading text-5xl md:text-7xl lg:text-8xl font-light text-primary-foreground leading-[1.05] drop-shadow-lg"
          >
            Unique
            <br />
            <span className="italic font-medium bg-gradient-to-r from-gold-light via-gold to-gold-light bg-clip-text text-transparent">
              Handcrafted
            </span>
            <br />
            <span className="italic font-medium">Studio</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-primary-foreground/90 font-body text-base md:text-lg leading-relaxed max-w-md ml-auto"
          >
            Exquisite handmade jewellery — Necklaces, Earrings, Rings, Bracelets &amp; more. Each piece crafted with love by our talented artisans.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-wrap gap-4 justify-end pt-2"
          >
            <Link
              to="/shop"
              className="bg-gold text-primary-foreground px-9 py-3.5 rounded-sm font-body text-sm tracking-[0.2em] uppercase font-medium btn-glow transition-all hover:opacity-90 hover:scale-[1.02] shadow-lg"
            >
              Shop Now
            </Link>
            <Link
              to="/about"
              className="border border-primary-foreground/60 text-primary-foreground px-9 py-3.5 rounded-sm font-body text-sm tracking-[0.2em] uppercase font-medium hover:bg-primary-foreground/10 hover:border-gold transition-all backdrop-blur-sm"
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
