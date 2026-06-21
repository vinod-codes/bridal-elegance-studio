import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ArtificialPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Artificial Jewellery Collection | Unique Jewelry Studio" 
        description="High-quality artificial and imitation jewellery. Affordable, beautiful, and perfect for every occasion." 
        path="/collections/artificial-jewellery" 
      />
      <Header />
      <main className="flex-grow container py-16 mx-auto px-4 text-center">
        <h1 className="font-heading text-4xl font-medium mb-6 text-foreground">Artificial Jewellery</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
          Discover our stunning range of high-quality artificial jewellery that brings you luxury at accessible prices.
        </p>
        <Link to="/shop?category=Artificial" className="inline-flex items-center gap-2 text-gold hover:underline font-medium">
          <ArrowLeft size={16} /> Explore Collection in Shop
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default ArtificialPage;
