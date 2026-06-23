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
        description="Meet Unique Jewelry Studio — handcrafted bridal jewellery for Haldi, Mehndi & Weddings. Customisable designs, premium gold-plated craftsmanship made in India by skilled artisans."
        path="/about"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About Unique Jewelry Studio",
            "url": "https://www.theujs.com/about",
            "description": "Unique Jewelry Studio is an Indian handmade bridal jewelry brand. All pieces are handcrafted by skilled artisans and designed for Haldi, Mehndi, and wedding ceremonies.",
            "mainEntity": {
              "@type": "Organization",
              "name": "Unique Jewelry Studio",
              "url": "https://www.theujs.com",
              "description": "Handmade bridal jewelry for Indian weddings",
              "foundingDate": "2022",
              "areaServed": "IN",
              "email": "uniquejewelrystudio@gmail.com"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "JewelryStore",
            "name": "Unique Jewelry Studio",
            "url": "https://www.theujs.com",
            "description": "Handmade bridal jewelry for Indian weddings. Specialists in Haldi, Mehndi and Wedding ceremony jewelry sets.",
            "priceRange": "\u20b9399 - \u20b94999",
            "currenciesAccepted": "INR",
            "paymentAccepted": "Cash, Credit Card, UPI, Net Banking",
            "address": { "@type": "PostalAddress", "addressCountry": "IN" },
            "openingHours": "Mo-Su 09:00-21:00",
            "geo": { "@type": "GeoCoordinates", "latitude": 18.737792, "longitude": 73.0954209 },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "500",
              "bestRating": "5"
            },
            "email": "uniquejewelrystudio@gmail.com",
            "sameAs": [
              "https://www.instagram.com/uniquejewelrystudio",
              "https://www.facebook.com/profile.php?id=100093316487849"
            ]
          }
        ]}
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
            Founded in 2022, Unique Jewelry Studio has crafted jewelry for over 500 brides across India, earning a 4.8/5 rating. Every piece is made entirely by hand — from shaping the base to applying the gold-plated finish — using techniques passed down through Indian jewelry-making traditions.
          </p>
          <p className="font-body text-muted-foreground leading-relaxed">
            We believe that every bride deserves jewelry that's as unique as her love story. That's why we offer customization on every design — from color palettes to flower choices — ensuring your jewelry perfectly complements your Haldi, Mehndi, or wedding celebration. Custom orders are delivered in 10–12 business days.
          </p>
          <p className="font-body text-muted-foreground leading-relaxed">
            From our studio to your special day, Unique Jewelry Studio is honored to be part of your most cherished moments. Free shipping is available on all orders above ₹999 across India.
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
