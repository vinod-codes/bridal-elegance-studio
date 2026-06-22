/**
 * api/create-order.js — Vercel Serverless Function
 *
 * SECURITY: All amounts are calculated SERVER-SIDE from Firestore.
 * The client-submitted amount is ONLY used for verification comparison.
 * A price mismatch returns 400 and blocks the Razorpay order.
 */
import Razorpay from "razorpay";
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

  const { items, currency = "INR", receipt, orderData } = req.body;

  // ── Input validation ─────────────────────────────────────────────────────
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Items array is required" });
  }

  try {
    // ── SERVER-SIDE PRICE CALCULATION ────────────────────────────────────
    let serverSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const { productId, variantId, quantity } = item;

      if (!productId || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ error: `Invalid item: ${productId}` });
      }

      const productSnap = await db.collection("products").doc(productId).get();
      if (!productSnap.exists) {
        return res.status(400).json({ error: `Product not found: ${productId}` });
      }

      const product = productSnap.data();

      // Visibility check
      if (product.isVisible === false || product.approvalStatus === "Rejected") {
        return res.status(400).json({ error: `Product unavailable: ${product.name}` });
      }

      // Determine unit price (server-authoritative)
      let unitPrice = product.discountPrice ?? product.price;
      let itemStock = product.stock ?? product.inventory ?? 999;

      if (variantId && Array.isArray(product.variants)) {
        const variant = product.variants.find((v) => v.id === variantId);
        if (variant) {
          if (variant.price !== undefined) unitPrice = variant.price;
          if (variant.stock !== undefined) itemStock = variant.stock;
          else if (variant.inventory !== undefined) itemStock = variant.inventory;
        }
      }

      if (itemStock <= 0) {
        return res.status(400).json({
          error: `"${product.name}" is out of stock`,
          code: "OUT_OF_STOCK",
        });
      }

      if (quantity > itemStock) {
        return res.status(400).json({
          error: `Only ${itemStock} units of "${product.name}" are available`,
          code: "INSUFFICIENT_STOCK",
        });
      }

      serverSubtotal += unitPrice * quantity;
      validatedItems.push({ ...item, unitPrice, itemStock });
    }

    // ── Shipping calculation from Firestore settings ─────────────────────
    let shippingCharge = 50;
    try {
      const settingsSnap = await db.collection("settings").doc("delivery").get();
      if (settingsSnap.exists) {
        const s = settingsSnap.data();
        if (s.force_free_delivery) {
          shippingCharge = 0;
        } else if (serverSubtotal >= (s.free_delivery_threshold ?? 999)) {
          shippingCharge = 0;
        } else {
          shippingCharge = s.default_delivery_charge ?? 50;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch delivery settings, using default:", e.message);
    }

    const serverTotal = serverSubtotal + shippingCharge;

    // ── Price tamper detection ───────────────────────────────────────────
    if (orderData?.totalAmount !== undefined) {
      const clientTotal = parseFloat(orderData.totalAmount);
      if (Math.abs(serverTotal - clientTotal) > 2) {
        console.error(
          `PRICE_MISMATCH: client=₹${clientTotal}, server=₹${serverTotal}`
        );
        return res.status(400).json({
          error: "Price mismatch detected. Please refresh your cart and try again.",
          code: "PRICE_MISMATCH",
        });
      }
    }

    // ── Create Razorpay order ────────────────────────────────────────────
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const rpOrder = await razorpay.orders.create({
      amount: Math.round(serverTotal * 100), // paise — server-calculated
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    });

    // ── Create pending order in Firestore ────────────────────────────────
    const pendingRef = await db.collection("orders_pending").add({
      razorpayOrderId: rpOrder.id,
      orderData: orderData || {},
      items: validatedItems,
      serverSubtotal,
      shippingCharge,
      serverTotal,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30-min expiry
    });

    return res.status(200).json({
      ...rpOrder,
      pendingOrderId: pendingRef.id,
      serverTotal,
    });
  } catch (error) {
    console.error("create-order error:", error);
    return res.status(500).json({ error: error.message || "Failed to create order" });
  }
}
