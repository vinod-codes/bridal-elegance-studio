import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, getDocs, collection } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: "www.theujs.com",
  projectId: "unique-jewelry-studio",
  storageBucket: "unique-jewelry-studio.firebasestorage.app",
  messagingSenderId: "953683503589",
  appId: "1:953683503589:web:68e286fe71037e149be70c",
  measurementId: "G-S05GP8J12R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function run() {
  try {
    await signInWithEmailAndPassword(auth, "audit-admin@theujs.com", "AuditAdmin123!");
    const productsSnap = await getDocs(collection(db, "products"));
    
    console.log("=== PRICING AUDIT ===");
    let anomaliesCount = 0;
    
    productsSnap.docs.forEach(doc => {
      const p = doc.data();
      const price = Number(p.price);
      const discountPrice = p.discountPrice !== undefined && p.discountPrice !== null ? Number(p.discountPrice) : null;
      
      // Check for negative prices
      if (price < 0) {
        console.log(`❌ NEGATIVE PRICE: Product "${p.name}" [${doc.id}] has price ${price}`);
        anomaliesCount++;
      }
      
      if (discountPrice !== null) {
        if (discountPrice < 0) {
          console.log(`❌ NEGATIVE DISCOUNT PRICE: Product "${p.name}" [${doc.id}] has discountPrice ${discountPrice}`);
          anomaliesCount++;
        }
        
        // Check if discountPrice is greater than or equal to original price
        if (discountPrice >= price) {
          console.log(`❌ INVALID DISCOUNT: Product "${p.name}" [${doc.id}] has discountPrice (${discountPrice}) >= price (${price})`);
          anomaliesCount++;
        }
        
        // Check for suspicious discount prices (e.g. 1 rupee or 0)
        if (discountPrice <= 5) {
          console.log(`⚠️ SUSPICIOUS LOW PRICE: Product "${p.name}" [${doc.id}] has discountPrice ${discountPrice}`);
          anomaliesCount++;
        }
      }
      
      // Check main price
      if (price <= 5) {
        console.log(`⚠️ SUSPICIOUS LOW PRICE: Product "${p.name}" [${doc.id}] has price ${price}`);
        anomaliesCount++;
      }

      // Check variants
      if (p.variants) {
        p.variants.forEach((v, vIdx) => {
          const vPrice = Number(v.price);
          if (vPrice <= 5) {
            console.log(`⚠️ SUSPICIOUS VARIANT PRICE: Product "${p.name}" [${doc.id}], Variant index ${vIdx} has price ${vPrice}`);
            anomaliesCount++;
          }
          if (vPrice < 0) {
            console.log(`❌ NEGATIVE VARIANT PRICE: Product "${p.name}" [${doc.id}], Variant index ${vIdx} has price ${vPrice}`);
            anomaliesCount++;
          }
        });
      }
    });
    
    console.log(`\nAudit completed. Total anomalies found: ${anomaliesCount}`);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

run();
