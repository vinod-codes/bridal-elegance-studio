import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";

export interface ProductVariant {
  id: string;
  variantName?: string;
  colorName?: string;
  colorHex?: string;
  price?: number;
  originalPrice?: number;
  discountPrice?: number;
  sku?: string;
  previewImage?: string;
  galleryImages?: string[];
  images?: string[];
  size?: string;
  inventory?: number;
  stock?: number;
  status?: string;
}

export interface FirestoreProduct {
  id: string;
  name: string;
  subtitle?: string;
  /** The original MRP (Maximum Retail Price) of the product */
  price: number;
  /** Legacy field for original price. Prefer `price` for MRP. */
  originalPrice?: number | null;
  /** The actual selling price (sale price) of the product */
  discountPrice?: number | null;
  category: string;
  stock?: number;
  inventory?: number;
  images?: string[];
  image?: string;
  description?: string;
  material?: string;
  badge?: string;
  highlights?: string[];
  specifications?: Array<{ label: string; value: string }>;
  inStock?: boolean;
  isVisible?: boolean;
  approvalStatus?: "Pending" | "Approved" | "Rejected";
  variants?: ProductVariant[];
  media?: Array<{ small?: string; medium?: string; large?: string; original?: string }>;
  deliveryConfig?: {
    useGlobalDelivery?: boolean;
    customDeliveryCharge?: number;
    freeDelivery?: boolean;
  };
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

const mapSnapshotToProducts = (snap: any) =>
  snap.docs
    .map((doc: any) => ({ id: doc.id, ...doc.data() } as FirestoreProduct))
    .filter((product) => product.approvalStatus === "Approved" || !product.approvalStatus);

export function useProducts() {
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simple query: only where("isVisible","==",true) — NO composite index required.
    // Sorting by createdAt is done client-side to avoid needing a Firestore composite index.
    const q = query(
      collection(db, "products"),
      where("isVisible", "==", true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const mapped = mapSnapshotToProducts(snapshot);
        // Sort newest first client-side
        mapped.sort((a, b) => {
          const aTime = (a.createdAt as any)?.toDate?.()?.getTime?.() ?? 0;
          const bTime = (b.createdAt as any)?.toDate?.()?.getTime?.() ?? 0;
          return bTime - aTime;
        });
        setProducts(mapped);
        setLoading(false);
      },
      (err) => {
        console.error("Product list listener failed", err);
        setError(err instanceof Error ? err.message : "Unable to load products");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { products, loading, error };
}

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<FirestoreProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [baseProduct, setBaseProduct] = useState<FirestoreProduct | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const productRef = doc(db, "products", id);
    const variantsCol = collection(db, "products", id, "variants");
    const variantQuery = query(variantsCol, orderBy("colorName"));

    const unsubscribeProduct = onSnapshot(
      productRef,
      (snap) => {
        if (!snap.exists()) {
          setBaseProduct(null);
          setLoading(false);
          return;
        }
        setBaseProduct({ id: snap.id, ...snap.data() } as FirestoreProduct);
        setLoading(false);
      },
      (err) => {
        console.error("Product detail listener failed", err);
        setError(err instanceof Error ? err.message : "Unable to load product");
        setLoading(false);
      }
    );

    const unsubscribeVariants = onSnapshot(
      variantQuery,
      (snap) => {
        setVariants(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ProductVariant)));
      },
      (err) => {
        console.error("Variant listener failed", err);
        setError(err instanceof Error ? err.message : "Unable to load variants");
      }
    );

    return () => {
      unsubscribeProduct();
      unsubscribeVariants();
    };
  }, [id]);

  useEffect(() => {
    if (!baseProduct) {
      setProduct(null);
      return;
    }
    setProduct({ ...baseProduct, variants });
  }, [baseProduct, variants]);

  return { product, loading, error };
}
