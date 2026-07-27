# MADANI - Full-Stack E-Commerce Web Application

MADANI is a full-stack e-commerce web application built using **Next.js (App Router)**, **Tailwind CSS**, **MongoDB Atlas + Mongoose**, **Firebase Authentication**, **Cloudinary**, and **Razorpay Payments**.

---

## 🚀 Tech Stack

- **Frontend**: Next.js (App Router), React 19, Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes (Node.js)
- **Database**: MongoDB Atlas + Mongoose ORM
- **Auth**: Firebase Authentication (Email/Password + Google Sign-In)
- **Image Storage**: Cloudinary (Product images upload API)
- **Payments**: Razorpay Gateway (Server-side HMAC signature verification)
- **Deployment**: Vercel (Frontend & Serverless API Routes), MongoDB Atlas (Database)

---

## 📁 Directory Structure

```text
/app
  /admin
    /products      -> Product list, Add/Edit/Delete UI + Cloudinary upload
    /orders        -> Order list, status update UI & tracking ID assignment
    /balance       -> Financial summary, pending payout & order revenue view
    /users         -> Registered users list & role switcher
  /api
    /products      -> GET, POST, PUT, DELETE product API routes
    /orders        -> GET, POST, PUT (status flow) order API routes
    /upload        -> Cloudinary image upload API route
    /auth          -> Sync Firebase user into MongoDB User model
    /balance       -> Revenue calculation API route
    /users         -> User management API route
    /razorpay
      /order       -> Create Razorpay payment order
      /verify      -> Verify HMAC signature server-side & create order
  /(customer)
    page.jsx       -> Home page (Header, HeroSlider, ProductGrid, Trust Badges)
    /product/[id]  -> Interactive product detail page & gallery
    /cart          -> Cart page, quantity modifier & subtotal breakdown
    /checkout      -> Shipping address form & Razorpay payment integration
    /track         -> Order tracking step-by-step progress timeline
    /about         -> Store overview, mission, and contact form
/components
  Header.jsx       -> Top bar with hamburger menu, logo, cart badge, search modal
  SideMenu.jsx     -> Slide-out drawer navigation & category menu
  HeroSlider.jsx   -> Horizontal scrollable carousel for featured products
  ProductGrid.jsx  -> 3-column responsive product grid with category filter & load-more
  ProductCard.jsx  -> Product card with hover effects, price, and stock badge
  AuthModal.jsx    -> Firebase Email/Password & Google Sign-In modal
  AdminNav.jsx     -> Admin dashboard tab bar header
/lib
  db.js            -> Mongoose connection pooling helper
  firebase.js      -> Firebase Client App & Auth exports
  cloudinary.js    -> Cloudinary SDK v2 config
/models
  Product.js       -> Name, price, images[], stock, category, isFeaturedInSlider
  Order.js         -> User, items[], totalAmount, status flow, trackingId, paymentId
  User.js          -> Firebase UID, name, email, role (customer/admin)
  Balance.js       -> Order reference, amount, payoutStatus
.env.local.example -> Required environment variable template
README.md          -> Documentation
```

---

## 🔑 Environment Variables Setup

Copy `.env.local.example` to `.env.local` in your root folder:

```bash
cp .env.local.example .env.local
```

Fill in your actual service credentials in `.env.local`:

```env
# Database Connection (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/madani-store?retryWrites=true&w=majority

# Firebase Client Authentication Keys
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-app-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef...

# Cloudinary Image Upload Keys
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay Payment Gateway Credentials
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

> **Note**: If environment variables are missing during initial setup, the app gracefully provides dev mode fallbacks and simulated responses so you can immediately explore the full UI without crashing.

---

## 💻 Running the Application Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌟 Key Features

1. **Admin Fulfillment & Status Flow**:
   - Status pipeline: `Pending` -> `Shipped` -> `Out for Delivery` -> `Delivered`.
   - Live updates reflect immediately on customer tracking page (`/track`).

2. **Razorpay Payment Gateway**:
   - Server-side signature verification via Crypto HMAC SHA-256 before writing orders to database.

3. **Financial Dashboard (`/admin/balance`)**:
   - Live calculation of Total Sales, Pending Payouts, and Order-wise revenue logs.

4. **Product Inventory & Cloudinary Uploads (`/admin/products`)**:
   - Complete CRUD operations + direct image uploads.
