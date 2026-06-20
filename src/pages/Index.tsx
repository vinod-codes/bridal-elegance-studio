import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import FeaturedProducts from "@/components/FeaturedProducts";
import TrustBadges from "@/components/TrustBadges";
import GoogleReviews from "@/components/GoogleReviews";
import VideoGallery from "@/components/VideoGallery";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";


const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="Handmade Bridal Jewellery India | Unique Jewelry Studio"
        description="Shop handmade bridal jewellery online — Haldi, Mehndi & Wedding sets. Gold-plated, custom designs. Free shipping above ₹999. Trusted by 500+ brides."
        path="/"
      />
      <AnnouncementBar />
      <Header />
      <main>
        <HeroSection />
        <CategorySection />
        <FeaturedProducts />
        <TrustBadges />
        <VideoGallery />
        <GoogleReviews />
        
      </main>
      <Footer />
    </div>
  );
};

export default Index;
