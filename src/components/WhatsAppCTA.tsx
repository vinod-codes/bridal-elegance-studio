import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "919999999999"; // TODO: replace with real UJS WhatsApp number
const MESSAGE = encodeURIComponent(
  "Hi Unique Jewellery Studio! I'd like help choosing the perfect bridal set."
);

const WhatsAppCTA = () => (
  <a
    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${MESSAGE}`}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with us on WhatsApp"
    className="fixed bottom-5 right-5 z-[9999] flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
    onClick={() => {
      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        window.gtag("event", "contact_whatsapp", { method: "whatsapp" });
      }
    }}
  >
    <MessageCircle className="h-5 w-5" />
    <span className="hidden sm:inline text-sm font-medium">Chat with us</span>
  </a>
);

export default WhatsAppCTA;
