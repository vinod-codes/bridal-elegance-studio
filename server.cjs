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

// Mock Database
let db = {
  pincodes: [
    { pincode: "560001", serviceable: true, delivery_charge: 50, estimated_days: 2, region: "Bangalore" },
    { pincode: "110001", serviceable: true, delivery_charge: 100, estimated_days: 4, region: "Delhi" },
    { pincode: "400001", serviceable: true, delivery_charge: 40, estimated_days: 1, region: "Mumbai" },
    { pincode: "000000", serviceable: false, delivery_charge: 0, estimated_days: 0, region: "Nowhere" }
  ],
  locations: [
    { city: "Bangalore", pincode: "560001", serviceable: true },
    { city: "Delhi", pincode: "110001", serviceable: true },
    { city: "Mumbai", pincode: "400001", serviceable: true },
    { city: "Nowhere", pincode: "000000", serviceable: false }
  ],
  addresses: []
};

app.post("/api/check-pincode", (req, res) => {
  const { pincode } = req.body;
  if (!pincode) return res.status(400).json({ error: "Pincode is required" });

  const record = db.pincodes.find(p => p.pincode === pincode);
  
  if (!record || !record.serviceable) {
    return res.status(200).json({ serviceable: false, error_message: "Sorry, we do not deliver to this location yet." });
  }

  return res.status(200).json({
    serviceable: true,
    delivery_charge: record.delivery_charge,
    estimated_days: record.estimated_days
  });
});

app.listen(PORT, () => {
  console.log(`✅ API server running at http://localhost:${PORT}`);
  console.log(`   Razorpay Key ID: ${process.env.RAZORPAY_KEY_ID}`);
});
