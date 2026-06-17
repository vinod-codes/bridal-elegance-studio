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
        title="Unique Jewelry Studio | Handmade Bridal Jewellery — Haldi, Mehndi & Wedding Sets India"
        description="Shop handmade bridal jewellery online in India. Gold-plated Haldi, Mehndi & Wedding sets, custom designs, free shipping above ₹999. Trusted by 500+ brides."
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
