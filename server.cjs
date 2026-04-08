const express = require("express");
const Razorpay = require("razorpay");
require("dotenv").config();

const app = express();
app.use(express.json());

app.post("/api/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);
    return res.status(200).json(order);
  } catch (error) {
    console.error("Razorpay Order creation error:", error);
    return res.status(500).json({ error: error.message || "Failed to create order" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API server running at http://localhost:${PORT}`);
  console.log(`   Razorpay Key ID: ${process.env.RAZORPAY_KEY_ID}`);
});
