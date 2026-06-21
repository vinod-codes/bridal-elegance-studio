import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const KundanPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Kundan Jewellery Collection | Unique Jewelry Studio" 
        description="Luxurious Kundan Jewellery sets featuring intricate craftsmanship and royal elegance." 
        path="/collections/kundan-jewellery" 
      />
      <Header />
      <main className="flex-grow container py-16 mx-auto px-4 text-center">
        <h1 className="font-heading text-4xl font-medium mb-6 text-foreground">Kundan Jewellery</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
          Experience the royal charm of our Kundan Jewellery collection, featuring timeless elegance and intricate craftsmanship.
        </p>
        <Link to="/shop?category=Kundan" className="inline-flex items-center gap-2 text-gold hover:underline font-medium">
          <ArrowLeft size={16} /> Explore Collection in Shop
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default KundanPage;
