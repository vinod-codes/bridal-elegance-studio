import Header from "@/components/Header";
import Footer from "@/components/Footer";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container py-16 max-w-3xl mx-auto px-4">
        <h1 className="font-heading text-3xl md:text-4xl font-medium mb-2">Refund &amp; Return Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: April 2025</p>

        <div className="font-body text-muted-foreground space-y-8">
          <p className="text-base leading-relaxed">
            At <strong className="text-foreground">Unique Jewellery Studio</strong>, every piece is handcrafted with love and care. We want you to be completely happy with your purchase. Please read the policy below before placing your order.
          </p>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-medium text-foreground">1. Our Return Policy</h2>
            <p>
              Because our jewellery is handmade and often made-to-order, we generally do <strong className="text-foreground">not accept returns or exchanges</strong> for change of mind. However, we do accept returns in the following cases:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The item arrived <strong className="text-foreground">damaged or broken</strong> during shipping.</li>
              <li>The item you received is <strong className="text-foreground">different from what you ordered</strong> (wrong product/colour).</li>
              <li>The item has a clear <strong className="text-foreground">manufacturing defect</strong>.</li>
            </ul>
            <p>
              To be eligible, you must contact us within <strong className="text-foreground">48 hours</strong> of delivery with clear photographs/video showing the damage or issue. Items must be unused, unworn, and in their original packaging.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-medium text-foreground">2. How to Request a Return</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Email us at <a href="mailto:uniquejewellerystudio2@gmail.com" className="text-gold underline">uniquejewellerystudio2@gmail.com</a> or WhatsApp us with your order number.</li>
              <li>Attach clear photos or a short video clearly showing the problem.</li>
              <li>Our team will review your request within <strong className="text-foreground">2 business days</strong> and confirm if your return is approved.</li>
              <li>Once approved, we will share the return shipping address. Please use a trackable shipping method.</li>
            </ol>
            <p className="text-sm bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-amber-700">
              ⚠️ Returns sent without prior approval will not be accepted. Please contact us first.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-medium text-foreground">3. Refunds</h2>
            <p>
              Once we receive and inspect the returned item, we will notify you. If approved, your refund will be processed within <strong className="text-foreground">5–7 business days</strong> to your original payment method (credit/debit card, UPI, etc.).
            </p>
            <p>
              Shipping charges are non-refundable unless the return is due to our error (e.g., wrong item sent). If you receive a refund, an amount equal to the original shipping cost will be deducted from your refund.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-medium text-foreground">4. Order Cancellations</h2>
            <p>
              Cancellations are accepted <strong className="text-foreground">within 24 hours</strong> of placing your order, provided the item has not yet entered the crafting process. To cancel, contact us immediately via WhatsApp or email with your order number.
            </p>
            <p>
              Once crafting has begun, cancellations cannot be accepted as the materials have already been sourced and work has started on your piece.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-medium text-foreground">5. Exchanges</h2>
            <p>
              We do not offer direct exchanges at this time. If you would like a different item, please place a new order and initiate a return for the original (if eligible under our policy above).
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-medium text-foreground">6. Non-Returnable Items</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Custom / personalised jewellery made to your specifications</li>
              <li>Items that have been worn, used, or altered</li>
              <li>Items returned without prior approval</li>
              <li>Sale or clearance items (marked "Final Sale")</li>
            </ul>
          </section>

          {/* Contact */}
          <section className="bg-stone-50 border border-border rounded-lg p-6 space-y-2">
            <h2 className="text-lg font-medium text-foreground">Need Help?</h2>
            <p>
              We are always here to help. If you have any questions about your order or our policy, please reach out:
            </p>
            <p>📧 <a href="mailto:uniquejewellerystudio2@gmail.com" className="text-gold underline">uniquejewellerystudio2@gmail.com</a></p>
            <p>📱 WhatsApp / Call: Available on our contact page</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
