# NKeys Storefront

React + Tailwind ecommerce storefront for NKeys, focused on custom stickers and keychains.

## Stack

- React + Vite
- Tailwind CSS
- React Router
- Lucide React
- Supabase shared data layer for users, products, and product images
- Local storage for session, cart, and browser-only demo data
- SQL schema in [db/schema.sql](/c:/Users/Abhyas/projects/nkeys/db/schema.sql)

## Features

- Responsive homepage, product listing, product detail, checkout, order success, and admin dashboard
- Product galleries, quantity selector, and custom artwork upload field
- Review system with average rating, verified purchase badge, user photos, sorting, helpful votes, and admin moderation
- Persistent slide-out cart and multi-step checkout flow
- Admin tools for product editing, order visibility, and review moderation
- Shared owner/customer product visibility across browser accounts once Supabase env vars are configured
- SQL schema for Supabase users, products, and product images

## Run

```bash
npm install
npm run dev
```

## Supabase Setup

1. Copy `.env.example` to `.env`
2. Fill in `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_PRODUCT_IMAGE_BUCKET`, and `VITE_DEFAULT_COUNTRY_CODE`
3. Run the SQL in [db/schema.sql](/c:/Users/Abhyas/projects/nkeys/db/schema.sql)
4. Create a public storage bucket matching `VITE_SUPABASE_PRODUCT_IMAGE_BUCKET`

## Live OTP And Email Verification

The login screen now uses Supabase Auth for live verification instead of showing a browser-only demo code.

To make it work end-to-end:

1. In Supabase, open `Authentication -> Providers`
2. Enable `Email`
3. Configure the email template so it sends the OTP token, not only a magic link
4. Enable `Phone`
5. Connect an SMS provider supported by Supabase Auth
6. Add your project URL to `Authentication -> URL Configuration` if your setup requires it
7. Restart the Vite dev server after saving `.env`

What the app now does:

- `Send code` calls `supabase.auth.signInWithOtp(...)`
- `Verify and enter store` calls `supabase.auth.verifyOtp(...)`
- After verification succeeds, the app creates the local storefront session and syncs the customer record to the shared `users` table when Supabase is configured

If Supabase Auth, email OTP, or the SMS provider is not configured yet, the login screen will show a setup warning instead of an on-screen demo code.

## Directory Structure

```text
nkeys/
|-- db/
|   \-- schema.sql
|-- src/
|   |-- components/
|   |   |-- FileUploadField.jsx
|   |   |-- Header.jsx
|   |   |-- Layout.jsx
|   |   |-- ProductCard.jsx
|   |   |-- RatingStars.jsx
|   |   |-- ReviewCard.jsx
|   |   \-- SlideCart.jsx
|   |-- context/
|   |   \-- StoreContext.jsx
|   |-- data/
|   |   \-- seed.js
|   |-- lib/
|   |   |-- remoteStore.js
|   |   |-- reviews.js
|   |   |-- supabase.js
|   |   \-- productImageStorage.js
|   |   \-- storage.js
|   |-- pages/
|   |   |-- AdminPage.jsx
|   |   |-- CheckoutPage.jsx
|   |   |-- HomePage.jsx
|   |   |-- OrderSuccessPage.jsx
|   |   |-- ProductPage.jsx
|   |   \-- ProductsPage.jsx
|   |-- App.jsx
|   |-- index.css
|   \-- main.jsx
|-- index.html
|-- package.json
|-- postcss.config.js
|-- tailwind.config.js
\-- vite.config.js
```

## Notes

- The current app syncs shared users and products through Supabase from [src/context/StoreContext.jsx](/c:/Users/Abhyas/projects/nkeys/src/context/StoreContext.jsx) when env vars are configured.
- If Supabase env vars are missing, the app falls back to the local demo store in [src/context/StoreContext.jsx](/c:/Users/Abhyas/projects/nkeys/src/context/StoreContext.jsx).
- New customer reviews are stored as `pending` until they are published from the admin dashboard.
- The legacy `script.js` and `styles.css` files are still in the repo from the previous static build, but the active app entrypoint is Vite + React via `index.html` and `src/main.jsx`.
