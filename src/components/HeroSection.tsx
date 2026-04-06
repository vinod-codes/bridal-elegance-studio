import { Link } from "react-router-dom";
import heroBridal from "@/assets/hero-bridal.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-[70vh] md:h-[85vh] overflow-hidden">
      <img
        src={heroBridal}
        alt="Unique Jewelry Studio - Handmade Bridal Jewelry"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/30 to-transparent" />
      <div className="relative container h-full flex items-center">
        <div className="max-w-lg space-y-6">
          <p className="text-gold-light text-sm font-body tracking-[0.3em] uppercase">Handcrafted with Love</p>
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-light text-primary-foreground leading-[1.1]">
            Your Dream <br />
            <span className="italic font-medium">Bridal Jewelry</span>
          </h1>
          <p className="text-primary-foreground/80 font-body text-base md:text-lg leading-relaxed">
            Exquisite handmade jewelry for Haldi, Mehndi & Wedding ceremonies. Each piece tells your story.
          </p>
          <div className="flex gap-4">
            <Link
              to="/shop"
              className="bg-gold text-primary-foreground px-8 py-3 rounded-sm font-body text-sm tracking-widest uppercase font-medium btn-glow transition-all hover:opacity-90"
            >
              Shop Now
            </Link>
            <Link
              to="/shop?category=bridal"
              className="border border-primary-foreground/50 text-primary-foreground px-8 py-3 rounded-sm font-body text-sm tracking-widest uppercase font-medium hover:bg-primary-foreground/10 transition-all"
            >
              Customize
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
