import { roleFromEmail } from "./auth";
import { isSupabaseConfigured, supabase } from "./supabase";

const PRODUCT_SELECT = `
  id,
  slug,
  name,
  description,
  short_description,
  price,
  compare_at_price,
  type,
  category_id,
  featured,
  inventory,
  turnaround_days,
  upload_enabled,
  materials,
  specs,
  product_images (
    id,
    image_url,
    sort_order
  )
`;

const USER_SELECT = "id, name, phone, email, role";

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const text = (value, fallback = "") => {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
};

const amount = (value, fallback = 0) => {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? Math.max(0, normalized) : fallback;
};

const integer = (value, fallback = 0) => {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? Math.max(0, Math.floor(normalized)) : fallback;
};

const booleanValue = (value, fallback = false) =>
  typeof value === "boolean" ? value : fallback;

const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const normalizeStringList = (value) => {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry ?? "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed)
        ? parsed.map((entry) => String(entry ?? "").trim()).filter(Boolean)
        : [trimmed];
    } catch {
      return [trimmed];
    }
  }

  return [];
};

const createFallbackGallery = (name, subtitle, accent) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" role="img" aria-label="${name}">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}" />
          <stop offset="100%" stop-color="#f3e7d8" />
        </linearGradient>
      </defs>
      <rect width="1200" height="1200" fill="#faf6f0" />
      <rect x="130" y="130" width="940" height="940" rx="46" fill="url(#g)" />
      <text x="200" y="350" font-size="90" font-family="Arial, sans-serif" font-weight="700" fill="#171717">${name}</text>
      <text x="200" y="430" font-size="34" font-family="Arial, sans-serif" fill="#2f2f2f">${subtitle}</text>
      <text x="200" y="940" font-size="36" font-family="Arial, sans-serif" fill="#2f2f2f">NKeys custom studio</text>
    </svg>
  `;
  const uri = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  return [uri, uri, uri];
};

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured.");
  }
}

function toAppUser(record) {
  if (!record) {
    return null;
  }

  return {
    id: text(record.id),
    name: text(record.name),
    phone: text(record.phone),
    email: text(record.email),
    role: text(record.role, roleFromEmail(record.email))
  };
}

function toAppProduct(record, fallbackCategoryId) {
  if (!record) {
    return null;
  }

  const images = Array.isArray(record.product_images)
    ? [...record.product_images]
        .sort((left, right) => integer(left?.sort_order) - integer(right?.sort_order))
        .map((image) => text(image?.image_url))
        .filter(Boolean)
    : [];

  const name = text(record.name, "Custom product");
  const shortDescription = text(record.short_description, text(record.description, name));
  const type = text(record.type, "sticker");

  return {
    id: text(record.id),
    slug: text(record.slug, slugify(name)),
    name,
    type,
    categoryId: text(record.category_id, fallbackCategoryId),
    price: amount(record.price),
    compareAtPrice: amount(record.compare_at_price),
    shortDescription,
    description: text(record.description, shortDescription),
    materials: normalizeStringList(record.materials),
    turnaroundDays: text(record.turnaround_days, "3-5 business days"),
    uploadEnabled: booleanValue(record.upload_enabled),
    featured: booleanValue(record.featured),
    inventory: integer(record.inventory, 25),
    syncState: "synced",
    gallery: images.length
      ? images
      : createFallbackGallery(name, shortDescription, type === "sticker" ? "#cc6a3d" : "#3f6755"),
    specs: normalizeStringList(record.specs)
  };
}

function toProductRow(product) {
  return {
    id: text(product.id, createId("product")),
    slug: text(product.slug, slugify(product.name)),
    name: text(product.name, "Custom product"),
    description: text(product.description),
    short_description: text(product.shortDescription, text(product.description, product.name)),
    price: amount(product.price),
    compare_at_price: amount(product.compareAtPrice),
    type: text(product.type, "sticker"),
    category_id: text(product.categoryId),
    featured: Boolean(product.featured),
    inventory: integer(product.inventory, 25),
    turnaround_days: text(product.turnaroundDays, "3-5 business days"),
    upload_enabled: Boolean(product.uploadEnabled),
    materials: normalizeStringList(product.materials),
    specs: normalizeStringList(product.specs)
  };
}

async function fetchRemoteProductById(productId, fallbackCategoryId) {
  ensureSupabase();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", productId)
    .single();

  if (error) {
    throw error;
  }

  return toAppProduct(data, fallbackCategoryId);
}

export async function fetchRemoteStoreSnapshot(categories = []) {
  ensureSupabase();
  const fallbackCategoryId = categories[0]?.id || "cat-stickers";

  const [usersResponse, productsResponse] = await Promise.all([
    supabase.from("users").select(USER_SELECT),
    supabase.from("products").select(PRODUCT_SELECT)
  ]);

  if (usersResponse.error) {
    throw usersResponse.error;
  }

  if (productsResponse.error) {
    throw productsResponse.error;
  }

  return {
    users: Array.isArray(usersResponse.data)
      ? usersResponse.data.map(toAppUser).filter(Boolean)
      : [],
    products: Array.isArray(productsResponse.data)
      ? productsResponse.data
          .map((record) => toAppProduct(record, fallbackCategoryId))
          .filter(Boolean)
      : []
  };
}

export async function upsertRemoteUser(user) {
  ensureSupabase();

  const email = text(user.email).toLowerCase();
  const phone = text(user.phone);
  let resolvedId = text(user.id);

  const { data: existingUsers, error: lookupError } = await supabase
    .from("users")
    .select(USER_SELECT)
    .or(`email.eq.${email},phone.eq.${phone}`);

  if (lookupError) {
    throw lookupError;
  }

  if (Array.isArray(existingUsers) && existingUsers.length) {
    resolvedId = text(existingUsers[0].id, resolvedId);
  }

  const row = {
    id: resolvedId || createId("user"),
    name: text(user.name, "Customer"),
    phone,
    email,
    role: text(user.role, roleFromEmail(email))
  };

  const { data, error } = await supabase
    .from("users")
    .upsert(row, { onConflict: "id" })
    .select(USER_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return toAppUser(data);
}

export async function saveRemoteProduct(product, categories = []) {
  ensureSupabase();
  const fallbackCategoryId = categories[0]?.id || "cat-stickers";
  const productRow = toProductRow(product);

  const { error: productError } = await supabase
    .from("products")
    .upsert(productRow, { onConflict: "id" });

  if (productError) {
    throw productError;
  }

  const { error: deleteImagesError } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productRow.id);

  if (deleteImagesError) {
    throw deleteImagesError;
  }

  const imageRows = normalizeStringList(product.gallery).map((imageUrl, index) => ({
    id: createId("product-image"),
    product_id: productRow.id,
    image_url: imageUrl,
    sort_order: index
  }));

  if (imageRows.length) {
    const { error: imageInsertError } = await supabase
      .from("product_images")
      .insert(imageRows);

    if (imageInsertError) {
      throw imageInsertError;
    }
  }

  const savedProduct = await fetchRemoteProductById(productRow.id, fallbackCategoryId);
  return savedProduct;
}
