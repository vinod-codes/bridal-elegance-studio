import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

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
      return res.status(200).json({ verified: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ verified: false, error: "Invalid payment signature" });
    }
  } catch (error) {
    console.error("Signature verification error:", error);
    return res.status(500).json({ error: error.message || "Failed to verify signature" });
  }
}
