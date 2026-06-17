import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import heroBridal from "@/assets/hero-bridal.jpg";
const About = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="About Unique Jewelry Studio | Handmade Bridal Jewellery Brand India"
        description="Meet Unique Jewelry Studio — handcrafted bridal jewellery for Haldi, Mehndi & Weddings. Customisable designs, premium gold-plated craftsmanship made in India."
        path="/about"
      />
      <AnnouncementBar />
      <Header />
      <main>
        <section className="relative h-[40vh] overflow-hidden">
          <img src={heroBridal} alt="About UJS" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-foreground/50" />
          <div className="relative container h-full flex items-center justify-center text-center">
            <h1 className="font-heading text-4xl md:text-5xl text-primary-foreground font-medium">Our Story</h1>
          </div>
        </section>
        <section className="container py-16 max-w-3xl mx-auto space-y-6 text-center">
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-body">Handcrafted with Love</p>
          <h2 className="font-heading text-2xl md:text-3xl font-medium">About Unique Jewelry Studio</h2>
          <p className="font-body text-muted-foreground leading-relaxed">
            At Unique Jewelry Studio, every piece of jewelry is a labor of love. We specialize in handmade bridal jewelry designed for Haldi, Mehndi, and wedding ceremonies. Our artisans craft each piece with meticulous attention to detail, blending traditional Indian artistry with contemporary elegance.
          </p>
          <p className="font-body text-muted-foreground leading-relaxed">
            We believe that every bride deserves jewelry that's as unique as her love story. That's why we offer customization on every design — from color palettes to flower choices — ensuring your jewelry perfectly complements your celebration.
          </p>
          <p className="font-body text-muted-foreground leading-relaxed">
            From our studio to your special day, Unique Jewelry Studio is honored to be part of your most cherished moments.
          </p>
        </section>

        <section className="container py-16 mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-medium text-center mb-10">Visit Our Studio</h2>
          <div className="w-full h-96 bg-muted relative rounded-lg overflow-hidden shadow-lg border border-border">
            <iframe
              src="https://maps.google.com/maps?q=18.737792,73.0954209&z=15&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
