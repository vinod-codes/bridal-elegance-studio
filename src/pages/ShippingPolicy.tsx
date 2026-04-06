import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ShippingPolicy = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container py-16 max-w-3xl mx-auto space-y-6">
                <h1 className="font-heading text-3xl md:text-4xl font-medium mb-6">Shipping Policy</h1>
                <div className="font-body text-muted-foreground space-y-4">
                    <p>Thank you for choosing Unique Jewelry Studio. Here is what you need to know about our shipping procedures.</p>
                    <h3 className="text-xl font-medium text-foreground mt-6">Processing Time</h3>
                    <p>Each jewelry piece is handmade to order. Please allow 5-7 business days for crafting your unique pieces before they are dispatched.</p>
                    <h3 className="text-xl font-medium text-foreground mt-6">Shipping Rates & Estimates</h3>
                    <p>We offer standard and expedited shipping options. Standard shipping usually takes 3-5 business days within the domestic network. Shipping charges will be calculated and displayed at checkout.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ShippingPolicy;
