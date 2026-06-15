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
    const orders = ordersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(JSON.stringify(orders, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

run();
