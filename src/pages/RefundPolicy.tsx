import Header from "@/components/Header";
import Footer from "@/components/Footer";

const RefundPolicy = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container py-16 max-w-3xl mx-auto space-y-6">
                <h1 className="font-heading text-3xl md:text-4xl font-medium mb-6">Refund Policy</h1>
                <div className="font-body text-muted-foreground space-y-4">
                    <p>We want you to be completely satisfied with your jewelry from Unique Jewelry Studio. Please read our refund policy carefully.</p>
                    <h3 className="text-xl font-medium text-foreground mt-6">Returns</h3>
                    <p>Since our bridal jewelry sets are handcrafted and often customized specifically for you, we only accept returns or refunds if the product arrives damaged or defective. You must contact us within 48 hours of receiving the item with photographic proof of the damage.</p>
                    <h3 className="text-xl font-medium text-foreground mt-6">Cancellations</h3>
                    <p>Orders can only be canceled within 24 hours of placement. Once the crafting process begins, we are unable to process cancellations.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default RefundPolicy;
