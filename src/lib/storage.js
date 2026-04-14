import { seedStore } from "../data/seed";
import { roleFromEmail } from "./auth";

export const STORE_KEY = "nkeys-react-store-v2";
export const SESSION_KEY = `${STORE_KEY}:session`;

const PRODUCT_TYPES = new Set(["sticker", "keychain"]);
const PRODUCT_SYNC_STATES = new Set(["synced", "local-only"]);
const REVIEW_STATUSES = new Set(["pending", "published", "hidden"]);
const ORDER_STATUSES = new Set([
  "Pending confirmation",
  "Paid",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled"
]);
const VERIFICATION_METHODS = new Set(["email", "phone"]);

const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const text = (value, fallback = "") => {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
};

const integer = (value, fallback = 0) => {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? Math.max(0, Math.floor(normalized)) : fallback;
};

const amount = (value, fallback = 0) => {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? Math.max(0, normalized) : fallback;
};

const booleanValue = (value, fallback = false) =>
  typeof value === "boolean" ? value : fallback;

const stringArray = (value) =>
  Array.isArray(value)
    ? value.map((entry) => String(entry ?? "").trim()).filter(Boolean)
    : [];

const isoDate = (value) => {
  const normalized = new Date(value);
  return Number.isNaN(normalized.getTime())
    ? new Date().toISOString()
    : normalized.toISOString();
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

function normalizeCategories(categories) {
  const normalized = Array.isArray(categories)
    ? categories
      .map((category, index) => {
        if (!category || typeof category !== "object") {
          return null;
        }

        const name = text(category.name, `Category ${index + 1}`);
        return {
          id: text(category.id, `category-${index + 1}`),
          name,
          slug: text(category.slug, slugify(name))
        };
      })
      .filter(Boolean)
    : [];

  return normalized.length ? normalized : seedStore.categories;
}

function normalizeUsers(users) {
  const normalized = Array.isArray(users)
    ? users
      .map((user, index) => {
        if (!user || typeof user !== "object") {
          return null;
        }

        const name = text(user.name, `User ${index + 1}`);
        const email = text(user.email);
        if (!email) {
          return null;
        }

        return {
          id: text(user.id, `user-${index + 1}`),
          name,
          email,
          phone: text(user.phone),
          role: roleFromEmail(email)
        };
      })
      .filter(Boolean)
    : [];

  return normalized.length ? normalized : seedStore.users;
}

function normalizeSession(session, validUserIds) {
  if (!session || typeof session !== "object") {
    return null;
  }

  const name = text(session.name);
  const email = text(session.email);
  const phone = text(session.phone);
  const verifiedBy = VERIFICATION_METHODS.has(session.verifiedBy) ? session.verifiedBy : "email";
  const role = roleFromEmail(email);

  if (!name || !email || !phone) {
    return null;
  }

  return {
    userId: validUserIds.has(session.userId) ? session.userId : null,
    name,
    email,
    phone,
    role,
    verifiedBy,
    verifiedAt: isoDate(session.verifiedAt),
    isVerified: booleanValue(session.isVerified, true)
  };
}

function normalizeProducts(products, fallbackCategoryId) {
  const normalized = Array.isArray(products)
    ? products
      .map((product, index) => {
        if (!product || typeof product !== "object") {
          return null;
        }

        const name = text(product.name, `Product ${index + 1}`);
        const shortDescription = text(product.shortDescription, "Custom product");
        const gallery = stringArray(product.gallery);
        const type = PRODUCT_TYPES.has(product.type) ? product.type : "sticker";

        return {
          id: text(product.id, `product-${index + 1}`),
          slug: text(product.slug, slugify(name)),
          name,
          type,
          categoryId: text(product.categoryId, fallbackCategoryId),
          price: amount(product.price),
          compareAtPrice: amount(product.compareAtPrice),
          shortDescription,
          description: text(product.description, shortDescription),
          materials: stringArray(product.materials),
          turnaroundDays: text(product.turnaroundDays, "3-5 business days"),
          uploadEnabled: booleanValue(product.uploadEnabled),
          featured: booleanValue(product.featured),
          inventory: integer(product.inventory),
          syncState: PRODUCT_SYNC_STATES.has(product.syncState) ? product.syncState : "synced",
          gallery: gallery.length
            ? gallery
            : createFallbackGallery(
              name,
              shortDescription,
              type === "sticker" ? "#cc6a3d" : "#3f6755"
            ),
          specs: stringArray(product.specs)
        };
      })
      .filter(Boolean)
    : [];

  return normalized.length ? normalized : seedStore.products;
}

function normalizeReviews(reviews, validProductIds, validUserIds, validOrderIds) {
  if (!Array.isArray(reviews)) {
    return seedStore.reviews;
  }

  return reviews
    .map((review, index) => {
      if (!review || typeof review !== "object") {
        return null;
      }

      const productId = text(review.productId);
      if (!productId || !validProductIds.has(productId)) {
        return null;
      }

      return {
        id: text(review.id, `review-${index + 1}`),
        productId,
        userId: validUserIds.has(review.userId) ? review.userId : null,
        orderId: validOrderIds.has(review.orderId) ? review.orderId : null,
        authorName: text(review.authorName, "Anonymous"),
        authorEmail: text(review.authorEmail),
        rating: Math.min(5, Math.max(1, integer(review.rating, 5))),
        title: text(review.title, "Customer review"),
        comment: text(review.comment),
        verifiedPurchase: booleanValue(review.verifiedPurchase),
        status: REVIEW_STATUSES.has(review.status) ? review.status : "pending",
        helpfulCount: integer(review.helpfulCount),
        createdAt: isoDate(review.createdAt),
        photos: stringArray(review.photos)
      };
    })
    .filter(Boolean);
}

function normalizeOrders(orders) {
  if (!Array.isArray(orders)) {
    return seedStore.orders;
  }

  return orders
    .map((order, index) => {
      if (!order || typeof order !== "object") {
        return null;
      }

      const items = Array.isArray(order.items)
        ? order.items
          .map((item, itemIndex) => {
            if (!item || typeof item !== "object") {
              return null;
            }

            return {
              lineId: text(item.lineId, `line-${index + 1}-${itemIndex + 1}`),
              productId: text(item.productId),
              name: text(item.name, "Custom product"),
              price: amount(item.price),
              quantity: Math.max(1, integer(item.quantity, 1)),
              customizationFileName: text(item.customizationFileName),
              total: amount(item.total)
            };
          })
          .filter(Boolean)
        : [];

      return {
        id: text(order.id, `order-${index + 1}`),
        number: text(order.number, `NK-${String(index + 1025).padStart(5, "0")}`),
        createdAt: isoDate(order.createdAt),
        status: ORDER_STATUSES.has(order.status) ? order.status : "Pending confirmation",
        userId: text(order.userId) || null,
        userEmail: text(order.userEmail),
        shipping: {
          fullName: text(order.shipping?.fullName),
          email: text(order.shipping?.email),
          phone: text(order.shipping?.phone),
          address: text(order.shipping?.address),
          city: text(order.shipping?.city),
          state: text(order.shipping?.state),
          pincode: text(order.shipping?.pincode),
          notes: text(order.shipping?.notes)
        },
        payment: {
          method: text(order.payment?.method),
          reference: text(order.payment?.reference)
        },
        items,
        subtotal: amount(order.subtotal),
        shippingAmount: amount(order.shippingAmount),
        discountAmount: amount(order.discountAmount),
        couponCode: text(order.couponCode),
        total: amount(order.total)
      };
    })
    .filter(Boolean);
}

function normalizeCart(cart, validProductIds) {
  if (!Array.isArray(cart)) {
    return [];
  }

  return cart
    .map((line, index) => {
      if (!line || typeof line !== "object") {
        return null;
      }

      const productId = text(line.productId);
      if (!productId || !validProductIds.has(productId)) {
        return null;
      }

      return {
        id: text(line.id, `cart-${index + 1}`),
        key: text(line.key, `${productId}::standard`),
        productId,
        quantity: Math.max(1, integer(line.quantity, 1)),
        customizationFileName: text(line.customizationFileName)
      };
    })
    .filter(Boolean);
}

function normalizeLikedProductIds(likedProductIds, validProductIds) {
  if (!Array.isArray(likedProductIds)) {
    return [];
  }

  return likedProductIds
    .map((productId) => text(productId))
    .filter((productId) => productId && validProductIds.has(productId));
}

function normalizeHelpfulVotes(helpfulVotes, validReviewIds) {
  if (!Array.isArray(helpfulVotes)) {
    return [];
  }

  return helpfulVotes
    .map((reviewId) => text(reviewId))
    .filter((reviewId) => reviewId && validReviewIds.has(reviewId));
}

function normalizeStore(parsed) {
  const categories = normalizeCategories(parsed?.categories);
  const users = normalizeUsers(parsed?.users);
  const products = normalizeProducts(parsed?.products, categories[0]?.id || seedStore.categories[0].id);
  const orders = normalizeOrders(parsed?.orders);

  const validProductIds = new Set(products.map((product) => product.id));
  const validUserIds = new Set(users.map((user) => user.id));
  const validOrderIds = new Set(orders.map((order) => order.id));
  const reviews = normalizeReviews(parsed?.reviews, validProductIds, validUserIds, validOrderIds);
  const validReviewIds = new Set(reviews.map((review) => review.id));

  return {
    ...seedStore,
    ...parsed,
    categories,
    users,
    products,
    reviews,
    orders,
    cart: normalizeCart(parsed?.cart, validProductIds),
    likedProductIds: normalizeLikedProductIds(parsed?.likedProductIds, validProductIds),
    helpfulVotes: normalizeHelpfulVotes(parsed?.helpfulVotes, validReviewIds),
    session: normalizeSession(parsed?.session, validUserIds)
  };
}

function readSession(validUserIds) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return normalizeSession(parsed, validUserIds);
  } catch {
    return null;
  }
}

function writeSession(session) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (!session) {
      window.sessionStorage.removeItem(SESSION_KEY);
      return;
    }

    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Ignore session persistence failures and keep the app usable.
  }
}

export function readStore() {
  if (typeof window === "undefined") {
    return seedStore;
  }

  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) {
      const validUserIds = new Set(seedStore.users.map((user) => user.id));
      return {
        ...seedStore,
        session: readSession(validUserIds)
      };
    }

    const parsed = JSON.parse(raw);
    const normalizedStore = normalizeStore(parsed);
    const validUserIds = new Set(normalizedStore.users.map((user) => user.id));

    return {
      ...normalizedStore,
      session: readSession(validUserIds)
    };
  } catch {
    const validUserIds = new Set(seedStore.users.map((user) => user.id));
    return {
      ...seedStore,
      session: readSession(validUserIds)
    };
  }
}

export function writeStore(store) {
  if (typeof window === "undefined") {
    return;
  }

  writeSession(store?.session || null);

  const persistableStore = {
    ...store,
    session: null
  };

  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(persistableStore));
  } catch (error) {
    try {
      const compactStore = {
        ...persistableStore,
        reviews: Array.isArray(store?.reviews)
          ? store.reviews.map((review) => ({ ...review, photos: [] }))
          : []
      };
      window.localStorage.setItem(STORE_KEY, JSON.stringify(compactStore));
      console.warn(
        "NKeys store was too large to save completely. Review photos were skipped for persistence.",
        error
      );
    } catch (compactError) {
      console.warn(
        "NKeys store could not be persisted to localStorage. The app will continue without saving this session.",
        compactError
      );
    }
  }
}
