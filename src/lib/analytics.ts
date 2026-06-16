// Google Analytics 4 helper
// Measurement ID: G-DM5TJ68X5N

export const GA_MEASUREMENT_ID = "G-DM5TJ68X5N";

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

function gtagSafe(...args: any[]) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === "function") {
    window.gtag(...args);
  } else {
    // Queue until gtag.js loads
    window.dataLayer.push(args);
  }
}

export function trackPageView(path: string, title?: string) {
  gtagSafe("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: title || document.title,
    send_to: GA_MEASUREMENT_ID,
  });
}

interface AnyProduct {
  id: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  category?: string;
}

export function trackViewItem(p: AnyProduct, variantName?: string) {
  const price = p.discountPrice ?? p.price;
  gtagSafe("event", "view_item", {
    currency: "INR",
    value: price,
    items: [
      {
        item_id: p.id,
        item_name: p.name,
        item_category: p.category,
        item_variant: variantName,
        price,
        quantity: 1,
      },
    ],
  });
}

export function trackAddToCart(p: AnyProduct, quantity: number, variantName?: string) {
  const price = p.discountPrice ?? p.price;
  gtagSafe("event", "add_to_cart", {
    currency: "INR",
    value: price * quantity,
    items: [
      {
        item_id: p.id,
        item_name: p.name,
        item_category: p.category,
        item_variant: variantName,
        price,
        quantity,
      },
    ],
  });
}

export function trackBeginCheckout(
  items: Array<{ product: AnyProduct; quantity: number; variantName?: string }>,
  value: number
) {
  gtagSafe("event", "begin_checkout", {
    currency: "INR",
    value,
    items: items.map(({ product, quantity, variantName }) => ({
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      item_variant: variantName,
      price: product.discountPrice ?? product.price,
      quantity,
    })),
  });
}

export function trackPurchase(orderId: string, value: number, items: any[] = [], shipping = 0) {
  gtagSafe("event", "purchase", {
    transaction_id: orderId,
    currency: "INR",
    value,
    shipping,
    items: items.map((it) => ({
      item_id: it.productId || it.id,
      item_name: it.name,
      item_variant: it.variantName || undefined,
      price: it.price,
      quantity: it.quantity,
    })),
  });
}
