/**
 * api/webhook-razorpay.js — Razorpay Webhook Handler (Vercel Serverless)
 *
 * This is the SAFETY NET for lost orders.
 * When a customer pays but their browser crashes before handler() fires,
 * Razorpay will still call this webhook within 30 seconds.
 *
 * Setup in Razorpay Dashboard:
 *   URL: https://www.theujs.com/api/webhook-razorpay
 *   Events: payment.captured, payment.failed, order.paid
 *   Secret: set RAZORPAY_WEBHOOK_SECRET in your env vars
 */
import crypto from "crypto";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// ── Firebase Admin initialisation ────────────────────────────────────────────
if (getApps().length === 0) {
  try {
    const credential = process.env.FIREBASE_SERVICE_ACCOUNT
      ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
      : undefined;
    initializeApp({ credential, projectId: "unique-jewelry-studio" });
  } catch (e) {
    initializeApp({ projectId: "unique-jewelry-studio" });
  }
}

const db = getFirestore();

export const config = {
  api: {
    bodyParser: false, // MUST be raw for HMAC verification
  },
};

// Collect raw body from stream
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set");
    return res.status(500).json({ error: "Webhook not configured" });
  }

  // ── STEP 1: Verify webhook signature ─────────────────────────────────────
  let rawBody;
  try {
    rawBody = await getRawBody(req);
  } catch (e) {
    return res.status(400).json({ error: "Failed to read request body" });
  }

  const webhookSignature = req.headers["x-razorpay-signature"];
  const generatedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (generatedSignature !== webhookSignature) {
    console.error("WEBHOOK_SIGNATURE_MISMATCH");
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const { event: eventName, payload } = event;

  // ── STEP 2: Handle payment.captured (main event) ──────────────────────────
  if (eventName === "payment.captured" || eventName === "order.paid") {
    const payment = payload.payment?.entity;
    const order = payload.order?.entity;
    const razorpay_order_id = payment?.order_id || order?.id;
    const razorpay_payment_id = payment?.id;

    if (!razorpay_order_id) {
      return res.status(200).json({ status: "ok", note: "No order ID in payload" });
    }

    try {
      // Idempotency: check if order already exists
      const existingQuery = await db
        .collection("orders")
        .where("razorpayOrderId", "==", razorpay_order_id)
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        // Order already created by verify-payment — do nothing
        return res.status(200).json({ status: "ok", note: "Order already exists" });
      }

      // Order doesn't exist — this means verify-payment failed (browser crash etc.)
      // Recover from pending order
      const pendingQuery = await db
        .collection("orders_pending")
        .where("razorpayOrderId", "==", razorpay_order_id)
        .limit(1)
        .get();

      let pendingData = null;
      let pendingDocId = null;

      if (!pendingQuery.empty) {
        pendingDocId = pendingQuery.docs[0].id;
        pendingData = pendingQuery.docs[0].data();
      }

      // Create the order from pending data (webhook recovery)
      const newOrderRef = db.collection("orders").doc();

      await db.runTransaction(async (tx) => {
        // Deduct stock if we have item data
        const serverItems = pendingData?.items || [];
        for (const item of serverItems) {
          const { productId, variantId, quantity } = item;
          if (!productId || !quantity) continue;

          const productRef = db.collection("products").doc(productId);
          const productSnap = await tx.get(productRef);
          if (!productSnap.exists) continue;

          const product = productSnap.data();
          const variants = product.variants || [];
          const variantIndex = variantId
            ? variants.findIndex((v) => v.id === variantId)
            : -1;

          if (variantIndex >= 0) {
            const updatedVariants = [...variants];
            const currentStock =
              updatedVariants[variantIndex].stock ??
              updatedVariants[variantIndex].inventory ??
              0;
            updatedVariants[variantIndex] = {
              ...updatedVariants[variantIndex],
              stock: Math.max(0, currentStock - quantity),
              inventory: Math.max(0, currentStock - quantity),
            };
            tx.update(productRef, { variants: updatedVariants });
          } else {
            const currentStock = product.stock ?? product.inventory ?? 0;
            tx.update(productRef, {
              stock: FieldValue.increment(-Math.min(quantity, currentStock)),
              inventory: FieldValue.increment(-Math.min(quantity, currentStock)),
            });
          }
        }

        tx.set(newOrderRef, {
          ...(pendingData?.orderData || {}),
          items: pendingData?.items || [],
          paymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          totalAmount: pendingData?.serverTotal || payment?.amount / 100 || 0,
          shippingCharge: pendingData?.shippingCharge || 0,
          status: "paid",
          recoveredByWebhook: true,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      });

      // Update pending order status
      if (pendingDocId) {
        db.collection("orders_pending")
          .doc(pendingDocId)
          .update({
            status: "webhook_recovered",
            recoveredAt: FieldValue.serverTimestamp(),
          })
          .catch(console.warn);
      }

      // Update analytics
      db.collection("analytics")
        .doc("global_stats")
        .set(
          {
            totalRevenue: FieldValue.increment(
              pendingData?.serverTotal || payment?.amount / 100 || 0
            ),
            totalOrders: FieldValue.increment(1),
          },
          { merge: true }
        )
        .catch(console.warn);

      console.log(`WEBHOOK_RECOVERY: Created order ${newOrderRef.id} for ${razorpay_order_id}`);
      return res.status(200).json({ status: "ok", orderId: newOrderRef.id });
    } catch (error) {
      console.error("Webhook processing error:", error);
      // Return 200 so Razorpay doesn't retry unnecessarily
      return res.status(200).json({ status: "error", note: error.message });
    }
  }

  // ── Handle payment.failed ────────────────────────────────────────────────
  if (eventName === "payment.failed") {
    const payment = payload.payment?.entity;
    const razorpay_order_id = payment?.order_id;

    if (razorpay_order_id) {
      // Mark pending order as failed (non-blocking)
      db.collection("orders_pending")
        .where("razorpayOrderId", "==", razorpay_order_id)
        .get()
        .then((snap) => {
          snap.docs.forEach((doc) =>
            doc.ref.update({
              status: "failed",
              failedAt: FieldValue.serverTimestamp(),
              failureReason: payment?.error_description,
            })
          );
        })
        .catch(console.warn);
    }

    return res.status(200).json({ status: "ok", note: "payment.failed recorded" });
  }

  // Acknowledge all other events
  return res.status(200).json({ status: "ok" });
}
