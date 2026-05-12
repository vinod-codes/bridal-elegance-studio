import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, query, orderBy, where, Timestamp } from "firebase/firestore";
import { db } from "@/config/firebase";

// Firestore product shape — must match what admin saves
export interface FirestoreProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null; 
  discountPrice?: number | null; 
  category: string;       
  stock: number;
  images?: string[];      
  image?: string;         // fallback
  description?: string;
  material?: string;
  badge?: string;
  inStock?: boolean;
  isVisible?: boolean;
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected';
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

/** Fetch ALL products from Firestore, ordered by creation time */
export function useProducts() {
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      try {
        const q = query(collection(db, "products"), where("isVisible", "==", true), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        if (!cancelled) {
          const allProducts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreProduct));
          setProducts(allProducts.filter(p => p.approvalStatus === 'Approved' || !p.approvalStatus));
        }
      } catch (error: unknown) {
        // Fallback without ordering if index doesn't exist yet
        try {
          const fallbackQ = query(collection(db, "products"), where("isVisible", "==", true));
          const snap = await getDocs(fallbackQ);
          if (!cancelled) {
            const allProducts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreProduct));
            // Only show Approved products (or those without a status yet to maintain backward compatibility)
            setProducts(allProducts.filter(p => p.approvalStatus === 'Approved' || !p.approvalStatus));
          }
        } catch (fallbackErr: unknown) {
          if (!cancelled) {
            const message = fallbackErr instanceof Error ? fallbackErr.message : "An unknown error occurred";
            setError(message);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, []);

  return { products, loading, error };
}

/** Fetch a single product by its Firestore document ID */
export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<FirestoreProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (!cancelled) {
          setProduct(snap.exists() ? ({ id: snap.id, ...snap.data() } as FirestoreProduct) : null);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "An unknown error occurred";
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [id]);

  return { product, loading, error };
}
