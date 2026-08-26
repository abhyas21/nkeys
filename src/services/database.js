import { supabase } from "./supabase";
import { seedCategories } from "../data/seed";
import { processImageSource } from "../lib/productImageStorage";

const demoMode = import.meta.env.VITE_DEMO_ADMIN === "true";
const demoKey = "nkeys-demo-products";
const demoCategoriesKey = "nkeys-demo-categories";
const deletedKey = "nkeys-deleted-products";

const readDeleted = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(deletedKey) || "[]"));
  } catch {
    return new Set();
  }
};

const markDeleted = (id) => {
  try {
    const set = readDeleted();
    set.add(String(id));
    localStorage.setItem(deletedKey, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn("markDeleted notice:", e);
  }
};

const readDemo = (key, fallback = []) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
};

const writeDemo = (key, value) => {
  try {
    const sanitizeItem = (item) => {
      if (!item || typeof item !== "object") return item;
      const copy = { ...item };
      if (typeof copy.image_url === "string" && copy.image_url.startsWith("data:image/") && copy.image_url.length > 500) {
        copy.image_url = "/hero-keychain.svg";
      }
      if (Array.isArray(copy.gallery)) {
        copy.gallery = copy.gallery.map((g) => (typeof g === "string" && g.startsWith("data:image/") && g.length > 500 ? "/hero-keychain.svg" : g));
      }
      return copy;
    };

    const sanitized = Array.isArray(value) ? value.map(sanitizeItem) : sanitizeItem(value);
    localStorage.setItem(key, JSON.stringify(sanitized));
  } catch (e) {
    console.warn("localStorage quota notice, stripping image payloads:", e);
    try {
      const fallback = Array.isArray(value)
        ? value.map((item) => ({ ...item, image_url: "/hero-keychain.svg", gallery: ["/hero-keychain.svg"] }))
        : value;
      localStorage.setItem(key, JSON.stringify(fallback));
    } catch (e2) {
      console.warn("localStorage write error:", e2);
    }
  }
};

// In-memory cache for fast navigation
let categoriesCache = { data: null, timestamp: 0 };
let productsCache = { data: null, timestamp: 0 };
const CACHE_TTL = 30000; // 30 seconds

export function clearCache() {
  categoriesCache = { data: null, timestamp: 0 };
  productsCache = { data: null, timestamp: 0 };
}

// 1. Categories
export async function getCategories() {
  const now = Date.now();
  if (categoriesCache.data && (now - categoriesCache.timestamp < CACHE_TTL)) {
    return categoriesCache.data;
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return categoriesCache.data || [];
  }

  categoriesCache = { data: data || [], timestamp: now };
  return data || [];
}

export async function createCategory({ id, name, image_url }) {
  clearCache();
  const { data, error } = await supabase
    .from("categories")
    .insert([{ id, name, image_url }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  clearCache();
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// 2. Products
export async function getProducts() {
  const now = Date.now();
  if (productsCache.data && (now - productsCache.timestamp < CACHE_TTL)) {
    return productsCache.data;
  }

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return productsCache.data || [];
  }

  const formatted = (data || []).map((p) => ({
    ...p,
    is_active: p.is_active ?? true,
    category_name: p.categories?.name || "General",
    price: Number(p.price || 0),
    discount_price: p.discount_price ? Number(p.discount_price) : null,
    stock: Number(p.stock ?? p.inventory ?? (Number(p.stock_d || 0) + Number(p.stock_k || 0))),
    inventory: Number(p.stock ?? p.inventory ?? (Number(p.stock_d || 0) + Number(p.stock_k || 0))),
    image_url: p.image_url || p.image || "/hero-keychain.svg",
    categories: p.categories || { name: "General" }
  }));

  productsCache = { data: formatted, timestamp: now };
  return formatted;
}

export async function createProduct(product) {
  clearCache();
  const slug = product.slug || (product.name || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const dStock = Number(product.stock_d ?? 10);
  const kStock = Number(product.stock_k ?? 10);
  const totalStock = Number(product.stock ?? (dStock + kStock));

  const targetImage = product.image_url || product.imageUrl || product.image || "/hero-keychain.svg";
  let processedImageUrl = targetImage;
  if (typeof processedImageUrl === "string" && processedImageUrl.startsWith("data:image/")) {
    try {
      processedImageUrl = await processImageSource(processedImageUrl);
    } catch {
      // keep base64 string
    }
  }

  const cleanProduct = {
    ...product,
    slug,
    stock: totalStock,
    inventory: totalStock,
    stock_d: dStock,
    stock_k: kStock,
    price: Number(product.price || 0),
    discount_price: product.discount_price ? Number(product.discount_price) : null,
    image_url: processedImageUrl || targetImage,
    image: processedImageUrl || targetImage,
    is_active: true
  };

  const dbPayload = {
    id: cleanProduct.id,
    name: cleanProduct.name,
    description: cleanProduct.description || cleanProduct.name,
    price: cleanProduct.price,
    discount_price: cleanProduct.discount_price,
    stock_d: cleanProduct.stock_d,
    stock_k: cleanProduct.stock_k,
    category_id: cleanProduct.category_id,
    image_url: cleanProduct.image_url,
    is_active: true
  };

  console.log("[DIAGNOSTIC 2 - database.js createProduct]", {
    typeof_image_url: typeof dbPayload.image_url,
    length: dbPayload.image_url ? dbPayload.image_url.length : "MISSING",
    substring_50: dbPayload.image_url ? dbPayload.image_url.substring(0, 50) : "MISSING"
  });

  let savedData = null;
  let supabaseError = null;
  try {
    const { data, error } = await supabase
      .from("products")
      .upsert([dbPayload])
      .select()
      .single();

    if (error) {
      supabaseError = error;
      console.warn("Supabase createProduct notice:", error);
    } else if (data) {
      savedData = data;
    }
  } catch (err) {
    supabaseError = err;
    console.warn("Supabase createProduct exception notice:", err);
  }

  // Always sync locally so new products appear instantly in all views
  const currentLocal = readDemo(demoKey, []);
  const updatedLocal = [cleanProduct, ...currentLocal.filter((p) => p.id !== cleanProduct.id)];
  writeDemo(demoKey, updatedLocal);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("products-updated", { detail: { action: "create", product: cleanProduct } }));
  }

  return savedData || cleanProduct;
}

export async function updateProduct(id, product) {
  const dStock = Number(product.stock_d ?? 10);
  const kStock = Number(product.stock_k ?? 10);
  const totalStock = Number(product.stock ?? (dStock + kStock));

  const targetImage = product.image_url || product.imageUrl || product.image || "/hero-keychain.svg";
  let processedImageUrl = targetImage;
  if (typeof processedImageUrl === "string" && processedImageUrl.startsWith("data:image/")) {
    try {
      processedImageUrl = await processImageSource(processedImageUrl);
    } catch {
      // keep base64 string
    }
  }

  const cleanProduct = {
    ...product,
    stock: totalStock,
    inventory: totalStock,
    stock_d: dStock,
    stock_k: kStock,
    price: Number(product.price || 0),
    discount_price: product.discount_price ? Number(product.discount_price) : null,
    image_url: processedImageUrl || targetImage,
    image: processedImageUrl || targetImage
  };

  const dbPayload = {
    name: cleanProduct.name,
    description: cleanProduct.description || cleanProduct.name,
    price: cleanProduct.price,
    discount_price: cleanProduct.discount_price,
    stock_d: cleanProduct.stock_d,
    stock_k: cleanProduct.stock_k,
    category_id: cleanProduct.category_id,
    image_url: cleanProduct.image_url,
    is_active: cleanProduct.is_active
  };

  let updatedData = null;
  let supabaseError = null;
  try {
    const { data, error } = await supabase
      .from("products")
      .update(dbPayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      supabaseError = error;
      console.warn("Supabase updateProduct notice:", error);
    } else if (data) {
      updatedData = data;
    }
  } catch (err) {
    supabaseError = err;
    console.warn("Supabase updateProduct exception notice:", err);
  }

  const currentLocal = readDemo(demoKey, []);
  const updatedLocal = currentLocal.map((item) => (item.id === id ? { ...item, ...cleanProduct } : item));
  writeDemo(demoKey, updatedLocal);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("products-updated", { detail: { action: "update", id } }));
  }

  if (supabaseError && !updatedData) {
    return { id, ...cleanProduct, _error: supabaseError.message || String(supabaseError) };
  }

  return updatedData || { id, ...cleanProduct };
}

export async function deleteProduct(id) {
  clearCache();
  let supabaseError = null;
  markDeleted(id);

  try {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      supabaseError = error;
      console.warn("Supabase deleteProduct notice:", error);
    }
  } catch (err) {
    supabaseError = err;
    console.warn("Supabase deleteProduct exception notice:", err);
  }

  const currentLocal = readDemo(demoKey, []);
  const updatedLocal = currentLocal.filter((product) => String(product.id) !== String(id));
  writeDemo(demoKey, updatedLocal);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("products-updated", { detail: { action: "delete", id } }));
  }

  if (supabaseError) {
    return { success: true, _warning: supabaseError.message || String(supabaseError) };
  }
  return { success: true };
}

export async function replaceProductImages(productId, imageUrls) {
  const urls = (Array.isArray(imageUrls) ? imageUrls : []).filter(Boolean);

  try {
    const products = readDemo(demoKey, []);
    writeDemo(
      demoKey,
      products.map((product) =>
        product.id === productId
          ? {
              ...product,
              gallery: urls,
              product_images: urls.map((image_url, sort_order) => ({ image_url, sort_order }))
            }
          : product
      )
    );
  } catch (e) {
    console.warn("Local storage gallery update notice:", e);
  }

  try {
    await supabase.from("product_images").delete().eq("product_id", productId);
    if (urls.length > 0) {
      const rows = urls.map((image_url, sort_order) => ({
        id: `img-${Date.now()}-${sort_order}`,
        product_id: productId,
        image_url: image_url.length > 2000 ? "/hero-keychain.svg" : image_url,
        sort_order
      }));
      await supabase.from("product_images").insert(rows);
    }
  } catch (err) {
    console.warn("Supabase product_images insert notice:", err);
  }

  return urls;
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
const demoOrdersKey = "nkeys-demo-orders";

// 7. Orders & Payments
export async function getUserOrders(userOrEmail) {
  if (!userOrEmail) return [];

  const email =
    typeof userOrEmail === "string"
      ? userOrEmail.toLowerCase().trim()
      : userOrEmail?.email?.toLowerCase().trim();

  const userId = typeof userOrEmail === "object" ? userOrEmail?.id : null;

  let supabaseOrders = [];
  try {
    let query = supabase.from("orders").select("*, order_items(*)");

    if (userId && email) {
      query = query.or(`user_id.eq.${userId},customer_email.ilike.${email},user_email.ilike.${email}`);
    } else if (email) {
      query = query.or(`customer_email.ilike.${email},user_email.ilike.${email}`);
    } else if (userId) {
      query = query.eq("user_id", userId);
    } else {
      return [];
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) {
      console.error("[GET USER ORDERS ERROR]:", error);
    } else if (data) {
      supabaseOrders = data;
    }
  } catch (err) {
    console.error("[GET USER ORDERS EXCEPTION]:", err);
  }

  // Also query local fallback items
  const localOrders = readDemo(demoOrdersKey, []);
  const map = new Map();

  supabaseOrders.forEach((o) => map.set(String(o.id), o));

  localOrders.forEach((o) => {
    const oEmail = (o.customer_email || o.user_email || "").toLowerCase().trim();
    if (!map.has(String(o.id))) {
      if ((userId && o.user_id === userId) || (email && oEmail === email)) {
        map.set(String(o.id), o);
      }
    }
  });

  return Array.from(map.values()).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

export async function getOrders(userOrEmail = null) {
  if (userOrEmail) {
    return getUserOrders(userOrEmail);
  }

  let supabaseOrders = [];
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (!error && data) {
      supabaseOrders = data;
    }
  } catch (err) {
    console.warn("Supabase getOrders notice:", err);
  }

  const localOrders = readDemo(demoOrdersKey, []);
  const map = new Map();

  supabaseOrders.forEach((o) => {
    map.set(String(o.id), o);
  });

  localOrders.forEach((o) => {
    if (!map.has(String(o.id))) {
      map.set(String(o.id), o);
    }
  });

  return Array.from(map.values()).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

export async function getOrderById(id) {
  const allOrders = await getOrders();
  const found = allOrders.find((o) => String(o.id) === String(id));
  if (found) return found;

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createOrder(order, items = []) {
  const safeId =
    order.id && order.id.length === 36 && order.id.includes("-")
      ? order.id
      : typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `order-${Date.now()}`;

  const cleanOrder = {
    ...order,
    id: safeId,
    created_at: order.created_at || new Date().toISOString(),
    status: order.status || "Pending",
    total_amount: Number(order.total_amount || order.subtotal || 0)
  };

  const dbPayload = {
    id: cleanOrder.id,
    user_email: cleanOrder.user_email || cleanOrder.email || "customer@example.com",
    full_name: cleanOrder.full_name || cleanOrder.name || "Customer",
    phone: cleanOrder.phone || "",
    alt_phone: cleanOrder.alt_phone || null,
    state: cleanOrder.state || "",
    district: cleanOrder.district || "",
    city_village: cleanOrder.city_village || "",
    postal_code: cleanOrder.postal_code || "",
    street_1: cleanOrder.street_1 || "",
    street_2: cleanOrder.street_2 || null,
    house_number: cleanOrder.house_number || "",
    subtotal: Number(cleanOrder.subtotal || 0),
    delivery_charge: Number(cleanOrder.delivery_charge || 60),
    total_amount: Number(cleanOrder.total_amount || 0),
    status: cleanOrder.status
  };

  let savedOrder = null;
  let supabaseError = null;

  try {
    const { data: insertedOrder, error: orderError } = await supabase
      .from("orders")
      .insert([dbPayload])
      .select()
      .single();

    if (orderError) {
      supabaseError = orderError;
      console.error("[ORDER ERROR]", orderError);
    } else if (insertedOrder) {
      savedOrder = insertedOrder;

      if (items && items.length > 0) {
        const itemsToInsert = items.map((item) => ({
          id:
            item.id && item.id.length === 36
              ? item.id
              : typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          order_id: insertedOrder.id,
          product_id: item.product_id,
          product_name: item.product_name || item.name || "Keychain Item",
          quantity: Number(item.quantity || 1),
          price: Number(item.price || 0)
        }));

        await supabase.from("order_items").insert(itemsToInsert).catch((e) => console.error("[ORDER ITEMS ERROR]", e));
      }
    }
  } catch (err) {
    supabaseError = err;
    console.warn("Supabase createOrder exception notice:", err);
  }

  // Always sync locally so newly placed orders render immediately in Admin & Customer views
  const orderWithItems = {
    ...cleanOrder,
    order_items: items.map((it) => ({
      ...it,
      order_id: cleanOrder.id,
      product_name: it.product_name || it.name || "Keychain Item"
    }))
  };

  const currentLocal = readDemo(demoOrdersKey, []);
  const updatedLocal = [orderWithItems, ...currentLocal.filter((o) => String(o.id) !== String(cleanOrder.id))];
  writeDemo(demoOrdersKey, updatedLocal);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("orders-updated", { detail: { action: "create", order: orderWithItems } }));
  }

  return savedOrder || orderWithItems;
}

export async function updateOrderStatus(orderId, newStatus) {
  const cleanStatus = String(newStatus).toUpperCase();

  const { data, error } = await supabase
    .from("orders")
    .update({
      status: cleanStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", orderId)
    .select();

  if (error) {
    console.error("[SUPABASE STATUS UPDATE ERROR]:", error);
    throw error;
  }

  // Update local demo storage as well
  const localOrders = readDemo(demoOrdersKey, []);
  const updatedLocal = localOrders.map((o) =>
    String(o.id) === String(orderId) ? { ...o, status: cleanStatus, order_status: cleanStatus } : o
  );
  writeDemo(demoOrdersKey, updatedLocal);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("orders-updated", { detail: { orderId, status: cleanStatus } }));
    window.dispatchEvent(new Event("orders-updated"));
  }

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

export function getProductImageUrl(input) {
  const path = typeof input === "object" && input !== null ? (input.image_url || input.image || input.gallery?.[0]) : input;
  if (!path || typeof path !== "string" || path.trim() === "") {
    return "/hero-keychain.svg";
  }
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/") || path.startsWith("data:image/")) {
    return path;
  }
  try {
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data?.publicUrl || path;
  } catch {
    return path;
  }
}
