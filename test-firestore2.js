import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy, where } from "firebase/firestore";

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

async function test() {
  try {
    const q2 = query(
      collection(db, "products")
    );
    const snap2 = await getDocs(q2);
    
    let approved = 0;
    let pending = 0;
    let rejected = 0;
    let none = 0;
    let visible = 0;
    let notVisible = 0;

    snap2.docs.forEach(doc => {
      const data = doc.data();
      if (data.approvalStatus === "Approved") approved++;
      else if (data.approvalStatus === "Pending") pending++;
      else if (data.approvalStatus === "Rejected") rejected++;
      else none++;

      if (data.isVisible === true) visible++;
      else notVisible++;
    });

    console.log(`Total: ${snap2.docs.length}`);
    console.log(`Approved: ${approved}, Pending: ${pending}, Rejected: ${rejected}, None: ${none}`);
    console.log(`Visible: ${visible}, Not Visible: ${notVisible}`);
  } catch (e) {
    console.error("Product error:", e);
  }
}

test();
