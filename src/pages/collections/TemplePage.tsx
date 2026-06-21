import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TemplePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Temple Jewellery Collection | Unique Jewelry Studio" 
        description="Traditional South Indian Temple Jewellery. Antique gold finish necklaces, earrings, and more." 
        path="/collections/temple-jewellery" 
      />
      <Header />
      <main className="flex-grow container py-16 mx-auto px-4 text-center">
        <h1 className="font-heading text-4xl font-medium mb-6 text-foreground">Temple Jewellery</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
          Embrace tradition with our intricately designed Temple Jewellery, inspired by the rich heritage of South India.
        </p>
        <Link to="/shop?category=Temple" className="inline-flex items-center gap-2 text-gold hover:underline font-medium">
          <ArrowLeft size={16} /> Explore Collection in Shop
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default TemplePage;
