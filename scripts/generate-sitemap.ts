// Generates public/sitemap.xml at build time.
// Pulls live product + category list from Firestore using the client SDK
// (the products collection is publicly readable per Firestore rules).
//
// Runs via `predev` and `prebuild` npm scripts.

import { writeFileSync } from "fs";
import { resolve } from "path";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

const BASE_URL = "https://www.theujs.com";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: "www.theujs.com",
  projectId: "unique-jewelry-studio",
  storageBucket: "unique-jewelry-studio.firebasestorage.app",
  messagingSenderId: "953683503589",
  appId: "1:953683503589:web:68e286fe71037e149be70c",
};

interface Entry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  lastmod?: string;
}

const staticEntries: Entry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/shop", changefreq: "daily", priority: "0.9" },
  { path: "/categories", changefreq: "weekly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.5" },
  { path: "/shipping", changefreq: "monthly", priority: "0.4" },
  { path: "/refund", changefreq: "monthly", priority: "0.4" },
  { path: "/privacy", changefreq: "monthly", priority: "0.3" },
];

function xml(entries: Entry[]): string {
  const today = new Date().toISOString().split("T")[0];
  const urls = entries.map((e) => {
    const parts = [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      `    <lastmod>${e.lastmod || today}</lastmod>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ].filter(Boolean);
    return parts.join("\n");
  });
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

async function main() {
  const entries: Entry[] = [...staticEntries];

  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Products
    const productsSnap = await getDocs(
      query(collection(db, "products"), where("isVisible", "==", true))
    );
    productsSnap.docs.forEach((d) => {
      const data = d.data() as { approvalStatus?: string };
      const status = (data.approvalStatus || "").toString().toLowerCase();
      if (status && status !== "approved") return;
      entries.push({
        path: `/product/${d.id}`,
        changefreq: "weekly",
        priority: "0.8",
      });
    });
    console.log(`  + ${productsSnap.size} product URLs`);

    // Categories → /shop?category=Name
    try {
      const catsSnap = await getDocs(collection(db, "categories"));
      catsSnap.docs.forEach((d) => {
        const name = (d.data() as { name?: string }).name;
        if (!name) return;
        entries.push({
          path: `/shop?category=${encodeURIComponent(name)}`,
          changefreq: "weekly",
          priority: "0.7",
        });
      });
      console.log(`  + ${catsSnap.size} category URLs`);
    } catch (err) {
      console.warn("  (categories fetch failed — skipping)", (err as Error).message);
    }
  } catch (err) {
    console.warn("Sitemap: Firestore fetch failed; writing static-only sitemap.", (err as Error).message);
  }

  writeFileSync(resolve("public/sitemap.xml"), xml(entries));
  console.log(`sitemap.xml written (${entries.length} entries)`);
  // Force-exit because the Firebase SDK keeps the event loop alive.
  process.exit(0);
}

main().catch((e) => {
  console.error("Sitemap generation failed:", e);
  // Don't fail the build — fall back to whatever sitemap.xml already exists.
  process.exit(0);
});
