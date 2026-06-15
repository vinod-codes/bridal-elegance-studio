import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, getDocs, collection } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQyGmqPwOE08baGIhvm9slnYvX43oIyqI",
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
    const ordersSnap = await getDocs(collection(db, "orders"));
    ordersSnap.docs.forEach((doc) => {
      const data = doc.data();
      const keys = Object.keys(data).filter(k => k !== 'items');
      console.log(`Order ${doc.id}:`);
      keys.forEach(k => {
        console.log(`  ${k}: ${JSON.stringify(data[k])}`);
      });
      console.log(`  Items Count: ${data.items ? data.items.length : 0}`);
      console.log("--------------------------------");
    });
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

run();
