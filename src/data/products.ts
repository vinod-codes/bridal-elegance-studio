import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import product7 from "@/assets/product-7.jpg";
import product8 from "@/assets/product-8.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  category: "haldi" | "mehndi" | "bridal" | "combo";
  description: string;
  inStock: boolean;
  badge?: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Marigold Haldi Earrings",
    price: 499,
    originalPrice: 899,
    image: product1,
    category: "haldi",
    description: "Handmade floral earrings with fresh marigold-inspired design, perfect for your Haldi ceremony.",
    inStock: true,
    badge: "Bestseller",
  },
  {
    id: "2",
    name: "Pink Blossom Mehndi Necklace",
    price: 799,
    originalPrice: 1299,
    image: product2,
    category: "mehndi",
    description: "Elegant pink floral necklace with pearl drops, handcrafted for Mehndi celebrations.",
    inStock: true,
    badge: "New",
  },
  {
    id: "3",
    name: "Royal Kundan Bridal Choker",
    price: 1499,
    originalPrice: 2499,
    image: product3,
    category: "bridal",
    description: "Stunning red and gold kundan choker set, a showstopper for your wedding day.",
    inStock: true,
    badge: "Premium",
  },
  {
    id: "4",
    name: "Haldi Floral Bangle Set",
    price: 399,
    originalPrice: 699,
    image: product4,
    category: "haldi",
    description: "Delicate floral bangles with yellow and white flowers, ideal for Haldi events.",
    inStock: true,
  },
  {
    id: "5",
    name: "Pearl Maang Tikka Set",
    price: 599,
    originalPrice: 999,
    image: product5,
    category: "bridal",
    description: "Exquisite pearl and flower maang tikka with matching earrings for the modern bride.",
    inStock: true,
  },
  {
    id: "6",
    name: "Emerald Jhumka Earrings",
    price: 649,
    originalPrice: 1099,
    image: product6,
    category: "mehndi",
    description: "Traditional green and gold jhumka earrings, handcrafted for mehndi festivities.",
    inStock: true,
    badge: "Trending",
  },
  {
    id: "7",
    name: "Complete Bridal Set",
    price: 2999,
    originalPrice: 4999,
    image: product7,
    category: "combo",
    description: "Full bridal jewelry set including necklace, earrings, tikka, and bangles in red and gold.",
    inStock: true,
    badge: "Value Pack",
  },
  {
    id: "8",
    name: "Pearl Chain Nath",
    price: 449,
    originalPrice: 799,
    image: product8,
    category: "bridal",
    description: "Beautiful pearl chain nose ring with floral accent, perfect for bridal looks.",
    inStock: true,
  },
];

export const categories = [
  { slug: "haldi", label: "Haldi Jewelry" },
  { slug: "mehndi", label: "Mehndi Jewelry" },
  { slug: "bridal", label: "Bridal Sets" },
  { slug: "combo", label: "Combos" },
] as const;
