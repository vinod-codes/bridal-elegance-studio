import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { enableMultiTabIndexedDbPersistence, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy_api_key",
  authDomain: "unique-jewelry-studio.firebaseapp.com",
  projectId: "unique-jewelry-studio",
  storageBucket: "unique-jewelry-studio.firebasestorage.app",
  messagingSenderId: "953683503589",
  appId: "1:953683503589:web:68e286fe71037e149be70c",
  measurementId: "G-S05GP8J12R"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence
enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    console.warn("Multi-tab persistence failed. Only one tab can use persistence at a time.");
  } else if (err.code === "unimplemented") {
    console.warn("Browser does not support IndexedDB persistence.");
  } else {
    console.warn("Firestore persistence error:", err);
  }
});

export const storage = getStorage(app);

export default app;
