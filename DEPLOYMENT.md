# NKeys Store — Full-Stack Deployment Guide

This guide outlines the steps to deploy the shared Supabase backend, compile the customer web store, integrate Razorpay payments, and compile the Android app using Capacitor.

---

## 1. Supabase Backend Setup

1. **Create Supabase Project:**
   - Go to [Supabase](https://supabase.com) and create a new project.
2. **Apply Database Schema & Policies:**
   - Go to the **SQL Editor** in your Supabase Dashboard.
   - Copy the contents of [`db/schema.sql`](file:///c:/Users/Abhyas/projects/nkeys/db/schema.sql) and run it to create tables, triggers, helper functions, and Row Level Security (RLS) policies.
3. **Enable Realtime updates:**
   - Navigate to **Database -> Replication** in the Supabase Sidebar.
   - Enable replication for the `orders` and `products` tables to support instant in-app status updates.

---

## 2. Web Storefront Deployment (Vercel / Netlify)

1. **Configure Environment Variables:**
   - Add these variables in your hosting settings (Netlify, Vercel, or AWS Amplify):
     ```env
     VITE_SUPABASE_URL=https://your-project-ref.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-api-key
     VITE_DEFAULT_COUNTRY_CODE=+91
     VITE_ENABLE_PHONE_OTP=false
     ```
2. **Deploy Command:**
   - Build command: `npm run build`
   - Publish directory: `dist`

---

## 3. Razorpay Payments Integration

1. **Create Razorpay Account:**
   - Sign up at [Razorpay](https://razorpay.com).
2. **Get Test Keys:**
   - Go to **Settings -> API Keys** in the Razorpay Dashboard.
   - Replace the test key in [`src/services/razorpay.js`](file:///c:/Users/Abhyas/projects/nkeys/src/services/razorpay.js) with your publishable key:
     ```javascript
     key: "rzp_test_yourkeyhere"
     ```

---

## 4. Android Mobile App Compilation (Capacitor)

1. **Build Frontend Bundle:**
   ```bash
   npm run build
   ```
2. **Synchronize Capacitor Assets:**
   ```bash
   npx cap sync
   ```
3. **Open Project in Android Studio:**
   ```bash
   npx cap open android
   ```
4. **Compile APK:**
   - In Android Studio, go to **Build > Build Bundle(s) / APK(s) > Build APK(s)** to generate the debug APK.
