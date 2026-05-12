import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import FeaturedProducts from "@/components/FeaturedProducts";
import TrustBadges from "@/components/TrustBadges";
import GoogleReviews from "@/components/GoogleReviews";
import VideoGallery from "@/components/VideoGallery";
import Footer from "@/components/Footer";
import CoursePromoBanner from "@/components/CoursePromoBanner";

const Index = () => {
  return (
    <div className="min-h-screen">
      <AnnouncementBar />
      <Header />
      <main>
        <HeroSection />
        <CategorySection />
        <FeaturedProducts />
        <TrustBadges />
        <VideoGallery />
        <GoogleReviews />
        <CoursePromoBanner />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
