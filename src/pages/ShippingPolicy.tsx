import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container py-16 max-w-3xl mx-auto px-4">
        <h1 className="font-heading text-3xl md:text-4xl font-medium mb-2">Shipping Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: April 2025</p>

        <div className="font-body text-muted-foreground space-y-8">
          <p className="text-base leading-relaxed">
            Thank you for shopping at <strong className="text-foreground">Unique Jewellery Studio</strong>. Every piece of jewellery is handcrafted with patience and love. Please read our shipping policy so you know exactly when to expect your order.
          </p>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-medium text-foreground">1. Processing Time</h2>
            <p>
              Since all our jewellery is <strong className="text-foreground">made by hand</strong>, each order requires <strong className="text-foreground">5–7 business days</strong> to craft before it is ready to ship. For custom or personalised orders, crafting may take up to <strong className="text-foreground">10–12 business days</strong>.
            </p>
            <p>
              You will receive a WhatsApp/email notification once your order has been dispatched, along with a tracking number.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-medium text-foreground">2. Shipping Rates</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted text-foreground">
                  <tr>
                    <th className="text-left p-3 font-semibold">Order Value</th>
                    <th className="text-left p-3 font-semibold">Shipping Charge</th>
                    <th className="text-left p-3 font-semibold">Estimated Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="p-3">Below ₹999</td>
                    <td className="p-3">₹50 (standard)</td>
                    <td className="p-3">5–7 business days</td>
                  </tr>
                  <tr className="border-t border-border bg-green-50/50">
                    <td className="p-3 font-medium text-foreground">₹999 and above</td>
                    <td className="p-3 font-medium text-green-700">Complimentary Shipping 🎉</td>
                    <td className="p-3">5–7 business days</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm">
              Shipping charges are calculated and displayed at checkout before you confirm payment.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-medium text-foreground">3. Delivery Locations</h2>
            <p>
              We currently ship <strong className="text-foreground">across India</strong>. We use trusted courier partners (such as Delhivery, Shiprocket, or similar) to ensure your order arrives safely.
            </p>
            <p>
              At this time, we do not offer international shipping. If you are outside India and interested in ordering, please contact us directly.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-medium text-foreground">4. Order Tracking</h2>
            <p>
              Once your order is shipped, you will receive a tracking number via email/WhatsApp. You can use this to track your package on the courier's website.
            </p>
            <p>
              If you haven't received a tracking update within <strong className="text-foreground">8 business days</strong> of placing your order, please reach out to us and we'll look into it right away.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-medium text-foreground">5. Delays &amp; Lost Parcels</h2>
            <p>
              While we do our best to fulfill orders on time, delays can occasionally occur due to high demand, festivals, or courier disruptions. We appreciate your patience.
            </p>
            <p>
              If your parcel is lost or significantly delayed (beyond <strong className="text-foreground">15 days</strong> from dispatch), please contact us immediately. We will coordinate with the courier and arrange a replacement or refund as appropriate.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-medium text-foreground">6. Packaging</h2>
            <p>
              Your jewellery will arrive in our <strong className="text-foreground">signature gift-ready packaging</strong> — carefully wrapped and boxed to keep your precious pieces safe during transit. Perfect for gifting too! 🎁
            </p>
          </section>

          {/* Contact */}
          <section className="bg-stone-50 border border-border rounded-lg p-6 space-y-2">
            <h2 className="text-lg font-medium text-foreground">Questions about your shipment?</h2>
            <p>We're happy to help. Reach us at:</p>
            <p>📧 <a href="mailto:uniquejewellerystudio2@gmail.com" className="text-gold underline">uniquejewellerystudio2@gmail.com</a></p>
            <p>📱 WhatsApp / Call: Available on our contact page</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingPolicy;
