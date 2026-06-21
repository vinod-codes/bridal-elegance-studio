import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const MehndiPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Mehndi Jewellery Collection | Unique Jewelry Studio" 
        description="Shop beautiful Mehndi Jewellery sets. Perfect green and gold combinations for your Mehndi ceremony." 
        path="/collections/mehndi-jewellery" 
      />
      <Header />
      <main className="flex-grow container py-16 mx-auto px-4 text-center">
        <h1 className="font-heading text-4xl font-medium mb-6 text-foreground">Mehndi Jewellery</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
          Complete your Mehndi look with our handcrafted jewellery sets, blending traditional motifs with vibrant colours.
        </p>
        <Link to="/shop?category=Mehndi" className="inline-flex items-center gap-2 text-gold hover:underline font-medium">
          <ArrowLeft size={16} /> Explore Collection in Shop
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default MehndiPage;
