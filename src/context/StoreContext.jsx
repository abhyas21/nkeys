import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { normalizeEmail, roleFromEmail, OWNER_EMAIL } from "../lib/auth";
import { fetchRemoteStoreSnapshot, saveRemoteProduct, upsertRemoteUser } from "../lib/remoteStore";
import { readStore, writeStore } from "../lib/storage";
import { getDataBackendLabel, isSupabaseConfigured, supabase } from "../lib/supabase";

const StoreContext = createContext(null);

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const VERIFIED_ORDER_STATUSES = new Set(["Paid", "Processing", "Shipped", "Delivered"]);
const upsertById = (records, nextRecord) => {
  const exists = records.some((record) => record.id === nextRecord.id);
  return exists
    ? records.map((record) => (record.id === nextRecord.id ? nextRecord : record))
    : [nextRecord, ...records];
};
const mergeProductsKeepingLocalOnly = (remoteProducts, currentProducts) => {
  const localOnlyProducts = Array.isArray(currentProducts)
    ? currentProducts.filter((product) => product?.syncState === "local-only")
    : [];

  if (!localOnlyProducts.length) {
    return remoteProducts;
  }

  return localOnlyProducts.reduce((mergedProducts, product) => upsertById(mergedProducts, product), [
    ...remoteProducts
  ]);
};

const slugify = (value) => String(value || "")
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

const normalizePhone = (value) => String(value || "").replace(/\D/g, "").slice(-10);
const normalizeStringList = (value) =>
  Array.isArray(value)
    ? value.map((entry) => String(entry || "").trim()).filter(Boolean)
    : [];

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);

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

export function StoreProvider({ children }) {
  const [store, setStore] = useState(readStore);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartFlyAnimation, setCartFlyAnimation] = useState(null);
  const [cartPulseKey, setCartPulseKey] = useState(0);
  const [isStoreLoading, setIsStoreLoading] = useState(isSupabaseConfigured);
  const [syncStatusMessage, setSyncStatusMessage] = useState("");
  const cartFxTimerRef = useRef(null);

  useEffect(() => {
    writeStore(store);
  }, [store]);

  useEffect(() => {
    return () => {
      if (cartFxTimerRef.current) {
        window.clearTimeout(cartFxTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsStoreLoading(false);
      return undefined;
    }

    let isCancelled = false;
    const categories = store.categories;

    const syncRemoteStore = async ({ showLoading = false } = {}) => {
      if (showLoading) {
        setIsStoreLoading(true);
      }

      try {
        const snapshot = await fetchRemoteStoreSnapshot(categories);
        if (isCancelled) {
          return;
        }

        setStore((current) => ({
          ...current,
          users: snapshot.users,
          products: mergeProductsKeepingLocalOnly(snapshot.products, current.products)
        }));
        setSyncStatusMessage("");
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.warn("NKeys could not sync the shared Supabase catalog.", error);
        setSyncStatusMessage(
          "Shared data could not be synced from Supabase. The app is using the latest local snapshot available in this browser."
        );
      } finally {
        if (!isCancelled) {
          setIsStoreLoading(false);
        }
      }
    };

    syncRemoteStore({ showLoading: true });

    const handleFocus = () => {
      syncRemoteStore();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncRemoteStore();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isCancelled = true;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const categoriesById = useMemo(
    () => Object.fromEntries(store.categories.map((category) => [category.id, category])),
    [store.categories]
  );

  const productsById = useMemo(
    () => Object.fromEntries(store.products.map((product) => [product.id, product])),
    [store.products]
  );

  const cartItems = useMemo(() => {
    return store.cart
      .map((line) => {
        const product = productsById[line.productId];
        if (!product) {
          return null;
        }

        return {
          ...line,
          product,
          lineTotal: product.price * line.quantity
        };
      })
      .filter(Boolean);
  }, [productsById, store.cart]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, line) => sum + line.quantity, 0),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () => cartItems.reduce((sum, line) => sum + line.lineTotal, 0),
    [cartItems]
  );

  const featuredProducts = useMemo(
    () => store.products.filter((product) => product.featured),
    [store.products]
  );

  const likedProducts = useMemo(
    () =>
      store.likedProductIds
        .map((productId) => productsById[productId])
        .filter(Boolean),
    [productsById, store.likedProductIds]
  );

  const publishedReviews = useMemo(
    () => store.reviews.filter((review) => review.status === "published"),
    [store.reviews]
  );

  const currentCustomer = useMemo(() => {
    if (!store.session?.isVerified) {
      return null;
    }

    const role = store.session.role || roleFromEmail(store.session.email);

    return {
      ...store.session,
      role,
      isOwner: role === "owner",
      firstName: store.session.name.split(/\s+/)[0] || store.session.name
    };
  }, [store.session]);

  const isOwner = currentCustomer?.isOwner || false;

  const getProductBySlug = (slug) =>
    store.products.find((product) => product.slug === slug) || null;

  const getProductById = (productId) =>
    store.products.find((product) => product.id === productId) || null;

  const getProductReviews = (productId) =>
    publishedReviews
      .filter((review) => review.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const triggerCartMotion = ({ product, imageSrc }) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      setCartPulseKey((current) => current + 1);
      return false;
    }

    const cartAnchor = document.querySelector("[data-cart-anchor='true']");
    if (!(cartAnchor instanceof HTMLElement)) {
      setCartPulseKey((current) => current + 1);
      return false;
    }

    const targetRect = cartAnchor.getBoundingClientRect();
    const startLeft = Math.max(20, Math.min(88, window.innerWidth * 0.08));
    const startTop = Math.max(96, window.innerHeight - 180);
    const deltaX = (targetRect.left + (targetRect.width / 2)) - (startLeft + 44);
    const deltaY = (targetRect.top + (targetRect.height / 2)) - (startTop + 44);

    if (cartFxTimerRef.current) {
      window.clearTimeout(cartFxTimerRef.current);
    }

    setCartFlyAnimation({
      id: createId("cart-fx"),
      imageSrc: imageSrc || product?.gallery?.[0] || "",
      productName: product?.name || "Product",
      startLeft,
      startTop,
      deltaX,
      deltaY
    });
    setCartPulseKey((current) => current + 1);
    cartFxTimerRef.current = window.setTimeout(() => {
      setCartFlyAnimation(null);
    }, 780);
    return true;
  };

  const addToCart = ({
    productId,
    quantity = 1,
    customizationFileName = "",
    animationOrigin = null,
    animationImageSrc = "",
    animateCart = true,
    openCart = true
  }) => {
    const product = store.products.find((item) => item.id === productId);
    const inventory = Number(product?.inventory) || 0;

    if (!product || inventory <= 0) {
      return;
    }

    setStore((current) => {
      const normalizedQuantity = Math.min(
        Math.max(1, Math.floor(Number(quantity) || 1)),
        inventory
      );
      const key = `${productId}::${customizationFileName || "standard"}`;
      const existingLine = current.cart.find((line) => line.key === key);

      if (existingLine) {
        return {
          ...current,
          cart: current.cart.map((line) =>
            line.key === key
              ? {
                ...line,
                quantity: Math.min(line.quantity + normalizedQuantity, inventory)
              }
              : line
          )
        };
      }

      return {
        ...current,
        cart: [
          ...current.cart,
          {
            id: createId("cart"),
            key,
            productId,
            quantity: normalizedQuantity,
            customizationFileName
          }
        ]
      };
    });

    const motionStarted = animateCart
      ? triggerCartMotion({
        product,
        imageSrc: animationImageSrc
      })
      : false;

    if (openCart) {
      const openPanel = () => startTransition(() => setCartOpen(true));
      if (motionStarted) {
        window.setTimeout(openPanel, 560);
      } else {
        openPanel();
      }
    }
  };

  const updateCartQuantity = (lineId, quantity) => {
    setStore((current) => ({
      ...current,
      cart: current.cart.map((line) => {
        if (line.id !== lineId) {
          return line;
        }

        const product = current.products.find((item) => item.id === line.productId);
        const inventory = Number(product?.inventory) || 0;
        const normalizedQuantity = inventory > 0
          ? Math.min(Math.max(1, Math.floor(Number(quantity) || 1)), inventory)
          : Math.max(1, Math.floor(Number(quantity) || 1));

        return { ...line, quantity: normalizedQuantity };
      })
    }));
  };

  const removeFromCart = (lineId) => {
    setStore((current) => ({
      ...current,
      cart: current.cart.filter((line) => line.id !== lineId)
    }));
  };

  const clearCart = () => {
    setStore((current) => ({
      ...current,
      cart: []
    }));
  };

  const isLikedProduct = (productId) => store.likedProductIds.includes(productId);

  const toggleLikedProduct = (productId) => {
    setStore((current) => ({
      ...current,
      likedProductIds: current.likedProductIds.includes(productId)
        ? current.likedProductIds.filter((entry) => entry !== productId)
        : [productId, ...current.likedProductIds]
    }));
  };

  const toggleHelpful = (reviewId) => {
    setStore((current) => {
      if (current.helpfulVotes.includes(reviewId)) {
        return current;
      }

      return {
        ...current,
        helpfulVotes: [...current.helpfulVotes, reviewId],
        reviews: current.reviews.map((review) =>
          review.id === reviewId
            ? { ...review, helpfulCount: (review.helpfulCount || 0) + 1 }
            : review
        )
      };
    });
  };

  const addReview = ({ productId, authorName, authorEmail, rating, title, comment, photos = [] }) => {
    setStore((current) => {
      const normalizedEmail = normalizeEmail(authorEmail);
      const matchedUser = current.users.find(
        (user) => normalizeEmail(user.email) === normalizedEmail
      );
      const matchedOrder = current.orders.find(
        (order) =>
          normalizeEmail(order.userEmail) === normalizedEmail &&
          VERIFIED_ORDER_STATUSES.has(order.status) &&
          order.items.some((item) => item.productId === productId)
      );

      return {
        ...current,
        reviews: [
          {
            id: createId("review"),
            productId,
            userId: matchedUser?.id || null,
            orderId: matchedOrder?.id || null,
            authorName,
            authorEmail,
            rating,
            title,
            comment,
            verifiedPurchase: Boolean(matchedOrder),
            status: "pending",
            helpfulCount: 0,
            createdAt: new Date().toISOString(),
            photos
          },
          ...current.reviews
        ]
      };
    });
  };

  const signInCustomer = async ({ name, gender, email, phone, verifiedBy }) => {
    const normalizedName = String(name || "").trim();
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);
    const verificationMethod = verifiedBy === "phone" ? "phone" : "email";

    if (!normalizedName || !normalizedEmail || !normalizedPhone) {
      return null;
    }

    const existingUser = store.users.find(
      (user) =>
        normalizeEmail(user.email) === normalizedEmail ||
        normalizePhone(user.phone) === normalizedPhone
    );
    let nextUser = {
      id: existingUser?.id || createId("user"),
      name: normalizedName,
      gender: String(gender || "").trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      role: roleFromEmail(normalizedEmail)
    };

    if (isSupabaseConfigured) {
      try {
        const remoteUser = await upsertRemoteUser(nextUser);
        if (remoteUser) {
          nextUser = remoteUser;
        }
        setSyncStatusMessage("");
      } catch (error) {
        console.warn("Customer login was saved locally but could not sync to Supabase.", error);
        setSyncStatusMessage(
          "The login was saved in this browser, but Supabase could not be updated right now."
        );
      }
    }

    const nextSession = {
      userId: nextUser.id,
      name: nextUser.name,
      gender: nextUser.gender,
      email: nextUser.email,
      phone: nextUser.phone,
      role: nextUser.role,
      verifiedBy: verificationMethod,
      verifiedAt: new Date().toISOString(),
      isVerified: true
    };

    setStore((current) => {
      return {
        ...current,
        users: upsertById(current.users, nextUser),
        session: nextSession
      };
    });

    return nextSession;
  };

  const signOutCustomer = () => {
    setCartOpen(false);
    setCartFlyAnimation(null);
    setStore((current) => ({
      ...current,
      session: null
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch((error) => {
        console.warn("Supabase auth session could not be cleared during logout.", error);
      });
    }
  };

  const submitOrder = ({
    shipping,
    payment,
    shippingAmount = 0,
    discountAmount = 0,
    couponCode = "",
    totalAmount
  }) => {
    const matchedUser = store.users.find(
      (user) => normalizeEmail(user.email) === normalizeEmail(shipping.email)
    );
    const isCashOnDelivery =
      payment.method === "cod" || payment.method === "Cash on Delivery";
    const normalizedShippingAmount = Math.max(0, Number(shippingAmount) || 0);
    const normalizedDiscountAmount = Math.max(0, Number(discountAmount) || 0);
    const computedTotal = Math.max(0, cartSubtotal + normalizedShippingAmount - normalizedDiscountAmount);
    const order = {
      id: createId("order"),
      number: `NK-${String(store.orders.length + 1025).padStart(5, "0")}`,
      createdAt: new Date().toISOString(),
      status: isCashOnDelivery ? "Pending confirmation" : "Paid",
      userId: matchedUser?.id || null,
      userEmail: shipping.email,
      shipping,
      payment,
      items: cartItems.map((line) => ({
        lineId: line.id,
        productId: line.product.id,
        name: line.product.name,
        price: line.product.price,
        quantity: line.quantity,
        customizationFileName: line.customizationFileName,
        total: line.lineTotal
      })),
      subtotal: cartSubtotal,
      shippingAmount: normalizedShippingAmount,
      discountAmount: normalizedDiscountAmount,
      couponCode: String(couponCode || "").trim(),
      total: Number.isFinite(Number(totalAmount)) ? Math.max(0, Number(totalAmount)) : computedTotal
    };

    setStore((current) => ({
      ...current,
      orders: [order, ...current.orders],
      cart: []
    }));
    setCartOpen(false);
    return order;
  };

  const saveProduct = async (payload) => {
    if (!isOwner) {
      return {
        ok: false,
        storage: "blocked",
        warning: "Only the owner account can save products."
      };
    }

    const productId = payload.id || createId("product");
    const existingProduct = store.products.find((product) => product.id === productId);
    const baseGallery = Array.isArray(payload.gallery) && payload.gallery.length
      ? payload.gallery
      : Array.isArray(existingProduct?.gallery) && existingProduct.gallery.length
        ? existingProduct.gallery
        : createFallbackGallery(
          payload.name,
          payload.shortDescription,
          payload.type === "sticker" ? "#cc6a3d" : "#3f6755"
        );
    const nextProduct = {
      id: productId,
      slug: payload.slug || slugify(payload.name),
      name: payload.name,
      type: payload.type,
      categoryId: payload.categoryId,
      price: Number(payload.price) || 0,
      compareAtPrice: Number(payload.compareAtPrice) || 0,
      shortDescription: payload.shortDescription,
      description: payload.description,
      materials: normalizeStringList(payload.materials),
      turnaroundDays: payload.turnaroundDays,
      uploadEnabled: Boolean(payload.uploadEnabled),
      featured: Boolean(payload.featured),
      inventory: Number(payload.inventory) || 0,
      syncState: payload.syncState === "local-only" ? "local-only" : "synced",
      gallery: baseGallery,
      specs: normalizeStringList(payload.specs)
    };

    const saveLocally = (warningMessage = "") => {
      const localProduct = {
        ...nextProduct,
        syncState: "local-only"
      };
      setStore((current) => ({
        ...current,
        products: upsertById(current.products, localProduct)
      }));
      setSyncStatusMessage(warningMessage);
      return {
        ok: true,
        storage: "local",
        warning: warningMessage
      };
    };

    if (isSupabaseConfigured) {
      try {
        const savedProduct = await saveRemoteProduct(nextProduct, store.categories);
        setStore((current) => ({
          ...current,
          products: upsertById(current.products, savedProduct)
        }));
        setSyncStatusMessage("");
        return {
          ok: true,
          storage: "supabase",
          warning: ""
        };
      } catch (error) {
        console.warn("Product could not be synced to Supabase.", error);
        return saveLocally(
          "Supabase product sync failed, so this product was saved only in this browser. Check your database tables, storage bucket, and policies."
        );
      }
    }

    return saveLocally("");
  };

  const moderateReview = (reviewId, status) => {
    if (!isOwner) {
      return false;
    }

    setStore((current) => ({
      ...current,
      reviews: current.reviews.map((review) =>
        review.id === reviewId ? { ...review, status } : review
      )
    }));

    return true;
  };

  const value = {
    categories: store.categories,
    categoriesById,
    users: store.users,
    products: store.products,
    productsById,
    featuredProducts,
    reviews: store.reviews,
    publishedReviews,
    orders: store.orders,
    likedProductIds: store.likedProductIds,
    likedProducts,
    cartItems,
    cartCount,
    cartSubtotal,
    cartOpen,
    setCartOpen,
    cartFlyAnimation,
    cartPulseKey,
    isStoreLoading,
    backendLabel: getDataBackendLabel(),
    sharedCatalogEnabled: isSupabaseConfigured,
    syncStatusMessage,
    currentCustomer,
    isOwner,
    ownerEmail: OWNER_EMAIL,
    formatMoney,
    getProductBySlug,
    getProductById,
    getProductReviews,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    isLikedProduct,
    toggleLikedProduct,
    toggleHelpful,
    addReview,
    signInCustomer,
    signOutCustomer,
    submitOrder,
    saveProduct,
    moderateReview,
    helpfulVotes: store.helpfulVotes
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used inside StoreProvider");
  }
  return context;
}
