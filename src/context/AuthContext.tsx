import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebase";

interface UserProfile {
  uid: string;
  email: string | null;
  name: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours for customer site

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem("user_profile");
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        
        // Background check for profile
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          if (snap.exists()) {
            const data = snap.data();
            const newProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: data.name || firebaseUser.displayName || firebaseUser.email || "User",
              isAdmin: data.isAdmin === true,
            };
            setProfile(newProfile);
            localStorage.setItem("user_profile", JSON.stringify(newProfile));
          }
        } catch (err) {
          console.error("Failed to fetch fresh profile:", err);
        }
      } else {
        setProfile(null);
        localStorage.removeItem("user_profile");
      }
      setLoading(false);
    });

    // Inactivity Detection
    const updateActivity = () => {
      localStorage.setItem("last_active", Date.now().toString());
    };

    const checkIdle = () => {
      const lastActive = parseInt(localStorage.getItem("last_active") || "0");
      if (lastActive && Date.now() - lastActive > INACTIVITY_TIMEOUT) {
        signOut(auth);
        localStorage.clear();
      }
    };

    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("mousedown", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("scroll", updateActivity);

    const idleInterval = setInterval(checkIdle, 5 * 60 * 1000); // Check every 5 mins

    return () => {
      unsubscribe();
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("mousedown", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("scroll", updateActivity);
      clearInterval(idleInterval);
    };
  }, []);

  const logout = async () => {
    await signOut(auth);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
