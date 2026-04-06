const messages = [
  "✨ Free Shipping above ₹999",
  "💍 Handmade Bridal Jewelry",
  "🎨 Custom Orders Available",
];

const AnnouncementBar = () => {
  return (
    <div className="bg-gold py-2 overflow-hidden">
      <div className="announcement-scroll whitespace-nowrap flex gap-16">
        {[...messages, ...messages].map((msg, i) => (
          <span key={i} className="text-primary-foreground text-xs font-body tracking-widest uppercase">
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBar;
