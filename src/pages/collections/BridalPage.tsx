import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const BridalPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Bridal Jewellery Sets | Unique Jewelry Studio" 
        description="Explore premium handcrafted bridal jewellery sets for Indian weddings. High quality, stunning designs." 
        path="/collections/bridal-jewellery-sets" 
      />
      <Header />
      <main className="flex-grow container py-16 mx-auto px-4 text-center">
        <h1 className="font-heading text-4xl font-medium mb-6 text-foreground">Bridal Jewellery Sets</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
          Make your wedding day unforgettable with our exquisite bridal jewellery sets, crafted with precision and elegance.
        </p>
        <Link to="/shop?category=Bridal" className="inline-flex items-center gap-2 text-gold hover:underline font-medium">
          <ArrowLeft size={16} /> Explore Collection in Shop
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default BridalPage;
