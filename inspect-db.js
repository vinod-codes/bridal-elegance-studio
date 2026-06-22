import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function inspect() {
  try {
    console.log("🔑 Authenticating as admin...");
    await signInWithEmailAndPassword(auth, "vinodmanjula08@gmail.com", "Admin@123456");
    console.log("✅ Authenticated successfully!");

    console.log("=== PRODUCTS ===");
    const productsSnap = await getDocs(collection(db, "products"));
    console.log(`Total Products: ${productsSnap.docs.length}`);
    productsSnap.docs.forEach(d => {
      const p = d.data();
      console.log(`- [${d.id}] ${p.name}: price=${p.price}, discountPrice=${p.discountPrice}, stock=${p.stock}`);
      if (p.variants) {
        p.variants.forEach(v => {
          console.log(`   * Variant: price=${v.price}, stock=${v.stock}, color=${v.colorName}`);
        });
      }
    });

    console.log("\n=== ORDERS ===");
    const ordersSnap = await getDocs(collection(db, "orders"));
    console.log(`Total Orders: ${ordersSnap.docs.length}`);
    ordersSnap.docs.forEach(d => {
      const o = d.data();
      console.log(`- [${d.id}] User: ${o.userEmail || o.userId}, Total: ${o.totalAmount || o.totalPrice}, Status: ${o.status}, PaymentID: ${o.paymentId || o.razorpayPaymentId}, OrderID: ${o.razorpayOrderId || o.orderId}`);
      if (o.items) {
        o.items.forEach(item => {
          console.log(`   * Item: ${item.name}, Price: ${item.price}, Qty: ${item.quantity}`);
        });
      }
    });
    
  } catch (e) {
    console.error("Error inspecting:", e);
  } finally {
    process.exit(0);
  }
}

inspect();
