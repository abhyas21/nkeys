import { supabase } from "./supabase";
import { seedCategories, seedProducts } from "../data/seed";

const demoMode = import.meta.env.VITE_DEMO_ADMIN === "true";
const demoKey = "nkeys-demo-products";
const demoCategoriesKey = "nkeys-demo-categories";
const readDemo = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
};
const writeDemo = (key, value) => localStorage.setItem(key, JSON.stringify(value));

// 1. Categories
export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  if (error) {
    if (demoMode) return readDemo(demoCategoriesKey, seedCategories);
    throw error;
  }
  return data;
}

export async function createCategory({ id, name, image_url }) {
  const { data, error } = await supabase
    .from("categories")
    .insert([{ id, name, image_url }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// 2. Products
export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*), product_images(*)")
    .order("created_at", { ascending: false });
  if (error) {
    if (demoMode) return readDemo(demoKey, seedProducts).map((product) => ({
      ...product,
      category_id: product.categoryId,
      discount_price: product.compareAtPrice || null,
      stock: product.inventory,
      image_url: product.gallery?.[0] || null,
      is_active: true,
      categories: { name: seedCategories.find((category) => category.id === product.categoryId)?.name || "General" },
      product_images: (product.gallery || []).map((image_url, sort_order) => ({ image_url, sort_order }))
    }));
    throw error;
  }
  return data;
}

export async function createProduct(product) {
  const { data, error } = await supabase
    .from("products")
    .insert([product])
    .select()
    .single();
  if (error) {
    if (demoMode) {
      const products = readDemo(demoKey, seedProducts);
      writeDemo(demoKey, [...products, { ...product, categoryId: product.category_id, inventory: product.stock, compareAtPrice: product.discount_price || 0, gallery: product.image_url ? [product.image_url] : [] }]);
      return product;
    }
    throw error;
  }
  return data;
}

export async function updateProduct(id, product) {
  const { data, error } = await supabase
    .from("products")
    .update(product)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    if (demoMode) {
      const products = readDemo(demoKey, seedProducts);
      writeDemo(demoKey, products.map((item) => item.id === id ? { ...item, ...product, categoryId: product.category_id, inventory: product.stock, compareAtPrice: product.discount_price || 0, gallery: product.image_url ? [product.image_url] : item.gallery } : item));
      return { id, ...product };
    }
    throw error;
  }
  return data;
}

export async function deleteProduct(id) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);
  if (error) {
    if (demoMode) {
      writeDemo(demoKey, readDemo(demoKey, seedProducts).filter((product) => product.id !== id));
      return;
    }
    throw error;
  }
}

export async function replaceProductImages(productId, imageUrls) {
  if (demoMode) {
    const products = readDemo(demoKey, seedProducts);
    writeDemo(demoKey, products.map((product) => product.id === productId ? { ...product, gallery: imageUrls } : product));
    return imageUrls;
  }
  const { error: deleteError } = await supabase.from("product_images").delete().eq("product_id", productId);
  if (deleteError) throw deleteError;
  const urls = (Array.isArray(imageUrls) ? imageUrls : []).filter(Boolean);
  if (!urls.length) return [];
  const rows = urls.map((image_url, sort_order) => ({ id: `product-image-${Date.now()}-${sort_order}`, product_id: productId, image_url, sort_order }));
  const { data, error } = await supabase.from("product_images").insert(rows).select();
  if (error) throw error;
  return data;
}

// 3. Product Images
export async function getProductImages(productId) {
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function addProductImage({ id, product_id, image_url, sort_order }) {
  const { data, error } = await supabase
    .from("product_images")
    .insert([{ id, product_id, image_url, sort_order }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// 4. Cart
export async function getCart(userId) {
  const { data, error } = await supabase
    .from("cart")
    .select("*, products(*)")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
}

export async function addToCart({ id, user_id, product_id, quantity }) {
  const { data, error } = await supabase
    .from("cart")
    .upsert([{ id, user_id, product_id, quantity }], { onConflict: "user_id,product_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCartQuantity(id, quantity) {
  const { data, error } = await supabase
    .from("cart")
    .update({ quantity })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeFromCart(id) {
  const { error } = await supabase
    .from("cart")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function clearCart(userId) {
  const { error } = await supabase
    .from("cart")
    .delete()
    .eq("user_id", userId);
  if (error) throw error;
}

// 5. Wishlist
export async function getWishlist(userId) {
  const { data, error } = await supabase
    .from("wishlist")
    .select("*, products(*)")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
}

export async function toggleWishlist({ id, user_id, product_id }) {
  const { data: existing } = await supabase
    .from("wishlist")
    .select("*")
    .eq("user_id", user_id)
    .eq("product_id", product_id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
    return { added: false };
  } else {
    const { error } = await supabase
      .from("wishlist")
      .insert([{ id, user_id, product_id }]);
    if (error) throw error;
    return { added: true };
  }
}

// 6. Addresses
export async function getAddresses(userId) {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
}

export async function createAddress(address) {
  const { data, error } = await supabase
    .from("addresses")
    .insert([address])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAddress(id) {
  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// 7. Orders & Payments
export async function getOrders(userId = null) {
  let query = supabase.from("orders").select("*, order_items(*, products(*)), addresses(*)");
  if (userId) {
    query = query.eq("user_id", userId);
  }
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getOrderById(id) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, products(*)), addresses(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createOrder(order, items) {
  const { data: insertedOrder, error: orderError } = await supabase
    .from("orders")
    .insert([order])
    .select()
    .single();

  if (orderError) throw orderError;

  const itemsToInsert = items.map((item) => ({
    id: item.id,
    order_id: insertedOrder.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsToInsert);

  if (itemsError) throw itemsError;

  for (const item of items) {
    const { data: prod } = await supabase
      .from("products")
      .select("stock_d, stock_k")
      .eq("id", item.product_id)
      .single();

    if (prod) {
      let rem = item.quantity;
      let newD = prod.stock_d;
      let newK = prod.stock_k;

      if (newD >= rem) {
        newD -= rem;
        rem = 0;
      } else {
        rem -= newD;
        newD = 0;
      }

      if (rem > 0) {
        newK = Math.max(0, newK - rem);
      }

      await supabase
        .from("products")
        .update({ stock_d: newD, stock_k: newK })
        .eq("id", item.product_id);
    }
  }

  return insertedOrder;
}

export async function updateOrderStatus(id, status) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateOrderPaymentStatus(id, payment_status) {
  const { data, error } = await supabase
    .from("orders")
    .update({ payment_status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function recordPayment(payment) {
  const { data, error } = await supabase
    .from("payments")
    .insert([payment])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getCustomersCount() {
  const { data, error, count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "customer");
  if (error) throw error;
  return count;
}

export function getProductImageUrl(path) {
  if (!path) return "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
