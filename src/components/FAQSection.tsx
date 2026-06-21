import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "Do you offer custom bridal jewelry?",
    answer: "Yes! Unique Jewelry Studio offers fully custom bridal jewelry for Haldi, Mehndi, and wedding ceremonies. Contact us at uniquejewellerystudio2@gmail.com for custom orders."
  },
  {
    question: "What is the shipping policy?",
    answer: "We offer free shipping on orders above ₹999 across India. Standard shipping takes 5-7 business days after the product has been crafted."
  },
  {
    question: "Is the jewellery skin-friendly?",
    answer: "Yes, our pieces use skin-friendly materials. However, customers with severe metal allergies are advised to contact us before ordering to discuss specific material requirements."
  },
  {
    question: "Do you accept returns or exchanges?",
    answer: "Because our jewellery is handmade and often made-to-order, we generally do not accept returns for change of mind. We do accept returns if the item arrives damaged or is incorrect. Please contact us within 48 hours of delivery."
  },
  {
    question: "Do you ship internationally?",
    answer: "At this time, we only ship across India. If you are outside India and interested in placing a bulk order, please contact us directly."
  },
  {
    question: "Can I cancel my order?",
    answer: "Cancellations are accepted within 24 hours of placing your order, provided the item has not yet entered the crafting process."
  },
  {
    question: "How long does crafting take?",
    answer: "Since all our jewellery is made by hand, each order requires 5–7 business days to craft. For custom or personalised orders, crafting may take up to 10–12 business days."
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="py-16 container max-w-4xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="text-center mb-10">
        <p className="text-gold text-xs tracking-[0.3em] uppercase font-body mb-2">Got Questions?</p>
        <h2 className="font-heading text-3xl md:text-4xl font-medium">Frequently Asked Questions</h2>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-border rounded-lg bg-background overflow-hidden">
            <button
              className="w-full px-6 py-4 flex justify-between items-center text-left focus:outline-none hover:bg-muted/50 transition-colors"
              onClick={() => toggleFaq(index)}
            >
              <span className="font-medium font-heading">{faq.question}</span>
              {openIndex === index ? <ChevronUp size={20} className="text-gold" /> : <ChevronDown size={20} className="text-muted-foreground" />}
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4 pt-2 text-muted-foreground font-body text-sm animate-in slide-in-from-top-2 duration-300">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
