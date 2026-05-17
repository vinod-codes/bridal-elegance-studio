# 👑 Bridal Elegance Studio - Premium E-Commerce Storefront

A state-of-the-art, immersive luxury e-commerce experience designed specifically for high-end artisan jewelry, built with **React 18**, **Vite**, and **Tailwind CSS v3**.

---

## 🎨 Design Philosophy & Visuals

Bridal Elegance Studio combines class, heritage, and elite design standards. It leverages a majestic design system:
*   **Typography**: Graceful serif headings (`Playfair Display`) and sharp modern body typography (`Outfit`).
*   **Color Palette**: Harmonious combinations of **Deep Charcoal/Gold**, soft **Rose Quartz**, and warm **Imperial Gold (`#D4AF37`)** accents.
*   **Aesthetics**: Glassmorphism, subtle micro-animations (via Framer Motion), grid systems, card-glow actions, and smooth layout transitions.

---

## ✨ Primary Features

1.  **Immersive Product Showcase**: Browse bespoke hand-crafted bridal masterpieces with premium hover-zoom animations, extensive variant support (colors, metals, and stock limits), and rich descriptions.
2.  **Interactive Shopping Cart**: Sidebar overlay with instant quantity controls, variant details, stock checks, and free complimentary shipping targets.
3.  **Secure Razorpay Checkout**: Fully integrated checkout modal that securely connects to our Node Express backend to generate order references and launch Razorpay checkout forms.
4.  **Artisan Order History**: Dedicated tracker detailing order timeline, transaction metadata, and item lists.
5.  **User Authentication & Profiles**: Register and login securely via email/password or Google Single-Sign-On (SSO) supported by Firebase Auth.
6.  **Address Book Manager**: Add, select, and manage multiple delivery addresses stored securely on Firestore.

---

## 🛠️ Technology Stack

*   **Frontend Library**: React 18.3.1
*   **Build Bundler**: Vite 5.4.19
*   **Styling System**: Tailwind CSS v3.4.17 (using custom royal configurations)
*   **Animations**: Framer Motion 12.38.0
*   **State & Queries**: TanStack React Query v5 & React Context API
*   **Forms**: React Hook Form with Zod validation
*   **Database & Authentication**: Firebase (Auth, Firestore)
*   **HTTP Client**: Axios (configured with proxy routing to the API backend)

---

## 📁 Project Architecture

```
bridal-elegance-studio/
├── api/                    # Vercel Serverless Function triggers
├── public/                 # Static assets (logos, placeholders)
├── src/
│   ├── assets/             # Images and fonts
│   ├── components/         # Reusable widgets (Navbar, CartSidebar, Footer)
│   ├── context/            # Auth and Cart global state managers
│   ├── pages/              # Primary pages (Home, Products, ProductDetail, Checkout, Orders)
│   ├── config/             # Firebase configuration initialization
│   ├── styles/             # Global CSS declarations and animations
│   ├── App.tsx             # Main routing hub
│   └── main.tsx            # App bootstrap entrypoint
├── server.cjs              # Local fallback backend server script
├── vite.config.ts          # Vite configuration including port 8080 and API proxies
└── package.json            # Dependencies and scripts configuration
```

---

## 🔌 Port Mapping & Backend Integration

### Port Setup:
*   The storefront runs on **Port 8080** locally (`http://127.0.0.1:8080/`).

### Proxy Integration:
To bypass CORS limitations and secure server credentials during development, Vite is configured to proxy all `/api` calls:
```typescript
proxy: {
  "/api": {
    target: "http://localhost:3000",
    changeOrigin: true,
  }
}
```
When checking out or verifying shipment regions, the app communicates with the running **Express API Server** at `http://localhost:3000` via this secure local bridge.

---

## 🔑 Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_Sb16AhWMZG3LSJ
RAZORPAY_KEY_ID=rzp_test_Sb16AhWMZG3LSJ
RAZORPAY_KEY_SECRET=5soOEsAbwZY7xd15STBPluv6
```

---

## ⚡ Execution Instructions

To get the storefront up and running:

```bash
# Install dependencies
npm install

# Start the storefront in development mode
npm run dev
```

*Make sure your API server is running on Port 3000 for checkout payments and pincode lookups to work properly!*
