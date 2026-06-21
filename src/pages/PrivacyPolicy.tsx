import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <SEO 
                title="Privacy Policy | Unique Jewelry Studio" 
                description="Privacy policy describing how your personal information is collected, used, and shared." 
                path="/privacy" 
            />
            <Header />
            <main className="flex-grow container py-16 max-w-3xl mx-auto space-y-6">
                <h1 className="font-heading text-3xl md:text-4xl font-medium mb-6">Privacy Policy</h1>
                <div className="font-body text-muted-foreground space-y-4">
                    <p>At Unique Jewelry Studio, your privacy is our priority. This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our site.</p>
                    <h3 className="text-xl font-medium text-foreground mt-6">Personal Information We Collect</h3>
                    <p>When you make a purchase or attempt to make a purchase, we collect certain information from you, including your name, billing address, shipping address, payment information, email address, and phone number.</p>
                    <h3 className="text-xl font-medium text-foreground mt-6">How Do We Use Your Personal Information?</h3>
                    <p>We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).</p>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
