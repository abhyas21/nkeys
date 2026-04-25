-- Supabase schema for shared NKeys catalog and customer login records.
-- Apply this in the Supabase SQL editor before running the app with live env vars.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  gender TEXT,
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

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  shipping_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  payment_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  shipping_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  coupon_code TEXT,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  customization_file_name TEXT,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id
  ON product_images(product_id);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public users select" ON users;
DROP POLICY IF EXISTS "Public users write" ON users;
DROP POLICY IF EXISTS "Public products select" ON products;
DROP POLICY IF EXISTS "Public products write" ON products;
DROP POLICY IF EXISTS "Public product images select" ON product_images;
DROP POLICY IF EXISTS "Public product images write" ON product_images;
DROP POLICY IF EXISTS "Public orders select" ON orders;
DROP POLICY IF EXISTS "Public orders write" ON orders;
DROP POLICY IF EXISTS "Public order items select" ON order_items;
DROP POLICY IF EXISTS "Public order items write" ON order_items;

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

CREATE POLICY "Public orders select"
  ON orders FOR SELECT
  USING (TRUE);

CREATE POLICY "Public orders write"
  ON orders FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Public order items select"
  ON order_items FOR SELECT
  USING (TRUE);

CREATE POLICY "Public order items write"
  ON order_items FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- Atomic Checkout RPC
-- Deducts inventory securely and processes order & order_items in a single transaction
CREATE OR REPLACE FUNCTION process_checkout(
  order_id TEXT,
  order_number TEXT,
  user_id TEXT,
  user_email TEXT,
  order_status TEXT,
  shipping JSONB,
  payment JSONB,
  sub NUMERIC,
  shipping_amt NUMERIC,
  discount_amt NUMERIC,
  coupon TEXT,
  total NUMERIC,
  items JSONB
) RETURNS BOOLEAN AS $$
DECLARE
  item JSONB;
  prod_inventory INTEGER;
BEGIN
  -- Insert Order
  INSERT INTO orders (
    id, number, user_id, user_email, status, shipping_details, 
    payment_details, subtotal, shipping_amount, discount_amount, 
    coupon_code, total_amount
  )
  VALUES (
    order_id, order_number, user_id, user_email, order_status, shipping, 
    payment, sub, shipping_amt, discount_amt, coupon, total
  );

  -- Loop through items
  FOR item IN SELECT * FROM jsonb_array_elements(items)
  LOOP
    -- Check and decrement inventory using a row lock to prevent race conditions
    SELECT inventory INTO prod_inventory 
    FROM products 
    WHERE id = item->>'product_id' 
    FOR UPDATE;

    IF prod_inventory IS NULL THEN
      RAISE EXCEPTION 'Product % not found', item->>'product_id';
    END IF;

    IF prod_inventory < (item->>'quantity')::INTEGER THEN
      RAISE EXCEPTION 'Not enough inventory for %', item->>'name';
    END IF;

    UPDATE products 
    SET inventory = inventory - (item->>'quantity')::INTEGER 
    WHERE id = item->>'product_id';

    -- Insert order item
    INSERT INTO order_items (id, order_id, product_id, name, price, quantity, customization_file_name, total)
    VALUES (item->>'line_id', order_id, item->>'product_id', item->>'name', (item->>'price')::NUMERIC, (item->>'quantity')::INTEGER, item->>'customization_file_name', (item->>'total')::NUMERIC);
  END LOOP;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create a public storage bucket named "product-images" in Supabase Storage.
-- Then add public read and write policies for that bucket.
