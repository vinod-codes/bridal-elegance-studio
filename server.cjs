const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
require("dotenv").config();

// ── Firebase Admin Initialisation ─────────────────────────────────────────────
if (getApps().length === 0) {
  try {
    const credential = process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
      ? cert({
          projectId: "unique-jewelry-studio",
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Replace escaped newlines with actual newlines to support Railway env var format
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
      : process.env.FIREBASE_SERVICE_ACCOUNT
        ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
        : undefined;
    
    initializeApp({ credential, projectId: "unique-jewelry-studio" });
  } catch (e) {
    console.error("Firebase admin init error:", e.message);
    initializeApp({ projectId: "unique-jewelry-studio" });
  }
}

const db = getFirestore();
const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({ origin: ["https://www.theujs.com", "https://theujs.com", "http://localhost:8080", "http://localhost:5173", "http://127.0.0.1:8080"] }));

// Rate Limiting
const createOrderLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  message: { error: "Too many requests, please try again later." }
});

// We need raw body for the webhook. express.json() is applied conditionally.
app.use((req, res, next) => {
  if (req.originalUrl === "/api/webhook-razorpay") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// ── CREATE ORDER (Secure Server-Side Calculation) ───────────────────────────
app.post("/api/create-order", createOrderLimiter, async (req, res) => {
  const { items, currency = "INR", receipt, orderData } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Items array is required" });
  }

  try {
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

      if (product.isVisible === false || product.approvalStatus === "Rejected") {
        return res.status(400).json({ error: `Product unavailable: ${product.name}` });
      }

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
        return res.status(400).json({ error: `"${product.name}" is out of stock`, code: "OUT_OF_STOCK" });
      }

      if (quantity > itemStock) {
        return res.status(400).json({ error: `Only ${itemStock} units of "${product.name}" are available`, code: "INSUFFICIENT_STOCK" });
      }

      serverSubtotal += unitPrice * quantity;
      validatedItems.push({ ...item, unitPrice, itemStock });
    }

    let shippingCharge = 50;
    try {
      const settingsSnap = await db.collection("settings").doc("delivery").get();
      if (settingsSnap.exists) {
        const s = settingsSnap.data();
        if (s.force_free_delivery) shippingCharge = 0;
        else if (serverSubtotal >= (s.free_delivery_threshold ?? 999)) shippingCharge = 0;
        else shippingCharge = s.default_delivery_charge ?? 50;
      }
    } catch (e) {
      console.warn("Failed to fetch delivery settings, using default:", e.message);
    }

    const serverTotal = serverSubtotal + shippingCharge;

    if (orderData?.totalAmount !== undefined) {
      const clientTotal = parseFloat(orderData.totalAmount);
      if (Math.abs(serverTotal - clientTotal) > 2) {
        return res.status(400).json({ error: "Price mismatch detected. Please refresh your cart and try again.", code: "PRICE_MISMATCH" });
      }
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const rpOrder = await razorpay.orders.create({
      amount: Math.round(serverTotal * 100),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    });

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
});

// ── VERIFY PAYMENT ───────────────────────────────────────────────────────────
app.post("/api/verify-payment", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderData,
    items,
    serverTotal,
    shippingCharge,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing Razorpay verification parameters" });
  }

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature !== razorpay_signature) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  try {
    const existingOrderQuery = await db
      .collection("orders")
      .where("razorpayOrderId", "==", razorpay_order_id)
      .limit(1)
      .get();

    if (!existingOrderQuery.empty) {
      return res.status(200).json({
        success: true,
        orderId: existingOrderQuery.docs[0].id,
        note: "Order already processed (idempotent return)",
      });
    }

    const newOrderRef = db.collection("orders").doc();

    await db.runTransaction(async (tx) => {
      const serverItems = items || [];
      for (const item of serverItems) {
        const { productId, variantId, quantity } = item;
        if (!productId || !quantity) continue;

        const productRef = db.collection("products").doc(productId);
        const productSnap = await tx.get(productRef);
        if (!productSnap.exists) throw new Error(`Product ${productId} not found`);

        const product = productSnap.data();
        const variants = product.variants || [];
        const variantIndex = variantId ? variants.findIndex((v) => v.id === variantId) : -1;

        if (variantIndex >= 0) {
          const updatedVariants = [...variants];
          const currentStock = updatedVariants[variantIndex].stock ?? updatedVariants[variantIndex].inventory ?? 0;
          if (currentStock < quantity) throw new Error(`Insufficient stock for variant ${variantId}`);
          
          updatedVariants[variantIndex] = {
            ...updatedVariants[variantIndex],
            stock: currentStock - quantity,
            inventory: currentStock - quantity,
          };
          tx.update(productRef, { variants: updatedVariants });
        } else {
          const currentStock = product.stock ?? product.inventory ?? 0;
          if (currentStock < quantity) throw new Error(`Insufficient stock for ${product.name}`);
          
          tx.update(productRef, {
            stock: FieldValue.increment(-quantity),
            inventory: FieldValue.increment(-quantity),
          });
        }
      }

      tx.set(newOrderRef, {
        ...(orderData || {}),
        items: serverItems,
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        totalAmount: serverTotal || 0,
        shippingCharge: shippingCharge || 0,
        status: "paid",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    const pendingQuery = await db
      .collection("orders_pending")
      .where("razorpayOrderId", "==", razorpay_order_id)
      .limit(1)
      .get();

    if (!pendingQuery.empty) {
      db.collection("orders_pending").doc(pendingQuery.docs[0].id).update({
        status: "completed",
        completedAt: FieldValue.serverTimestamp(),
      }).catch(console.warn);
    }

    db.collection("analytics").doc("global_stats").set({
      totalRevenue: FieldValue.increment(serverTotal || 0),
      totalOrders: FieldValue.increment(1),
    }, { merge: true }).catch(console.warn);

    return res.status(200).json({ success: true, orderId: newOrderRef.id });
  } catch (error) {
    console.error("verify-payment error:", error);
    return res.status(500).json({ error: error.message || "Failed to complete order" });
  }
});

// ── WEBHOOK RAZORPAY ────────────────────────────────────────────────────────
app.post("/api/webhook-razorpay", express.raw({ type: "application/json" }), async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(500).json({ error: "Webhook not configured" });
  }

  const webhookSignature = req.headers["x-razorpay-signature"];
  const generatedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(req.body)
    .digest("hex");

  if (generatedSignature !== webhookSignature) {
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  let event;
  try {
    event = JSON.parse(req.body.toString("utf8"));
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const { event: eventName, payload } = event;

  if (eventName === "payment.captured" || eventName === "order.paid") {
    const payment = payload.payment?.entity;
    const order = payload.order?.entity;
    const razorpay_order_id = payment?.order_id || order?.id;
    const razorpay_payment_id = payment?.id;

    if (!razorpay_order_id) {
      return res.status(200).json({ status: "ok", note: "No order ID in payload" });
    }

    try {
      const existingQuery = await db.collection("orders").where("razorpayOrderId", "==", razorpay_order_id).limit(1).get();
      if (!existingQuery.empty) return res.status(200).json({ status: "ok", note: "Order already exists" });

      const pendingQuery = await db.collection("orders_pending").where("razorpayOrderId", "==", razorpay_order_id).limit(1).get();
      let pendingData = null;
      let pendingDocId = null;

      if (!pendingQuery.empty) {
        pendingDocId = pendingQuery.docs[0].id;
        pendingData = pendingQuery.docs[0].data();
      }

      const newOrderRef = db.collection("orders").doc();

      await db.runTransaction(async (tx) => {
        const serverItems = pendingData?.items || [];
        for (const item of serverItems) {
          const { productId, variantId, quantity } = item;
          if (!productId || !quantity) continue;

          const productRef = db.collection("products").doc(productId);
          const productSnap = await tx.get(productRef);
          if (!productSnap.exists) continue;

          const product = productSnap.data();
          const variants = product.variants || [];
          const variantIndex = variantId ? variants.findIndex((v) => v.id === variantId) : -1;

          if (variantIndex >= 0) {
            const updatedVariants = [...variants];
            const currentStock = updatedVariants[variantIndex].stock ?? updatedVariants[variantIndex].inventory ?? 0;
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

      if (pendingDocId) {
        db.collection("orders_pending").doc(pendingDocId).update({
          status: "webhook_recovered",
          recoveredAt: FieldValue.serverTimestamp(),
        }).catch(console.warn);
      }

      db.collection("analytics").doc("global_stats").set({
        totalRevenue: FieldValue.increment(pendingData?.serverTotal || payment?.amount / 100 || 0),
        totalOrders: FieldValue.increment(1),
      }, { merge: true }).catch(console.warn);

      return res.status(200).json({ status: "ok", orderId: newOrderRef.id });
    } catch (error) {
      console.error("Webhook processing error:", error);
      return res.status(200).json({ status: "error", note: error.message });
    }
  }

  if (eventName === "payment.failed") {
    const payment = payload.payment?.entity;
    const razorpay_order_id = payment?.order_id;

    if (razorpay_order_id) {
      db.collection("orders_pending")
        .where("razorpayOrderId", "==", razorpay_order_id)
        .get()
        .then((snap) => {
          snap.docs.forEach((doc) => doc.ref.update({
            status: "failed",
            failedAt: FieldValue.serverTimestamp(),
            failureReason: payment?.error_description,
          }));
        }).catch(console.warn);
    }
    return res.status(200).json({ status: "ok", note: "payment.failed recorded" });
  }

  return res.status(200).json({ status: "ok" });
});

// Mock Database (check-pincode)
let dbMock = {
  pincodes: [
    { pincode: "560001", serviceable: true, delivery_charge: 50, estimated_days: 2, region: "Bangalore" },
    { pincode: "110001", serviceable: true, delivery_charge: 100, estimated_days: 4, region: "Delhi" },
    { pincode: "400001", serviceable: true, delivery_charge: 40, estimated_days: 1, region: "Mumbai" },
    { pincode: "000000", serviceable: false, delivery_charge: 0, estimated_days: 0, region: "Nowhere" }
  ]
};

app.post("/api/check-pincode", (req, res) => {
  const { pincode } = req.body;
  if (!pincode) return res.status(400).json({ error: "Pincode is required" });

  const record = dbMock.pincodes.find(p => p.pincode === pincode);
  
  if (!record || !record.serviceable) {
    return res.status(200).json({ serviceable: false, error_message: "Sorry, we do not deliver to this location yet." });
  }

  return res.status(200).json({
    serviceable: true,
    delivery_charge: record.delivery_charge,
    estimated_days: record.estimated_days
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API server running at http://localhost:${PORT}`);
});
