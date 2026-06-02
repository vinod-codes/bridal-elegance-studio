import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy, where } from "firebase/firestore";

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

async function test() {
  try {
    const q1 = query(collection(db, "categories"), orderBy("name", "asc"));
    const snap1 = await getDocs(q1);
    console.log("Categories count:", snap1.docs.length);
  } catch (e) {
    console.error("Category error:", e);
  }

  try {
    const q2 = query(
      collection(db, "products"),
      where("isVisible", "==", true),
      orderBy("createdAt", "desc")
    );
    const snap2 = await getDocs(q2);
    console.log("Products count:", snap2.docs.length);
  } catch (e) {
    console.error("Product error:", e);
  }
}

test();
