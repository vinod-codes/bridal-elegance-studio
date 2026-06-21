import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const HaldiPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Haldi Jewellery Collection | Unique Jewelry Studio" 
        description="Shop our exclusive Haldi Jewellery collection for your special day. Handmade floral and gold-plated sets." 
        path="/collections/haldi-jewellery" 
      />
      <Header />
      <main className="flex-grow container py-16 mx-auto px-4 text-center">
        <h1 className="font-heading text-4xl font-medium mb-6 text-foreground">Haldi Jewellery</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
          Discover our beautiful collection of Haldi Jewellery, featuring bright floral motifs and elegant gold-plated designs to make you shine on your special day.
        </p>
        <Link to="/shop?category=Haldi" className="inline-flex items-center gap-2 text-gold hover:underline font-medium">
          <ArrowLeft size={16} /> Explore Collection in Shop
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default HaldiPage;
