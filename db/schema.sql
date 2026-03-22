-- Supabase schema for shared NKeys catalog and customer login records.
-- Apply this in the Supabase SQL editor before running the app with live env vars.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'customer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10, 2) NOT NULL,
  compare_at_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'sticker' CHECK (type IN ('sticker', 'keychain')),
  category_id TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  inventory INTEGER NOT NULL DEFAULT 0 CHECK (inventory >= 0),
  turnaround_days TEXT NOT NULL DEFAULT '3-5 business days',
  upload_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  materials JSONB NOT NULL DEFAULT '[]'::jsonb,
  specs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id
  ON product_images(product_id);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public users select" ON users;
DROP POLICY IF EXISTS "Public users write" ON users;
DROP POLICY IF EXISTS "Public products select" ON products;
DROP POLICY IF EXISTS "Public products write" ON products;
DROP POLICY IF EXISTS "Public product images select" ON product_images;
DROP POLICY IF EXISTS "Public product images write" ON product_images;

CREATE POLICY "Public users select"
  ON users FOR SELECT
  USING (TRUE);

CREATE POLICY "Public users write"
  ON users FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Public products select"
  ON products FOR SELECT
  USING (TRUE);

CREATE POLICY "Public products write"
  ON products FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Public product images select"
  ON product_images FOR SELECT
  USING (TRUE);

CREATE POLICY "Public product images write"
  ON product_images FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- Create a public storage bucket named "product-images" in Supabase Storage.
-- Then add public read and write policies for that bucket.
