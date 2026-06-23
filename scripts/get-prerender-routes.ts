// scripts/get-prerender-routes.ts
// Returns the full list of routes to prerender at build time.
//
// Static routes (home, shop, collections, policy pages) are hardcoded.
// Dynamic /product/:id routes are expanded by fetching visible product IDs from
// Firestore (same query the sitemap generator uses; products collection is public-read).
//
// Used by vite.config.ts to feed vite-plugin-prerender.
//
// Environment: needs FIREBASE_API_KEY in env (reads from .env via dotenv).
// Falls back to static-only routes if Firestore is unreachable, so the build never
// fails on a network/permission blip — better a partial prerender than a broken deploy.

import "dotenv/config";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: "www.theujs.com",
  projectId: "unique-jewelry-studio",
  storageBucket: "unique-jewelry-studio.firebasestorage.app",
  messagingSenderId: "953683503589",
  appId: "1:953683503589:web:68e286fe71037e149be70c",
};

// Indexable static routes. Mirrors App.tsx routes minus the ones robots.txt blocks
// (cart, checkout, auth, my-orders, order-success) — those should NOT be prerendered
// because they are noindex and contain no SEO value.
export const STATIC_ROUTES = [
  "/",
  "/shop",
  "/categories",
  "/collections/haldi-jewellery",
  "/collections/mehndi-jewellery",
  "/collections/bridal-jewellery-sets",
  "/collections/temple-jewellery",
  "/collections/kundan-jewellery",
  "/collections/artificial-jewellery",
  "/about",
  "/shipping",
  "/refund",
  "/privacy",
];

async function getProductRoutes(): Promise<string[]> {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const snap = await getDocs(
      query(collection(db, "products"), where("isVisible", "==", true))
    );
    const routes: string[] = [];
    snap.docs.forEach((d) => {
      const data = d.data() as { approvalStatus?: string };
      const status = (data.approvalStatus || "").toString().toLowerCase();
      // Only prerender approved products — avoids caching unreviewed/rejected items.
      if (status && status !== "approved") return;
      routes.push(`/product/${d.id}`);
    });
    console.log(`  [prerender] + ${routes.length} product routes from Firestore`);
    return routes;
  } catch (err) {
    console.warn(
      "  [prerender] Firestore product fetch failed — falling back to static routes only.",
      (err as Error).message
    );
    return [];
  }
}

export async function getPrerenderRoutes(): Promise<string[]> {
  const productRoutes = await getProductRoutes();
  return [...STATIC_ROUTES, ...productRoutes];
}

// Allow direct CLI invocation for debugging: `npx tsx scripts/get-prerender-routes.ts`
// ESM-safe check (no `require` — project is type:module).
const isMainModule =
  import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}` ||
  process.argv[1]?.endsWith("get-prerender-routes.ts");

if (isMainModule) {
  getPrerenderRoutes().then((routes) => {
    console.log("\nPrerender routes (" + routes.length + "):");
    routes.forEach((r) => console.log("  " + r));
    process.exit(0);
  });
}
