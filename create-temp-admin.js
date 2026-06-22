import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDocs, collection } from "firebase/firestore";

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

const email = "audit-admin@theujs.com";
const password = "AuditAdmin123!";

async function run() {
  try {
    let user;
    console.log("📝 Registering new audit admin user...");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user = userCredential.user;
      console.log("✅ User registered. UID:", user.uid);
    } catch (createErr) {
      if (createErr.code === "auth/email-already-in-use") {
        console.log("ℹ️ User already exists. Signing in instead...");
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
        console.log("✅ Signed in. UID:", user.uid);
      } else {
        throw createErr;
      }
    }

    console.log("🔥 Elevating privileges to isAdmin=true...");
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      name: "Audit Admin",
      isAdmin: true,
      createdAt: new Date().toISOString()
    }, { merge: true });
    console.log("✅ Elevated privileges!");

    console.log("\n=== PRODUCTS ===");
    const productsSnap = await getDocs(collection(db, "products"));
    console.log(`Total Products: ${productsSnap.docs.length}`);

    console.log("\n=== ORDERS ===");
    const ordersSnap = await getDocs(collection(db, "orders"));
    console.log(`Total Orders: ${ordersSnap.docs.length}`);
    
    // Sort and analyze orders
    const orders = ordersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    orders.forEach((o, index) => {
      console.log(`[${index + 1}/${orders.length}] Order ID: ${o.id}`);
      console.log(`  User: ${o.userEmail || o.userId}`);
      console.log(`  Amount (totalAmount): ${o.totalAmount}`);
      console.log(`  Amount (totalPrice): ${o.totalPrice}`);
      console.log(`  Status: ${o.status}`);
      console.log(`  Payment ID (paymentId): ${o.paymentId}`);
      console.log(`  Payment ID (razorpayPaymentId): ${o.razorpayPaymentId}`);
      console.log(`  Order ID (razorpayOrderId): ${o.razorpayOrderId || o.orderId}`);
      if (o.items) {
        console.log("  Items:");
        o.items.forEach(item => {
          console.log(`    - ${item.name} | qty: ${item.quantity} | price: ${item.price} | originalPrice: ${item.originalPrice}`);
        });
      }
      console.log("----------------------------------------");
    });
    
  } catch (e) {
    console.error("❌ Execution failed:", e);
  } finally {
    process.exit(0);
  }
}

run();
