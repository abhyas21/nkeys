-- Database schema for NKeys Store
-- Connects custom profiles, products, categories, orders, payments, wishlist, and cart.

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'customer')) DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  discount_price NUMERIC(10, 2) CHECK (discount_price >= 0),
  stock_d INTEGER NOT NULL DEFAULT 0 CHECK (stock_d >= 0),
  stock_k INTEGER NOT NULL DEFAULT 0 CHECK (stock_k >= 0),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Product Images Table
CREATE TABLE IF NOT EXISTS public.product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Cart Table
CREATE TABLE IF NOT EXISTS public.cart (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- 6. Addresses Table
CREATE TABLE IF NOT EXISTS public.addresses (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  house_no TEXT,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL
);

-- 7. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled')),
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'Pending',
  address_id TEXT REFERENCES public.addresses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS alt_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS city_village TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS street_1 TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS street_2 TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS house_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_charge NUMERIC(10, 2) DEFAULT 60;

-- 8. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0)
);

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_name TEXT;

-- 9. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  transaction_id TEXT,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  payment_gateway TEXT NOT NULL DEFAULT 'Razorpay',
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Wishlist Table
CREATE TABLE IF NOT EXISTS public.wishlist (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- 11. Profile Auto-Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NEW.phone,
    CASE 
      WHEN NEW.email IN ('abhyas2006@gmail.com', 'nkeys.coofficial@gmail.com') THEN 'admin'
      ELSE 'customer'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. Helper function to check if is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- 14. Policies

-- Profiles
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- Categories
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin write categories" ON public.categories FOR ALL USING (public.is_admin());

-- Products
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin write products" ON public.products FOR ALL USING (public.is_admin());

-- Product Images
CREATE POLICY "Public read product_images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admin write product_images" ON public.product_images FOR ALL USING (public.is_admin());

-- Cart
CREATE POLICY "Users read cart" ON public.cart FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users write cart" ON public.cart FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- Addresses
CREATE POLICY "Users read addresses" ON public.addresses FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users write addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- Orders
CREATE POLICY "Users read orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users write orders" ON public.orders FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- Order Items
CREATE POLICY "Users read order_items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (user_id = auth.uid() OR public.is_admin())));
CREATE POLICY "Users write order_items" ON public.order_items FOR ALL USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (user_id = auth.uid() OR public.is_admin())));

-- Payments
CREATE POLICY "Users read payments" ON public.payments FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (user_id = auth.uid() OR public.is_admin())));
CREATE POLICY "Users write payments" ON public.payments FOR ALL USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (user_id = auth.uid() OR public.is_admin())));

-- Wishlist
CREATE POLICY "Users read wishlist" ON public.wishlist FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users write wishlist" ON public.wishlist FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- 15. Seed Categories
INSERT INTO public.categories (id, name, image_url)
VALUES
  ('cat-stickers', 'Custom Stickers', 'https://images.unsplash.com/photo-1572375995501-4b0894dbe7d7?w=500'),
  ('cat-holo', 'Holographic Stickers', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500'),
  ('cat-keychains', 'Classic Keychains', 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500'),
  ('cat-photo', 'Photo Keychains', 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=500')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url;

-- 16. Seed Products
INSERT INTO public.products (id, category_id, name, description, price, discount_price, stock_d, stock_k, image_url, is_active)
VALUES
  ('product-metal-tag', 'cat-keychains', 'Metal Tag Classic', 'A premium metal tag keychain made for bags, bikes, lockers, and daily carry. Add initials, a short name, or a tiny date for a personal finish.', 299.00, 199.00, 10, 8, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500', true),
  ('product-acrylic-charm', 'cat-photo', 'Acrylic Charm Pop', 'A lightweight acrylic charm that brings color to keys, bags, and gifting sets. Upload a design or choose a simple name-based layout.', 249.00, 149.00, 12, 12, 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=500', true),
  ('product-leather-loop', 'cat-keychains', 'Leather Loop Daily', 'A clean loop keychain for customers who prefer a warmer, subtle look. Designed for names, dates, initials, and compact brand marks.', 349.00, 249.00, 7, 8, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500', true),
  ('product-couple-tag', 'cat-keychains', 'Couple Tag Set', 'A paired tag set with coordinated styling for anniversaries, birthdays, and small celebrations. Each tag can carry a name, initial, or date.', 499.00, 399.00, 6, 6, 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=500', true),
  ('product-vinyl-sticker', 'cat-stickers', 'Custom Vinyl Sticker Pack', 'A clean vinyl sticker pack for artwork, initials, small logos, or event designs. Great for daily use and small-batch gifting.', 199.00, 149.00, 20, 20, 'https://images.unsplash.com/photo-1572375995501-4b0894dbe7d7?w=500', true),
  ('product-holo-sticker', 'cat-holo', 'Holographic Sticker Drop', 'A small-batch holographic sticker set that catches light beautifully on laptops, cases, planners, and packaging.', 229.00, 179.00, 16, 16, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500', true)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  discount_price = EXCLUDED.discount_price,
  stock_d = EXCLUDED.stock_d,
  stock_k = EXCLUDED.stock_k,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active;
