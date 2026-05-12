import { Shield, Truck, Heart, Headphones } from "lucide-react";

const badges = [
  { icon: Shield, title: "Secure Payment", desc: "100% secure checkout" },
  { icon: Truck, title: "Complimentary Shipping", desc: "On orders above ₹999" },
  { icon: Heart, title: "Handmade Quality", desc: "Crafted with love" },
  { icon: Headphones, title: "24/7 Support", desc: "Always here for you" },
];

const TrustBadges = () => {
  return (
    <section className="py-16 container">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {badges.map((badge) => (
          <div key={badge.title} className="text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-blush flex items-center justify-center">
              <badge.icon size={24} className="text-gold" />
            </div>
            <h4 className="font-heading text-base font-semibold">{badge.title}</h4>
            <p className="text-sm text-muted-foreground font-body">{badge.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustBadges;
