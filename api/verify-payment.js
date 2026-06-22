/**
 * api/verify-payment.js — Vercel Serverless Function
 *
 * SECURITY:
 * 1. HMAC signature verification (tamper-proof)
 * 2. Idempotency guard — duplicate callbacks return the existing order
 * 3. Atomic Firestore transaction — prevents race conditions
 * 4. Stock deduction inside the same transaction
 * 5. Pending order cleanup
 */
import crypto from "crypto";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// ── Firebase Admin initialisation (idempotent) ──────────────────────────────
if (getApps().length === 0) {
  try {
    const credential = process.env.FIREBASE_SERVICE_ACCOUNT
      ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
      : undefined;
    initializeApp({ credential, projectId: "unique-jewelry-studio" });
  } catch (e) {
    console.error("Firebase admin init error:", e.message);
    initializeApp({ projectId: "unique-jewelry-studio" });
  }
}

const db = getFirestore();

export default async function handler(req, res) {
  // ── CORS ────────────────────────────────────────────────────────────────
  const allowedOrigins = [
    "https://www.theujs.com",
    "https://theujs.com",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    pendingOrderId,
    orderData,
    items,
  } = req.body;

  // ── Required field validation ────────────────────────────────────────────
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing payment verification parameters" });
  }

  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_secret) {
    return res.status(500).json({ error: "Payment system not configured" });
  }

  // ── STEP 1: HMAC Signature Verification ─────────────────────────────────
  const generated_signature = crypto
    .createHmac("sha256", key_secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generated_signature !== razorpay_signature) {
    console.error(`SIGNATURE_MISMATCH for order ${razorpay_order_id}`);
    return res.status(400).json({ verified: false, error: "Invalid payment signature" });
  }

  try {
    // ── STEP 2: Idempotency Guard ─────────────────────────────────────────
    // Check if this Razorpay order has already been processed
    const existingOrderQuery = await db
      .collection("orders")
      .where("razorpayOrderId", "==", razorpay_order_id)
      .limit(1)
      .get();

    if (!existingOrderQuery.empty) {
      const existingOrder = existingOrderQuery.docs[0];
      console.log(`IDEMPOTENT: Order already exists for ${razorpay_order_id}`);
      return res.status(200).json({
        verified: true,
        message: "Payment already processed",
        orderId: existingOrder.id,
      });
    }

    // ── STEP 3: Fetch pending order data (server-side values) ─────────────
    let serverOrderData = orderData || {};
    let serverItems = items || [];
    let serverTotal = serverOrderData.totalAmount;
    let shippingCharge = serverOrderData.shippingCharge || 0;

    if (pendingOrderId) {
      try {
        const pendingSnap = await db
          .collection("orders_pending")
          .doc(pendingOrderId)
          .get();
        if (pendingSnap.exists) {
          const pending = pendingSnap.data();
          // Use server-validated values from pending order
          serverItems = pending.items || serverItems;
          serverTotal = pending.serverTotal ?? serverTotal;
          shippingCharge = pending.shippingCharge ?? shippingCharge;
          // Merge in any client order data (address, user info)
          serverOrderData = { ...pending.orderData, ...orderData };
        }
      } catch (e) {
        console.warn("Could not fetch pending order:", e.message);
      }
    }

    // ── STEP 4: Atomic transaction — create order + deduct stock ──────────
    const newOrderRef = db.collection("orders").doc();

    await db.runTransaction(async (tx) => {
      // 4a. Stock validation and deduction
      for (const item of serverItems) {
        const { productId, variantId, quantity } = item;
        if (!productId || !quantity) continue;

        const productRef = db.collection("products").doc(productId);
        const productSnap = await tx.get(productRef);

        if (!productSnap.exists) continue;
        const product = productSnap.data();

        // Find variant if applicable
        const variants = product.variants || [];
        const variantIndex = variantId
          ? variants.findIndex((v) => v.id === variantId)
          : -1;

        if (variantIndex >= 0) {
          // Deduct variant stock
          const updatedVariants = [...variants];
          const currentVariantStock =
            updatedVariants[variantIndex].stock ??
            updatedVariants[variantIndex].inventory ??
            0;
          updatedVariants[variantIndex] = {
            ...updatedVariants[variantIndex],
            stock: Math.max(0, currentVariantStock - quantity),
            inventory: Math.max(0, currentVariantStock - quantity),
          };
          tx.update(productRef, { variants: updatedVariants });
        } else {
          // Deduct main product stock
          const currentStock = product.stock ?? product.inventory ?? 0;
          tx.update(productRef, {
            stock: FieldValue.increment(-Math.min(quantity, currentStock)),
            inventory: FieldValue.increment(-Math.min(quantity, currentStock)),
          });
        }
      }

      // 4b. Create the confirmed order
      tx.set(newOrderRef, {
        ...(serverOrderData || {}),
        items: serverItems,
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpaySignature: razorpay_signature,
        totalAmount: serverTotal,
        shippingCharge,
        status: "paid",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    const orderId = newOrderRef.id;

    // ── STEP 5: Cleanup pending order (best-effort, non-blocking) ─────────
    if (pendingOrderId) {
      db.collection("orders_pending")
        .doc(pendingOrderId)
        .update({ status: "completed", completedAt: FieldValue.serverTimestamp() })
        .catch((e) => console.warn("Pending order cleanup failed:", e.message));
    }

    // ── STEP 6: Update analytics (best-effort, non-blocking) ──────────────
    db.collection("analytics")
      .doc("global_stats")
      .set(
        {
          totalRevenue: FieldValue.increment(serverTotal || 0),
          totalOrders: FieldValue.increment(1),
        },
        { merge: true }
      )
      .catch((e) => console.warn("Analytics update failed:", e.message));

    return res.status(200).json({
      verified: true,
      message: "Payment verified and order created",
      orderId,
    });
  } catch (error) {
    console.error("verify-payment error:", error);
    return res.status(500).json({
      error: error.message || "Failed to verify payment",
    });
  }
}
