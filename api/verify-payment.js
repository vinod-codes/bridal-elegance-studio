import crypto from "crypto";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Initialize Firebase Admin
if (getApps().length === 0) {
  try {
    let credential;
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
    }
    
    initializeApp({
      credential, // will be undefined if env var is missing, falling back to default credentials
      projectId: "unique-jewelry-studio"
    });
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
    // fallback initialization
    initializeApp({
      projectId: "unique-jewelry-studio"
    });
  }
}

const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData, items } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing verification parameters" });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return res.status(500).json({ error: "Razorpay secret key is not configured" });
    }

    const generated_signature = crypto
      .createHmac("sha256", key_secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      
      // 1. Create Firestore order using Admin SDK
      const newOrderData = {
        ...(orderData || {}),
        items: items || [],
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        status: "paid",
        createdAt: FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection("orders").add(newOrderData);
      const orderId = docRef.id;

      // 5. Update Analytics
      try {
        const statsRef = db.collection("analytics").doc("global_stats");
        await statsRef.set({
          totalRevenue: FieldValue.increment(newOrderData.totalAmount || 0),
          totalOrders: FieldValue.increment(1),
          customers: FieldValue.increment(1)
        }, { merge: true });
      } catch (err) {
        console.error("Failed to update analytics:", err);
      }

      return res.status(200).json({ 
        verified: true, 
        message: "Payment verified successfully", 
        orderId: orderId 
      });
    } else {
      return res.status(400).json({ verified: false, error: "Invalid payment signature" });
    }
  } catch (error) {
    console.error("Signature verification error:", error);
    return res.status(500).json({ error: error.message || "Failed to verify signature" });
  }
}
