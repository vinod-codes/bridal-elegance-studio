import { useState } from "react";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");

  return (
    <section className="py-20 bg-blush/40">
      <div className="container max-w-xl text-center space-y-6">
        <p className="text-gold text-xs tracking-[0.3em] uppercase font-body">Stay Connected</p>
        <h2 className="font-heading text-3xl md:text-4xl font-medium">Join Our Bridal Circle</h2>
        <p className="text-muted-foreground font-body text-sm leading-relaxed">
          Get exclusive access to new collections, bridal styling tips, and special offers.
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); setEmail(""); }}
          className="flex gap-2 max-w-md mx-auto"
        >
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-background border border-border rounded-sm px-4 py-3 text-sm font-body focus:outline-none focus:ring-1 focus:ring-gold"
            required
          />
          <button
            type="submit"
            className="bg-gold text-primary-foreground px-6 py-3 rounded-sm text-sm font-body font-medium tracking-wider uppercase btn-glow hover:opacity-90 transition-all"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSection;
