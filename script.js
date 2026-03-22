let nextProductId = 1;

const SESSION_KEY = "nkeys_user_session";
const LOGIN_HISTORY_KEY = "nkeys_login_history";
const ORDER_HISTORY_KEY = "nkeys_order_history";
const SHEET_FALLBACK_KEY = "nkeys_sheet_fallback";
const SALES_KEY = "nkeys_sales_by_product";
const PRODUCTS_KEY = "nkeys_products";
const CATEGORIES_KEY = "nkeys_categories";
const CART_KEY = "nkeys_cart_items";
const LIKES_KEY = "nkeys_liked_product_ids";
const OWNER_EMAIL = "abhyas2006@gmail.com";
const SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzZvEO19bp-EnMHQoXwpb3TksTnrLaei8_YQ8F3rH8aaYSs9RCQw17_LbSfPhiKvygl/exec";
const DEFAULT_CATEGORIES = ["Metal Tags", "Acrylic Charms", "Leather Loops"];
const LEGACY_DEFAULT_CATEGORIES = ["Metal", "Glass", "Rubber"];
const HERO_INITIAL_SLIDES = [
  {
    label: "Initial Drop",
    title: "Metal Tag Classic",
    img: "hero-slide-metal-tag.svg",
    alt: "Metal keychain tag with engraved initials"
  },
  {
    label: "Initial Drop",
    title: "Acrylic Charm Pop",
    img: "hero-slide-acrylic-charm.svg",
    alt: "Acrylic keychain charm with bright color layers"
  },
  {
    label: "Initial Drop",
    title: "Leather Loop Daily",
    img: "hero-slide-leather-loop.svg",
    alt: "Leather loop keychain with brass hardware"
  },
  {
    label: "Initial Drop",
    title: "Couple Tag Set",
    img: "hero-slide-couple-tag.svg",
    alt: "Matching engraved couple keychain tags"
  }
];

const products = readProducts();
const likedProductIds = readLikes();

const grid = document.getElementById("productGrid");
const template = document.getElementById("productTemplate");
const likesBtn = document.getElementById("likesBtn");
const likesCount = document.getElementById("likesCount");
const cartBtn = document.getElementById("cartBtn");
const cartCount = document.getElementById("cartCount");
const cartDrawer = document.getElementById("cartDrawer");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartBackdrop = document.getElementById("cartBackdrop");
const cartList = document.getElementById("cartList");
const cartEmpty = document.getElementById("cartEmpty");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const topSellsGrid = document.getElementById("topSellsGrid");
const categoryRow = document.getElementById("categoryRow");
const productsSection = document.getElementById("products");
const productsEmpty = document.getElementById("productsEmpty");
const heroSlider = document.getElementById("heroSlider");
const heroSliderTrack = document.getElementById("heroSliderTrack");
const heroSliderDots = document.getElementById("heroSliderDots");
const heroSlideLabel = document.getElementById("heroSlideLabel");
const heroSlideTitle = document.getElementById("heroSlideTitle");
const ownerSection = document.getElementById("owner");
const ownerForm = document.getElementById("ownerForm");
const ownerMessage = document.getElementById("ownerMessage");
const ownerLockMessage = document.getElementById("ownerLockMessage");
const productCategory = document.getElementById("productCategory");
const newCategoryInput = document.getElementById("newCategory");
const productImageFile = document.getElementById("productImageFile");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const sessionUser = document.getElementById("sessionUser");
const loginModal = document.getElementById("loginModal");
const closeLoginModal = document.getElementById("closeLoginModal");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const loginName = document.getElementById("loginName");
const loginEmail = document.getElementById("loginEmail");
const loginPhone = document.getElementById("loginPhone");
const loginCode = document.getElementById("loginCode");
const verifyEmailBtn = document.getElementById("verifyEmailBtn");
const verifyPhoneBtn = document.getElementById("verifyPhoneBtn");
const confirmCodeBtn = document.getElementById("confirmCodeBtn");
const showLoginDetailsBtn = document.getElementById("showLoginDetailsBtn");
const showOrderDetailsBtn = document.getElementById("showOrderDetailsBtn");
const ownerLoginPanel = document.getElementById("ownerLoginPanel");
const ownerOrderPanel = document.getElementById("ownerOrderPanel");
const loginHistoryBody = document.getElementById("loginHistoryBody");
const loginHistoryEmpty = document.getElementById("loginHistoryEmpty");
const orderHistoryBody = document.getElementById("orderHistoryBody");
const orderHistoryEmpty = document.getElementById("orderHistoryEmpty");
const checkoutModal = document.getElementById("checkoutModal");
const closeCheckoutModal = document.getElementById("closeCheckoutModal");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutMessage = document.getElementById("checkoutMessage");
const productDetailView = document.getElementById("productDetailView");
const closeProductDetailModal = document.getElementById("closeProductDetailModal");
const productDetailBreadcrumb = document.getElementById("productDetailBreadcrumb");
const productDetailImage = document.getElementById("productDetailImage");
const productDetailCategory = document.getElementById("productDetailCategory");
const productDetailTitle = document.getElementById("productDetailTitle");
const productDetailPrice = document.getElementById("productDetailPrice");
const productDetailDescription = document.getElementById("productDetailDescription");
const productDetailHighlights = document.getElementById("productDetailHighlights");
const productDetailRecommendations = document.getElementById("productDetailRecommendations");
const productDetailRelatedGrid = document.getElementById("productDetailRelatedGrid");
const productDetailBuyPrice = document.getElementById("productDetailBuyPrice");
const productDetailMetaCategory = document.getElementById("productDetailMetaCategory");
const productDetailQty = document.getElementById("productDetailQty");
const productDetailAddBtn = document.getElementById("productDetailAddBtn");
const productDetailBuyBtn = document.getElementById("productDetailBuyBtn");
const checkoutFirstName = document.getElementById("checkoutFirstName");
const checkoutLastName = document.getElementById("checkoutLastName");
const checkoutPhone = document.getElementById("checkoutPhone");
const sendPhoneOtpBtn = document.getElementById("sendPhoneOtpBtn");
const checkoutPhoneOtp = document.getElementById("checkoutPhoneOtp");
const verifyPhoneOtpBtn = document.getElementById("verifyPhoneOtpBtn");
const phoneOtpMessage = document.getElementById("phoneOtpMessage");
const checkoutEmail = document.getElementById("checkoutEmail");
const sendEmailOtpBtn = document.getElementById("sendEmailOtpBtn");
const checkoutEmailOtp = document.getElementById("checkoutEmailOtp");
const verifyEmailOtpBtn = document.getElementById("verifyEmailOtpBtn");
const emailOtpMessage = document.getElementById("emailOtpMessage");
const checkoutCountry = document.getElementById("checkoutCountry");
const checkoutState = document.getElementById("checkoutState");
const checkoutDistrict = document.getElementById("checkoutDistrict");
const checkoutPostalCode = document.getElementById("checkoutPostalCode");
const checkoutAddressLine1 = document.getElementById("checkoutAddressLine1");
const checkoutAddressLine2 = document.getElementById("checkoutAddressLine2");
const checkoutLandmark = document.getElementById("checkoutLandmark");
const checkoutPaymentMethod = document.getElementById("checkoutPaymentMethod");
const paymentCardFields = document.getElementById("paymentCardFields");
const paymentUpiFields = document.getElementById("paymentUpiFields");
const checkoutCardHolder = document.getElementById("checkoutCardHolder");
const checkoutCardNumber = document.getElementById("checkoutCardNumber");
const checkoutCardExpiry = document.getElementById("checkoutCardExpiry");
const checkoutCardCvv = document.getElementById("checkoutCardCvv");
const checkoutUpiId = document.getElementById("checkoutUpiId");

const cartItems = readCart();
const salesByProduct = readSales();
const loginHistory = readLoginHistory();
const orderHistory = readOrderHistory();
const categories = readCategories();
nextProductId = products.reduce((maxId, item) => Math.max(maxId, Number(item.id) || 0), 0) + 1;

for (const item of products) {
  if (item.category) {
    addCategory(item.category);
  }
}

let session = readSession();
let pendingVerificationCode = "";
let pendingVerificationMethod = "";
let verifiedMethod = "";
let verifiedContact = "";
let checkoutPhoneOtpCode = "";
let checkoutEmailOtpCode = "";
let checkoutVerifiedPhone = "";
let checkoutVerifiedEmail = "";
let checkoutPendingPhone = "";
let checkoutPendingEmail = "";
let checkoutCountryCode = "";
let heroSlides = [];
let heroSlideIndex = 0;
let heroSliderTimer = 0;
let activeProductDetailId = 0;
let productDetailReturnY = 0;

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.16 });

const FALLBACK_INDIAN_ADDRESS_DATA = {
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
  Karnataka: ["Bengaluru Urban", "Mysuru", "Mangaluru", "Belagavi", "Hubballi"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli"],
  Delhi: ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "South Delhi"],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "North 24 Parganas", "South 24 Parganas"]
};

const INDIA_ADDRESS_DATA =
  typeof INDIA_STATES_AND_DISTRICTS === "object" && INDIA_STATES_AND_DISTRICTS
    ? INDIA_STATES_AND_DISTRICTS
    : FALLBACK_INDIAN_ADDRESS_DATA;

const CHECKOUT_ADDRESS_DATA = {
  IN: {
    name: "India",
    dialCodes: ["91"],
    states: INDIA_ADDRESS_DATA
  },
  US: {
    name: "United States",
    dialCodes: ["1"],
    states: {
      California: ["Los Angeles County", "San Diego County", "Orange County", "Santa Clara County", "Alameda County"],
      Texas: ["Harris County", "Dallas County", "Tarrant County", "Bexar County", "Travis County"],
      "New York": ["New York County", "Kings County", "Queens County", "Bronx County", "Erie County"],
      Florida: ["Miami-Dade County", "Broward County", "Palm Beach County", "Orange County", "Hillsborough County"],
      Illinois: ["Cook County", "DuPage County", "Lake County", "Will County", "Kane County"]
    }
  },
  GB: {
    name: "United Kingdom",
    dialCodes: ["44"],
    states: {
      England: ["Greater London", "Greater Manchester", "West Midlands", "Merseyside", "West Yorkshire"],
      Scotland: ["Aberdeenshire", "Angus", "Fife", "Highland", "South Lanarkshire"],
      Wales: ["Cardiff", "Swansea", "Newport", "Wrexham", "Carmarthenshire"],
      "Northern Ireland": [
        "Antrim and Newtownabbey",
        "Armagh City Banbridge and Craigavon",
        "Belfast",
        "Derry City and Strabane",
        "Lisburn and Castlereagh"
      ]
    }
  }
};

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readLoginHistory() {
  try {
    const raw = localStorage.getItem(LOGIN_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) {
      return [];
    }

    const cleaned = [];
    for (const entry of parsed) {
      if (!entry || typeof entry !== "object") {
        continue;
      }

      const id = String(entry.id || "").trim();
      const name = String(entry.name || "").trim();
      const email = normalizeEmail(entry.email);
      const phone = String(entry.phone || "").trim();
      const role = entry.role === "owner" ? "owner" : "customer";
      const verifiedBy = entry.verifiedBy === "phone" ? "phone" : "email";
      const loginAt = String(entry.loginAt || "").trim();
      const syncStatus = entry.syncStatus === "synced" ? "synced" : "queued";

      if (!id || !name || !email || !phone || !loginAt) {
        continue;
      }

      cleaned.push({
        id,
        name,
        email,
        phone,
        role,
        verifiedBy,
        loginAt,
        syncStatus
      });
    }

    cleaned.sort((left, right) => new Date(right.loginAt).getTime() - new Date(left.loginAt).getTime());
    return cleaned;
  } catch {
    return [];
  }
}

function readOrderHistory() {
  try {
    const raw = localStorage.getItem(ORDER_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) {
      return [];
    }

    const cleaned = [];
    for (const entry of parsed) {
      if (!entry || typeof entry !== "object") {
        continue;
      }

      const id = String(entry.id || "").trim();
      const customerName = String(entry.customerName || "").trim();
      const email = normalizeEmail(entry.email);
      const phone = String(entry.phone || "").trim();
      const itemsSummary = String(entry.itemsSummary || "").trim();
      const addressSummary = String(entry.addressSummary || "").trim();
      const paymentSummary = String(entry.paymentSummary || "").trim();
      const rawTotal = String(entry.total || "").trim();
      const createdAt = String(entry.createdAt || "").trim();

      if (!id || !customerName || !email || !phone || !itemsSummary || !addressSummary || !paymentSummary || !rawTotal || !createdAt) {
        continue;
      }

      cleaned.push({
        id,
        customerName,
        email,
        phone,
        itemsSummary,
        addressSummary,
        paymentSummary,
        total: formatPrice(parsePrice(rawTotal)),
        createdAt
      });
    }

    cleaned.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
    return cleaned;
  } catch {
    return [];
  }
}

function readSales() {
  try {
    const raw = localStorage.getItem(SALES_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    const cleaned = {};
    for (const [productId, count] of Object.entries(parsed)) {
      const numericCount = Number(count);
      if (Number.isFinite(numericCount) && numericCount > 0) {
        cleaned[productId] = numericCount;
      }
    }
    return cleaned;
  } catch {
    return {};
  }
}

function readProducts() {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) {
      return [];
    }

    const cleaned = [];
    for (const entry of parsed) {
      if (!entry || typeof entry !== "object") {
        continue;
      }

      const id = Number(entry.id);
      const name = String(entry.name || "").trim();
      const details = String(entry.details || "").trim();
      const img = String(entry.img || "").trim();
      const rawPrice = String(entry.price || "").trim();
      const category = normalizeCategoryName(entry.category || "");

      if (!Number.isFinite(id) || !name || !details || !img || !rawPrice) {
        continue;
      }

      cleaned.push({
        id,
        name,
        details,
        img,
        price: formatPrice(parsePrice(rawPrice)),
        category
      });
    }
    return cleaned;
  } catch {
    return [];
  }
}

function saveProducts() {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function normalizeCategoryName(value) {
  const trimmed = String(value || "").trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return "";
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function readCategories() {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    const parsed = raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
    if (!Array.isArray(parsed)) {
      return [...DEFAULT_CATEGORIES];
    }

    const unique = [];
    for (const entry of parsed) {
      const normalized = normalizeCategoryName(entry);
      if (!normalized) {
        continue;
      }
      if (!unique.some((name) => name.toLowerCase() === normalized.toLowerCase())) {
        unique.push(normalized);
      }
    }
    if (!unique.length) {
      return [...DEFAULT_CATEGORIES];
    }

    const isLegacyDefaultSet =
      unique.length === LEGACY_DEFAULT_CATEGORIES.length &&
      unique.every((name, index) => name.toLowerCase() === LEGACY_DEFAULT_CATEGORIES[index].toLowerCase());

    return isLegacyDefaultSet ? [...DEFAULT_CATEGORIES] : unique;
  } catch {
    return [...DEFAULT_CATEGORIES];
  }
}

function saveCategories() {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

function addCategory(name) {
  const normalized = normalizeCategoryName(name);
  if (!normalized) {
    return "";
  }

  const exists = categories.some((entry) => entry.toLowerCase() === normalized.toLowerCase());
  if (!exists) {
    categories.push(normalized);
    saveCategories();
    renderCategories();
    renderOwnerCategoryOptions(normalized);
  }
  return normalized;
}

function saveSales() {
  localStorage.setItem(SALES_KEY, JSON.stringify(salesByProduct));
}

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) {
      return new Map();
    }

    const hydrated = new Map();
    for (const entry of parsed) {
      if (!entry || typeof entry !== "object") {
        continue;
      }

      const id = Number(entry.id);
      const qty = Math.floor(Number(entry.qty));
      if (!Number.isFinite(id) || !Number.isFinite(qty) || qty <= 0) {
        continue;
      }

      const product = products.find((item) => Number(item.id) === id);
      if (!product) {
        continue;
      }

      hydrated.set(product.id, { product, qty });
    }
    return hydrated;
  } catch {
    return new Map();
  }
}

function saveCart() {
  const serialized = [];
  for (const entry of cartItems.values()) {
    if (!entry || !entry.product) {
      continue;
    }
    serialized.push({
      id: entry.product.id,
      qty: entry.qty
    });
  }
  localStorage.setItem(CART_KEY, JSON.stringify(serialized));
}

function readLikes() {
  try {
    const raw = localStorage.getItem(LIKES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) {
      return new Set();
    }

    const availableIds = new Set(products.map((item) => Number(item.id)));
    const likedIds = new Set();
    for (const entry of parsed) {
      const productId = Number(entry);
      if (availableIds.has(productId)) {
        likedIds.add(productId);
      }
    }
    return likedIds;
  } catch {
    return new Set();
  }
}

function saveLikes() {
  localStorage.setItem(LIKES_KEY, JSON.stringify(Array.from(likedProductIds)));
}

function isLoggedIn() {
  return Boolean(session && session.email);
}

function isOwner() {
  return isLoggedIn() && session.role === "owner";
}

function saveSession(nextSession) {
  session = nextSession;
  if (nextSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
  applyAuthUI();
}

function saveLoginHistory() {
  localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify(loginHistory));
}

function saveOrderHistory() {
  localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(orderHistory));
}

function createLoginHistoryEntry(payload) {
  return {
    id: `login-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    role: payload.role,
    verifiedBy: payload.verifiedBy,
    loginAt: payload.loginAt,
    syncStatus: "queued"
  };
}

function createOrderHistoryEntry(payload) {
  return {
    id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    customerName: payload.customerName,
    email: payload.email,
    phone: payload.phone,
    itemsSummary: payload.itemsSummary,
    addressSummary: payload.addressSummary,
    paymentSummary: payload.paymentSummary,
    total: payload.total,
    createdAt: payload.createdAt
  };
}

function formatLoginDateTime(value) {
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(timestamp);
}

function summarizeOrderItems(items) {
  if (!Array.isArray(items) || !items.length) {
    return "";
  }

  return items
    .map((item) => {
      const name = String(item.name || "").trim();
      const qty = Number(item.qty) || 0;
      return name && qty > 0 ? `${name} x${qty}` : "";
    })
    .filter(Boolean)
    .join(", ");
}

function summarizeOrderAddress(payload) {
  return [
    payload.addressLine1,
    payload.addressLine2,
    payload.landmark,
    payload.district,
    payload.state,
    payload.postalCode,
    payload.country
  ]
    .map((entry) => String(entry || "").trim())
    .filter(Boolean)
    .join(", ");
}

function maskUpiId(value) {
  const normalized = normalizeUpiId(value);
  const [name = "", domain = ""] = normalized.split("@");
  if (!name || !domain) {
    return normalized;
  }

  const visibleChars = Math.min(2, name.length);
  return `${name.slice(0, visibleChars)}${"*".repeat(Math.max(0, name.length - visibleChars))}@${domain}`;
}

function setOwnerDetailsView(view) {
  const showLogin = view !== "order";

  if (ownerLoginPanel) {
    ownerLoginPanel.hidden = !showLogin;
  }
  if (ownerOrderPanel) {
    ownerOrderPanel.hidden = showLogin;
  }
  if (showLoginDetailsBtn) {
    showLoginDetailsBtn.classList.toggle("active", showLogin);
    showLoginDetailsBtn.setAttribute("aria-pressed", String(showLogin));
  }
  if (showOrderDetailsBtn) {
    showOrderDetailsBtn.classList.toggle("active", !showLogin);
    showOrderDetailsBtn.setAttribute("aria-pressed", String(!showLogin));
  }
}

function renderLoginHistory() {
  if (!loginHistoryBody || !loginHistoryEmpty) {
    return;
  }

  loginHistoryBody.textContent = "";

  if (!loginHistory.length) {
    loginHistoryEmpty.hidden = false;
    return;
  }

  loginHistoryEmpty.hidden = true;

  for (const entry of loginHistory) {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = entry.name;

    const emailCell = document.createElement("td");
    emailCell.textContent = entry.email;

    const phoneCell = document.createElement("td");
    phoneCell.textContent = entry.phone;

    const roleCell = document.createElement("td");
    roleCell.textContent = entry.role;

    const verifiedCell = document.createElement("td");
    verifiedCell.textContent = entry.verifiedBy;

    const timeCell = document.createElement("td");
    timeCell.textContent = formatLoginDateTime(entry.loginAt);

    const syncCell = document.createElement("td");
    const syncBadge = document.createElement("span");
    syncBadge.className = `sync-badge ${entry.syncStatus}`;
    syncBadge.textContent = entry.syncStatus === "synced" ? "Synced" : "Queued";
    syncCell.appendChild(syncBadge);

    row.append(nameCell, emailCell, phoneCell, roleCell, verifiedCell, timeCell, syncCell);
    loginHistoryBody.appendChild(row);
  }
}

function renderOrderHistory() {
  if (!orderHistoryBody || !orderHistoryEmpty) {
    return;
  }

  orderHistoryBody.textContent = "";

  if (!orderHistory.length) {
    orderHistoryEmpty.hidden = false;
    return;
  }

  orderHistoryEmpty.hidden = true;

  for (const entry of orderHistory) {
    const row = document.createElement("tr");

    const orderIdCell = document.createElement("td");
    orderIdCell.textContent = entry.id;

    const customerCell = document.createElement("td");
    customerCell.textContent = entry.customerName;

    const contactCell = document.createElement("td");
    contactCell.textContent = `${entry.email} / ${entry.phone}`;

    const itemsCell = document.createElement("td");
    itemsCell.textContent = entry.itemsSummary;

    const addressCell = document.createElement("td");
    addressCell.textContent = entry.addressSummary;

    const paymentCell = document.createElement("td");
    paymentCell.textContent = entry.paymentSummary;

    const totalCell = document.createElement("td");
    totalCell.textContent = entry.total;

    const orderedAtCell = document.createElement("td");
    orderedAtCell.textContent = formatLoginDateTime(entry.createdAt);

    row.append(orderIdCell, customerCell, contactCell, itemsCell, addressCell, paymentCell, totalCell, orderedAtCell);
    orderHistoryBody.appendChild(row);
  }
}

function appendLoginHistory(entry) {
  loginHistory.unshift(entry);
  saveLoginHistory();
  renderLoginHistory();
}

function appendOrderHistory(entry) {
  orderHistory.unshift(entry);
  saveOrderHistory();
  renderOrderHistory();
}

function updateLoginHistorySyncStatus(entryId, syncStatus) {
  const entry = loginHistory.find((item) => item.id === entryId);
  if (!entry || entry.syncStatus === syncStatus) {
    return;
  }

  entry.syncStatus = syncStatus;
  saveLoginHistory();
  renderLoginHistory();
}

function queueSheetFallback(entry) {
  try {
    const list = JSON.parse(localStorage.getItem(SHEET_FALLBACK_KEY) || "[]");
    list.push(entry);
    localStorage.setItem(SHEET_FALLBACK_KEY, JSON.stringify(list));
  } catch {
    localStorage.setItem(SHEET_FALLBACK_KEY, JSON.stringify([entry]));
  }
}

async function sendLoginToSheet(payload) {
  if (!SHEET_WEBHOOK_URL) {
    queueSheetFallback(payload);
    return false;
  }

  try {
    const response = await fetch(SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`Sheet sync failed with status ${response.status}`);
    }
    return true;
  } catch {
    queueSheetFallback(payload);
    return false;
  }
}

function openLogin() {
  loginMessage.textContent = "";
  pendingVerificationCode = "";
  pendingVerificationMethod = "";
  verifiedMethod = "";
  verifiedContact = "";
  loginCode.value = "";
  loginModal.classList.add("open");
  loginModal.setAttribute("aria-hidden", "false");
}

function closeLogin() {
  loginModal.classList.remove("open");
  loginModal.setAttribute("aria-hidden", "true");
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function detectCountryByPhone(phoneValue) {
  const digits = normalizePhone(phoneValue);
  if (!digits) {
    return "";
  }

  const dialPrefixes = Object.entries(CHECKOUT_ADDRESS_DATA)
    .flatMap(([countryCode, country]) => country.dialCodes.map((dialCode) => ({ countryCode, dialCode })))
    .sort((a, b) => b.dialCode.length - a.dialCode.length);

  for (const { countryCode, dialCode } of dialPrefixes) {
    if (digits.startsWith(dialCode)) {
      return countryCode;
    }
  }

  if (digits.length === 10) {
    return "IN";
  }

  return "";
}

function setSelectPlaceholder(selectEl, placeholder) {
  if (!selectEl) {
    return;
  }

  selectEl.innerHTML = "";
  const option = document.createElement("option");
  option.value = "";
  option.textContent = placeholder;
  option.disabled = true;
  option.selected = true;
  selectEl.appendChild(option);
}

function populateCheckoutDistricts(countryCode, stateName, preferredDistrict = "") {
  setSelectPlaceholder(checkoutDistrict, "Select district");

  if (!countryCode || !stateName || !CHECKOUT_ADDRESS_DATA[countryCode]) {
    checkoutDistrict.disabled = true;
    return;
  }

  const districts = CHECKOUT_ADDRESS_DATA[countryCode].states[stateName] || [];
  for (const district of districts) {
    const option = document.createElement("option");
    option.value = district;
    option.textContent = district;
    checkoutDistrict.appendChild(option);
  }

  checkoutDistrict.disabled = !districts.length;
  if (!districts.length) {
    return;
  }

  if (preferredDistrict && districts.includes(preferredDistrict)) {
    checkoutDistrict.value = preferredDistrict;
  }
}

function populateCheckoutStates(countryCode, preferredState = "", preferredDistrict = "") {
  setSelectPlaceholder(checkoutState, "Select state");
  setSelectPlaceholder(checkoutDistrict, "Select district");
  checkoutDistrict.disabled = true;

  if (!countryCode || !CHECKOUT_ADDRESS_DATA[countryCode]) {
    checkoutState.disabled = true;
    return;
  }

  const states = Object.keys(CHECKOUT_ADDRESS_DATA[countryCode].states).sort((a, b) => a.localeCompare(b));
  for (const stateName of states) {
    const option = document.createElement("option");
    option.value = stateName;
    option.textContent = stateName;
    checkoutState.appendChild(option);
  }

  checkoutState.disabled = !states.length;
  if (!states.length) {
    return;
  }

  if (preferredState && states.includes(preferredState)) {
    checkoutState.value = preferredState;
    populateCheckoutDistricts(countryCode, checkoutState.value, preferredDistrict);
  }
}

function syncCheckoutCountryFromPhone() {
  const nextCountryCode = detectCountryByPhone(checkoutPhone.value);
  const previousCountryCode = checkoutCountryCode;
  checkoutCountryCode = nextCountryCode;

  checkoutCountry.value = nextCountryCode ? CHECKOUT_ADDRESS_DATA[nextCountryCode].name : "Unknown";

  if (nextCountryCode !== previousCountryCode) {
    populateCheckoutStates(nextCountryCode);
    return;
  }

  if (!nextCountryCode) {
    populateCheckoutStates("");
  }
}

function resetCheckoutPhoneVerification(message = "") {
  checkoutPhoneOtpCode = "";
  checkoutVerifiedPhone = "";
  checkoutPendingPhone = "";
  checkoutPhoneOtp.value = "";
  phoneOtpMessage.textContent = message;
}

function resetCheckoutEmailVerification(message = "") {
  checkoutEmailOtpCode = "";
  checkoutVerifiedEmail = "";
  checkoutPendingEmail = "";
  checkoutEmailOtp.value = "";
  emailOtpMessage.textContent = message;
}

function scrollPageToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function openCheckout({ forceTop = false } = {}) {
  if (forceTop) {
    scrollPageToTop();
  }

  checkoutForm.reset();
  checkoutForm.scrollTop = 0;
  checkoutModal.scrollTop = 0;
  checkoutMessage.textContent = "";

  resetCheckoutPhoneVerification("");
  resetCheckoutEmailVerification("");

  if (session && session.name) {
    const [first, ...rest] = session.name.trim().split(/\s+/);
    checkoutFirstName.value = first || "";
    checkoutLastName.value = rest.join(" ");
  }

  if (session && session.phone) {
    checkoutPhone.value = session.phone;
  }

  if (session && session.email) {
    checkoutEmail.value = session.email;
  }

  if (checkoutPaymentMethod) {
    checkoutPaymentMethod.value = "";
  }
  syncPaymentMethodUI();

  checkoutCountryCode = "";
  syncCheckoutCountryFromPhone();
  checkoutModal.classList.add("open");
  checkoutModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("checkout-open");
  requestAnimationFrame(() => {
    checkoutForm.scrollTop = 0;
    checkoutModal.scrollTop = 0;
  });
}

function closeCheckout() {
  checkoutModal.classList.remove("open");
  checkoutModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("checkout-open");
}

function findProductById(productId) {
  return products.find((item) => Number(item.id) === Number(productId)) || null;
}

function buildProductDetailHighlights(product) {
  const rawDetails = String(product?.details || "").trim();
  const highlights = [];

  const normalizedParts = rawDetails
    .split(/\s*[.;,]\s*/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (product?.category) {
    highlights.push(`${product.category} finish for everyday carry.`);
  }

  for (const entry of normalizedParts) {
    const cleaned = entry.replace(/\s+/g, " ");
    if (!cleaned) {
      continue;
    }
    const sentence = /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
    if (!highlights.some((item) => item.toLowerCase() === sentence.toLowerCase())) {
      highlights.push(sentence.charAt(0).toUpperCase() + sentence.slice(1));
    }
    if (highlights.length >= 4) {
      break;
    }
  }

  const fallbackHighlights = [
    "Built for bike keys, bags, office tags, and daily carry.",
    "Works well for gifts, personal initials, and small custom drops.",
    "Buy Now adds the selected quantity and takes the order to checkout."
  ];

  for (const fallback of fallbackHighlights) {
    if (highlights.length >= 4) {
      break;
    }
    if (!highlights.some((item) => item.toLowerCase() === fallback.toLowerCase())) {
      highlights.push(fallback);
    }
  }

  return highlights.slice(0, 4);
}

function setProductDetailQuantity(quantity) {
  if (!productDetailQty) {
    return 1;
  }

  const normalizedQuantity = Math.min(5, Math.max(1, Math.floor(Number(quantity) || 1)));
  productDetailQty.value = String(normalizedQuantity);
  return normalizedQuantity;
}

function buildProductDetailRecommendations(product) {
  const activeId = Number(product?.id);
  const sameCategory = products.filter((item) => (
    Number(item.id) !== activeId &&
    product?.category &&
    item.category &&
    item.category.toLowerCase() === product.category.toLowerCase()
  ));

  const otherProducts = products.filter((item) => (
    Number(item.id) !== activeId &&
    !sameCategory.some((entry) => Number(entry.id) === Number(item.id))
  ));

  return [...sameCategory, ...otherProducts].slice(0, 4);
}

function renderProductDetailRecommendations(product) {
  if (!productDetailRelatedGrid || !productDetailRecommendations) {
    return;
  }

  productDetailRelatedGrid.textContent = "";
  const recommendedProducts = buildProductDetailRecommendations(product);
  productDetailRecommendations.hidden = !recommendedProducts.length;

  if (!recommendedProducts.length) {
    return;
  }

  for (const item of recommendedProducts) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "product-detail-related-card";
    card.addEventListener("click", () => openProductDetail(item));

    const image = document.createElement("img");
    image.src = item.img;
    image.alt = item.name;
    image.loading = "lazy";
    card.appendChild(image);

    const category = document.createElement("p");
    category.className = "product-detail-related-category";
    category.textContent = item.category || "Keychain";
    card.appendChild(category);

    const title = document.createElement("h4");
    title.textContent = item.name;
    card.appendChild(title);

    const price = document.createElement("p");
    price.className = "product-detail-related-price";
    price.textContent = item.price;
    card.appendChild(price);

    productDetailRelatedGrid.appendChild(card);
  }
}

function openProductDetail(product, options = {}) {
  if (!product || !productDetailView) {
    return;
  }

  productDetailReturnY = window.scrollY || window.pageYOffset || 0;
  activeProductDetailId = Number(product.id) || 0;
  if (productDetailImage) {
    productDetailImage.src = product.img;
    productDetailImage.alt = product.name;
  }
  if (productDetailCategory) {
    productDetailCategory.textContent = product.category || "Featured Keychain";
  }
  if (productDetailTitle) {
    productDetailTitle.textContent = product.name;
  }
  if (productDetailPrice) {
    productDetailPrice.textContent = product.price;
  }
  if (productDetailDescription) {
    productDetailDescription.textContent = product.details;
  }
  if (productDetailBuyPrice) {
    productDetailBuyPrice.textContent = product.price;
  }
  if (productDetailMetaCategory) {
    productDetailMetaCategory.textContent = `Category: ${product.category || "Custom keychain"}`;
  }
  if (productDetailBreadcrumb) {
    productDetailBreadcrumb.textContent = product.name;
  }
  if (productDetailHighlights) {
    productDetailHighlights.textContent = "";
    for (const highlight of buildProductDetailHighlights(product)) {
      const item = document.createElement("li");
      item.textContent = highlight;
      productDetailHighlights.appendChild(item);
    }
  }

  setProductDetailQuantity(options.quantity || 1);
  renderProductDetailRecommendations(product);
  productDetailView.hidden = false;
  document.body.classList.add("product-detail-open");
  scrollPageToTop();
}

function closeProductDetail() {
  if (!productDetailView) {
    return;
  }

  productDetailView.hidden = true;
  document.body.classList.remove("product-detail-open");
  activeProductDetailId = 0;
  window.scrollTo({ top: productDetailReturnY, left: 0, behavior: "auto" });
}

function addActiveProductDetailToCart({ openCheckoutAfter = false } = {}) {
  const product = findProductById(activeProductDetailId);
  if (!product) {
    closeProductDetail();
    return;
  }

  const quantity = setProductDetailQuantity(productDetailQty ? productDetailQty.value : 1);
  addToCart(product, quantity);

  if (productDetailImage) {
    playAddToCartAnimation(productDetailImage, productDetailImage);
  }

  if (openCheckoutAfter) {
    closeProductDetail();
    openCheckout({ forceTop: true });
  }
}

function handleProductDetailTrigger(event, containerSelector) {
  if (!(event.target instanceof Element)) {
    return;
  }

  const triggerCard = event.target.closest(containerSelector);
  if (!triggerCard) {
    return;
  }

  if (event.target.closest("button")) {
    return;
  }

  const productId = Number(triggerCard.getAttribute("data-product-id"));
  if (!Number.isFinite(productId)) {
    return;
  }

  const product = findProductById(productId);
  if (!product) {
    return;
  }

  openProductDetail(product);
}

function sendCheckoutPhoneOtp() {
  const phone = checkoutPhone.value.trim();
  if (!phone) {
    phoneOtpMessage.textContent = "Enter phone number first.";
    return;
  }

  const countryCode = detectCountryByPhone(phone);
  if (!countryCode) {
    phoneOtpMessage.textContent = "Use a phone number with country code, for example +91 9876543210.";
    return;
  }

  checkoutCountryCode = countryCode;
  checkoutCountry.value = CHECKOUT_ADDRESS_DATA[countryCode].name;
  populateCheckoutStates(countryCode, checkoutState.value, checkoutDistrict.value);

  checkoutPhoneOtpCode = String(Math.floor(100000 + Math.random() * 900000));
  checkoutPendingPhone = normalizePhone(phone);
  checkoutVerifiedPhone = "";
  checkoutPhoneOtp.value = "";
  phoneOtpMessage.textContent = `Phone OTP sent to ${phone}. (Demo OTP: ${checkoutPhoneOtpCode})`;
}

function verifyCheckoutPhoneOtp() {
  if (!checkoutPhoneOtpCode) {
    phoneOtpMessage.textContent = "Send phone OTP first.";
    return;
  }

  const normalizedCurrentPhone = normalizePhone(checkoutPhone.value);
  if (!normalizedCurrentPhone || normalizedCurrentPhone !== checkoutPendingPhone) {
    phoneOtpMessage.textContent = "Phone changed. Send OTP again.";
    return;
  }

  if (checkoutPhoneOtp.value.trim() !== checkoutPhoneOtpCode) {
    phoneOtpMessage.textContent = "Invalid phone OTP.";
    return;
  }

  checkoutVerifiedPhone = normalizedCurrentPhone;
  phoneOtpMessage.textContent = "Phone number verified.";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeCardNumber(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 19);
}

function formatCardNumber(value) {
  const digits = normalizeCardNumber(value);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function normalizeCardExpiry(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function isValidCardExpiry(value) {
  const match = /^(\d{2})\/(\d{2})$/.exec(String(value || "").trim());
  if (!match) {
    return false;
  }

  const month = Number(match[1]);
  const year = Number(match[2]);
  if (month < 1 || month > 12) {
    return false;
  }

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear) {
    return false;
  }
  if (year === currentYear && month < currentMonth) {
    return false;
  }
  return true;
}

function normalizeCardCvv(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 4);
}

function normalizeUpiId(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidUpiId(value) {
  return /^[a-z0-9.\-_]{2,}@[a-z]{2,}$/i.test(normalizeUpiId(value));
}

function setPaymentFieldsVisibility(container, visible) {
  if (!container) {
    return;
  }

  container.hidden = !visible;
  container.querySelectorAll("input, select, textarea").forEach((field) => {
    field.disabled = !visible;
  });
}

function syncPaymentMethodUI() {
  const method = checkoutPaymentMethod ? checkoutPaymentMethod.value : "";
  const showCard = method === "card";
  const showUpi = method === "upi";

  setPaymentFieldsVisibility(paymentCardFields, showCard);
  setPaymentFieldsVisibility(paymentUpiFields, showUpi);

  if (!showCard) {
    if (checkoutCardHolder) {
      checkoutCardHolder.value = "";
    }
    if (checkoutCardNumber) {
      checkoutCardNumber.value = "";
    }
    if (checkoutCardExpiry) {
      checkoutCardExpiry.value = "";
    }
    if (checkoutCardCvv) {
      checkoutCardCvv.value = "";
    }
  }

  if (!showUpi && checkoutUpiId) {
    checkoutUpiId.value = "";
  }
}

function sendCheckoutEmailOtp() {
  const email = normalizeEmail(checkoutEmail.value);
  if (!isValidEmail(email)) {
    emailOtpMessage.textContent = "Enter a valid email ID first.";
    return;
  }

  checkoutEmailOtpCode = String(Math.floor(100000 + Math.random() * 900000));
  checkoutPendingEmail = email;
  checkoutVerifiedEmail = "";
  checkoutEmailOtp.value = "";
  emailOtpMessage.textContent = `Email OTP sent to ${email}. (Demo OTP: ${checkoutEmailOtpCode})`;
}

function verifyCheckoutEmailOtp() {
  if (!checkoutEmailOtpCode) {
    emailOtpMessage.textContent = "Send email OTP first.";
    return;
  }

  const currentEmail = normalizeEmail(checkoutEmail.value);
  if (!currentEmail || currentEmail !== checkoutPendingEmail) {
    emailOtpMessage.textContent = "Email changed. Send OTP again.";
    return;
  }

  if (checkoutEmailOtp.value.trim() !== checkoutEmailOtpCode) {
    emailOtpMessage.textContent = "Invalid email OTP.";
    return;
  }

  checkoutVerifiedEmail = currentEmail;
  emailOtpMessage.textContent = "Email verified.";
}

function placeOrder() {
  for (const entry of cartItems.values()) {
    const productId = String(entry.product.id);
    const existingCount = salesByProduct[productId] || 0;
    salesByProduct[productId] = existingCount + entry.qty;
  }
  saveSales();

  cartItems.clear();
  saveCart();
  updateCartUI();
  renderTopSells();
}

function submitCheckout(event) {
  event.preventDefault();
  checkoutMessage.textContent = "";

  if (!cartItems.size) {
    checkoutMessage.textContent = "Your cart is empty.";
    return;
  }

  if (!checkoutFirstName.value.trim()) {
    checkoutMessage.textContent = "Enter first name.";
    return;
  }

  const normalizedPhone = normalizePhone(checkoutPhone.value);
  if (!checkoutVerifiedPhone || checkoutVerifiedPhone !== normalizedPhone) {
    checkoutMessage.textContent = "Verify phone number with OTP.";
    return;
  }

  const normalizedEmail = normalizeEmail(checkoutEmail.value);
  if (!checkoutVerifiedEmail || checkoutVerifiedEmail !== normalizedEmail) {
    checkoutMessage.textContent = "Verify email ID with OTP.";
    return;
  }

  if (!checkoutCountryCode) {
    checkoutMessage.textContent = "Enter a valid phone number with country code.";
    return;
  }

  if (!checkoutState.value) {
    checkoutMessage.textContent = "Select state.";
    return;
  }

  if (!checkoutDistrict.value) {
    checkoutMessage.textContent = "Select district.";
    return;
  }

  if (!checkoutPostalCode.value.trim()) {
    checkoutMessage.textContent = "Enter postal code.";
    return;
  }

  if (!checkoutAddressLine1.value.trim()) {
    checkoutMessage.textContent = "Enter address line 1.";
    return;
  }

  if (!checkoutAddressLine2.value.trim()) {
    checkoutMessage.textContent = "Enter address line 2.";
    return;
  }

  const paymentMethod = checkoutPaymentMethod ? checkoutPaymentMethod.value : "";
  if (!paymentMethod) {
    checkoutMessage.textContent = "Select payment method.";
    return;
  }

  const cartSnapshot = [];
  let orderTotalAmount = 0;
  for (const entry of cartItems.values()) {
    const unitPrice = parsePrice(entry.product.price);
    const lineTotal = unitPrice * entry.qty;
    orderTotalAmount += lineTotal;
    cartSnapshot.push({
      name: entry.product.name,
      qty: entry.qty,
      unitPrice: formatPrice(unitPrice),
      lineTotal: formatPrice(lineTotal)
    });
  }

  let paymentSnapshot = { method: paymentMethod, summary: paymentMethod };

  if (paymentMethod === "card") {
    const cardHolder = checkoutCardHolder ? checkoutCardHolder.value.trim() : "";
    const cardNumber = normalizeCardNumber(checkoutCardNumber ? checkoutCardNumber.value : "");
    const cardExpiry = normalizeCardExpiry(checkoutCardExpiry ? checkoutCardExpiry.value : "");
    const cardCvv = normalizeCardCvv(checkoutCardCvv ? checkoutCardCvv.value : "");

    if (!cardHolder) {
      checkoutMessage.textContent = "Enter cardholder name.";
      return;
    }

    if (cardNumber.length < 13) {
      checkoutMessage.textContent = "Enter a valid card number.";
      return;
    }

    if (!isValidCardExpiry(cardExpiry)) {
      checkoutMessage.textContent = "Enter a valid card expiry in MM/YY.";
      return;
    }

    if (cardCvv.length < 3) {
      checkoutMessage.textContent = "Enter a valid card CVV.";
      return;
    }

    paymentSnapshot = {
      method: "card",
      summary: `Card ending ${cardNumber.slice(-4)}`
    };
  } else if (paymentMethod === "upi") {
    const upiId = normalizeUpiId(checkoutUpiId ? checkoutUpiId.value : "");
    if (!isValidUpiId(upiId)) {
      checkoutMessage.textContent = "Enter a valid UPI ID.";
      return;
    }

    paymentSnapshot = {
      method: "upi",
      summary: `UPI ${maskUpiId(upiId)}`
    };
  } else if (paymentMethod !== "cod") {
    checkoutMessage.textContent = "Select a valid payment method.";
    return;
  } else {
    paymentSnapshot = {
      method: "cod",
      summary: "Cash on Delivery"
    };
  }

  const createdAt = new Date().toISOString();
  const checkoutSnapshot = {
    firstName: checkoutFirstName.value.trim(),
    secondName: checkoutLastName.value.trim(),
    phone: checkoutPhone.value.trim(),
    email: normalizedEmail,
    country: checkoutCountry.value,
    state: checkoutState.value,
    district: checkoutDistrict.value,
    postalCode: checkoutPostalCode.value.trim(),
    addressLine1: checkoutAddressLine1.value.trim(),
    addressLine2: checkoutAddressLine2.value.trim(),
    landmark: checkoutLandmark.value.trim(),
    items: cartSnapshot,
    total: formatPrice(orderTotalAmount),
    payment: paymentSnapshot,
    createdAt
  };

  appendOrderHistory(createOrderHistoryEntry({
    customerName: [checkoutSnapshot.firstName, checkoutSnapshot.secondName].filter(Boolean).join(" "),
    email: checkoutSnapshot.email,
    phone: checkoutSnapshot.phone,
    itemsSummary: summarizeOrderItems(checkoutSnapshot.items),
    addressSummary: summarizeOrderAddress(checkoutSnapshot),
    paymentSummary: checkoutSnapshot.payment.summary,
    total: checkoutSnapshot.total,
    createdAt: checkoutSnapshot.createdAt
  }));
  localStorage.setItem("nkeys_last_checkout", JSON.stringify(checkoutSnapshot));
  placeOrder();
  closeCheckout();
  alert("Order placed successfully.");
}

function applyAuthUI() {
  const loggedIn = isLoggedIn();
  loginBtn.hidden = loggedIn;
  logoutBtn.hidden = !loggedIn;

  if (loggedIn) {
    sessionUser.textContent = `${session.name} (${session.role})`;
  } else {
    sessionUser.textContent = "";
  }

  ownerSection.hidden = !isOwner();
  ownerForm.style.display = "grid";
  ownerLockMessage.hidden = true;
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.hidden = !isOwner();
  });
}

function parsePrice(value) {
  const amount = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
}

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(value);
}

function openCart({ forceTop = false } = {}) {
  if (forceTop) {
    scrollPageToTop();
  }

  updateCartUI();
  if (!cartDrawer || !cartBackdrop) {
    return;
  }
  cartDrawer.classList.add("open");
  cartBackdrop.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartBackdrop.setAttribute("aria-hidden", "false");
  document.body.classList.add("cart-open");
  if (cartList) {
    cartList.scrollTop = 0;
  }
}

function closeCart() {
  if (!cartDrawer || !cartBackdrop) {
    return;
  }
  cartDrawer.classList.remove("open");
  cartBackdrop.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartBackdrop.setAttribute("aria-hidden", "true");
  document.body.classList.remove("cart-open");
}

function handleCartButtonInteraction(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  openCart({ forceTop: true });
}

function setLikeButtonState(button, productId) {
  if (!button) {
    return;
  }

  const liked = likedProductIds.has(productId);
  const symbol = button.querySelector(".like-symbol");
  button.classList.toggle("liked", liked);
  button.setAttribute("aria-pressed", String(liked));
  button.setAttribute("aria-label", liked ? "Remove from likes" : "Like keychain");
  if (symbol) {
    symbol.textContent = liked ? "\u2665" : "\u2661";
  }
}

function updateLikesUI() {
  if (likesCount) {
    likesCount.textContent = String(likedProductIds.size);
  }

  if (likesBtn) {
    likesBtn.classList.toggle("has-likes", likedProductIds.size > 0);
    likesBtn.setAttribute(
      "aria-label",
      likedProductIds.size ? `Liked keychains (${likedProductIds.size})` : "Liked keychains"
    );
  }

  document.querySelectorAll(".like-btn").forEach((button) => {
    const productId = Number(button.dataset.productId);
    if (Number.isFinite(productId)) {
      setLikeButtonState(button, productId);
    }
  });
}

function toggleLike(productId) {
  if (!Number.isFinite(productId)) {
    return;
  }

  if (likedProductIds.has(productId)) {
    likedProductIds.delete(productId);
  } else {
    likedProductIds.add(productId);
  }

  saveLikes();
  updateLikesUI();
}

function spotlightLikedProducts() {
  productsSection?.scrollIntoView({ behavior: "smooth", block: "start" });

  document.querySelectorAll(".product-card[data-product-id]").forEach((card) => {
    const productId = Number(card.dataset.productId);
    if (!likedProductIds.has(productId)) {
      card.classList.remove("liked-focus");
      return;
    }

    card.classList.remove("liked-focus");
    void card.offsetWidth;
    card.classList.add("liked-focus");
    window.setTimeout(() => {
      card.classList.remove("liked-focus");
    }, 1400);
  });
}

function updateCartCount() {
  let totalItems = 0;
  for (const entry of cartItems.values()) {
    totalItems += entry.qty;
  }
  cartCount.textContent = String(totalItems);
}

function buildCartItemRow(entry) {
  const wrapper = document.createElement("article");
  wrapper.className = "cart-item";

  const img = document.createElement("img");
  img.src = entry.product.img;
  img.alt = entry.product.name;
  wrapper.appendChild(img);

  const content = document.createElement("div");
  const title = document.createElement("h4");
  title.textContent = entry.product.name;
  content.appendChild(title);

  const meta = document.createElement("p");
  meta.className = "cart-meta";
  const subtotal = parsePrice(entry.product.price) * entry.qty;
  meta.textContent = `${entry.qty} x ${entry.product.price} = ${formatPrice(subtotal)}`;
  content.appendChild(meta);

  const row = document.createElement("div");
  row.className = "qty-row";

  const minusBtn = document.createElement("button");
  minusBtn.type = "button";
  minusBtn.className = "qty-btn";
  minusBtn.textContent = "-";
  minusBtn.addEventListener("click", () => {
    if (entry.qty <= 1) {
      cartItems.delete(entry.product.id);
    } else {
      entry.qty -= 1;
    }
    saveCart();
    updateCartUI();
  });
  row.appendChild(minusBtn);

  const qty = document.createElement("span");
  qty.textContent = String(entry.qty);
  row.appendChild(qty);

  const plusBtn = document.createElement("button");
  plusBtn.type = "button";
  plusBtn.className = "qty-btn";
  plusBtn.textContent = "+";
  plusBtn.addEventListener("click", () => {
    entry.qty += 1;
    saveCart();
    updateCartUI();
  });
  row.appendChild(plusBtn);

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "remove-btn";
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => {
    cartItems.delete(entry.product.id);
    saveCart();
    updateCartUI();
  });
  row.appendChild(removeBtn);

  content.appendChild(row);
  wrapper.appendChild(content);
  return wrapper;
}

function updateCartUI() {
  cartList.innerHTML = "";

  let total = 0;
  for (const entry of cartItems.values()) {
    total += parsePrice(entry.product.price) * entry.qty;
    cartList.appendChild(buildCartItemRow(entry));
  }

  updateCartCount();
  cartEmpty.style.display = cartItems.size ? "none" : "block";
  cartTotal.textContent = formatPrice(total);
}

function addToCart(product, quantity = 1) {
  const normalizedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
  const existing = cartItems.get(product.id);
  if (existing) {
    existing.qty += normalizedQuantity;
  } else {
    cartItems.set(product.id, { product, qty: normalizedQuantity });
  }
  saveCart();
  updateCartUI();
}

function playAddToCartAnimation(sourceCard, sourceImage) {
  if (!sourceCard || !sourceImage) {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    cartBtn.classList.remove("cart-bump");
    void cartBtn.offsetWidth;
    cartBtn.classList.add("cart-bump");
    return;
  }

  const layer = document.createElement("div");
  layer.className = "cart-runner-layer";

  const cartRunner = document.createElement("div");
  cartRunner.className = "cart-runner";
  cartRunner.innerHTML = [
    '<svg class="cart-runner-icon" viewBox="0 0 920 520" aria-hidden="true" focusable="false">',
    '<path d="M36 118h116l84 252h430l110-206H196" fill="none" stroke="currentColor" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"></path>',
    '<circle cx="318" cy="430" r="58" fill="none" stroke="currentColor" stroke-width="28"></circle>',
    '<circle cx="636" cy="430" r="58" fill="none" stroke="currentColor" stroke-width="28"></circle>',
    '<path d="M780 126h70" fill="none" stroke="currentColor" stroke-width="28" stroke-linecap="round"></path>',
    '<path d="M742 82h56" fill="none" stroke="currentColor" stroke-width="20" stroke-linecap="round"></path>',
    "</svg>"
  ].join("");

  const pageWidth = Math.max(
    window.innerWidth,
    document.documentElement.scrollWidth,
    document.body.scrollWidth
  );
  const pageHeight = Math.max(
    window.innerHeight,
    document.documentElement.scrollHeight,
    document.body.scrollHeight
  );
  layer.style.width = `${pageWidth}px`;
  layer.style.height = `${pageHeight}px`;

  const offsetX = window.scrollX;
  const offsetY = window.scrollY;
  const cartRect = cartBtn.getBoundingClientRect();
  const runnerWidth = Math.min(220, Math.max(150, window.innerWidth * 0.18));
  const runnerHeight = runnerWidth * (520 / 920);
  const cartStartX = offsetX + 24;
  const cartStartY = offsetY + Math.max(86, window.innerHeight - runnerHeight - 24);
  const cartMidX = offsetX + Math.max(28, Math.min(window.innerWidth * 0.36, cartRect.left - runnerWidth * 0.45));
  const cartMidY = offsetY + Math.max(64, cartRect.top + 90);
  const cartEndX = offsetX + cartRect.left + cartRect.width * 0.5 - runnerWidth * 0.5;
  const cartEndY = offsetY + cartRect.top + cartRect.height * 0.5 - runnerHeight * 0.55;

  const runnerProduct = document.createElement("div");
  runnerProduct.className = "cart-runner-product";
  runnerProduct.style.backgroundImage = `url("${sourceImage.src}")`;
  cartRunner.appendChild(runnerProduct);

  cartRunner.style.width = `${runnerWidth}px`;

  cartRunner.style.transform = `translate(${cartStartX}px, ${cartStartY}px)`;
  cartRunner.style.opacity = "0.95";
  cartRunner.style.transition = "transform 1.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 1.3s ease";

  layer.appendChild(cartRunner);
  document.body.appendChild(layer);

  requestAnimationFrame(() => {
    cartRunner.style.transform = `translate(${cartMidX}px, ${cartMidY}px)`;
  });

  setTimeout(() => {
    cartRunner.style.transition = "transform 0.7s cubic-bezier(0.2, 0.9, 0.2, 1), opacity 0.7s ease";
    cartRunner.style.transform = `translate(${cartEndX}px, ${cartEndY}px) scale(0.8)`;
    cartRunner.style.opacity = "0.35";
  }, 760);

  setTimeout(() => {
    cartBtn.classList.remove("cart-bump");
    void cartBtn.offsetWidth;
    cartBtn.classList.add("cart-bump");
  }, 1320);

  setTimeout(() => {
    layer.remove();
  }, 1800);
}

function buildHeroSlides() {
  const productSlides = products
    .filter((item) => String(item.img || "").trim())
    .slice(0, 4)
    .map((item, index) => ({
      label: index === 0 ? "Latest Keychain" : item.category || "Featured Keychain",
      title: item.name,
      img: item.img,
      alt: item.name
    }));

  return productSlides.length ? productSlides : HERO_INITIAL_SLIDES;
}

function stopHeroSliderAutoplay() {
  if (heroSliderTimer) {
    window.clearInterval(heroSliderTimer);
    heroSliderTimer = 0;
  }
}

function syncHeroSlider() {
  if (!heroSliderTrack || !heroSlides.length) {
    return;
  }

  const boundedIndex = ((heroSlideIndex % heroSlides.length) + heroSlides.length) % heroSlides.length;
  heroSlideIndex = boundedIndex;
  heroSliderTrack.style.transform = `translateX(-${boundedIndex * 100}%)`;

  const currentSlide = heroSlides[boundedIndex];
  if (heroSlideLabel) {
    heroSlideLabel.textContent = currentSlide.label;
  }
  if (heroSlideTitle) {
    heroSlideTitle.textContent = currentSlide.title;
  }

  if (heroSliderDots) {
    heroSliderDots.querySelectorAll(".hero-slider-dot").forEach((button, index) => {
      const active = index === boundedIndex;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }
}

function startHeroSliderAutoplay() {
  stopHeroSliderAutoplay();
  if (heroSlides.length < 2) {
    return;
  }

  heroSliderTimer = window.setInterval(() => {
    heroSlideIndex += 1;
    syncHeroSlider();
  }, 3400);
}

function goToHeroSlide(index) {
  heroSlideIndex = index;
  syncHeroSlider();
  startHeroSliderAutoplay();
}

function renderHeroSlider() {
  if (!heroSliderTrack || !heroSliderDots) {
    return;
  }

  heroSlides = buildHeroSlides();
  if (!heroSlides.length) {
    return;
  }

  heroSliderTrack.textContent = "";
  heroSliderDots.textContent = "";

  for (const slide of heroSlides) {
    const slideNode = document.createElement("article");
    slideNode.className = "hero-slide";

    const image = document.createElement("img");
    image.src = slide.img;
    image.alt = slide.alt;
    image.loading = "eager";
    image.decoding = "async";
    slideNode.appendChild(image);

    heroSliderTrack.appendChild(slideNode);
  }

  heroSlides.forEach((slide, index) => {
    const dot = document.createElement("button");
    dot.className = "hero-slider-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Show ${slide.title}`);
    dot.addEventListener("click", () => goToHeroSlide(index));
    heroSliderDots.appendChild(dot);
  });

  heroSliderDots.hidden = heroSlides.length < 2;
  if (heroSlideIndex >= heroSlides.length) {
    heroSlideIndex = 0;
  }
  syncHeroSlider();
  startHeroSliderAutoplay();
}

function renderProduct(item, prepend = false) {
  const node = template.content.cloneNode(true);
  const card = node.querySelector(".product-card");
  const img = node.querySelector("img");
  const title = node.querySelector("h3");
  const details = node.querySelector(".details");
  const price = node.querySelector(".price");
  const likeButton = node.querySelector(".like-btn");
  const addButton = node.querySelector(".add-btn");
  const deleteButton = node.querySelector(".delete-btn");

  card.dataset.productId = String(item.id);
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `View details for ${item.name}`);
  img.src = item.img;
  img.alt = item.name;
  title.textContent = item.name;
  details.textContent = item.category ? `${item.category} - ${item.details}` : item.details;
  price.textContent = item.price;
  deleteButton.hidden = !isOwner();
  if (likeButton) {
    likeButton.dataset.productId = String(item.id);
    setLikeButtonState(likeButton, item.id);
    likeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleLike(item.id);
    });
  }

  addButton.addEventListener("click", (event) => {
    event.stopPropagation();
    playAddToCartAnimation(card, img);
    addToCart(item);
    addButton.textContent = "Added";
    addButton.disabled = true;

    setTimeout(() => {
      addButton.textContent = "Add to Cart";
      addButton.disabled = false;
    }, 650);
  });

  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!isOwner()) {
      openLogin();
      return;
    }

    const index = products.findIndex((product) => product.id === item.id);
    if (index !== -1) {
      products.splice(index, 1);
      saveProducts();
    }
    if (likedProductIds.delete(item.id)) {
      saveLikes();
      updateLikesUI();
    }
    cartItems.delete(item.id);
    saveCart();
    updateCartUI();
    card.remove();
    if (activeProductDetailId === item.id) {
      closeProductDetail();
    }
    updateProductsEmptyState();
    renderHeroSlider();
    renderTopSells();
  });

  card.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("button")) {
      return;
    }
    openProductDetail(item);
  });

  card.addEventListener("keydown", (event) => {
    if (event.target !== card) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProductDetail(item);
    }
  });

  if (prepend) {
    grid.prepend(node);
  } else {
    grid.appendChild(node);
  }

  updateProductsEmptyState();
  observer.observe(card);
}

function updateProductsEmptyState() {
  if (!productsEmpty) {
    return;
  }
  productsEmpty.style.display = products.length ? "none" : "block";
}

function renderTopSells() {
  if (!topSellsGrid) {
    return;
  }

  topSellsGrid.innerHTML = "";

  const ranked = products
    .map((product) => ({
      product,
      sales: salesByProduct[String(product.id)] || 0
    }))
    .filter((entry) => entry.sales > 0)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 4);

  if (!ranked.length) {
    const empty = document.createElement("p");
    empty.className = "top-sells-empty";
    empty.textContent = "No orders yet. Best-selling keychains appear after checkout.";
    topSellsGrid.appendChild(empty);
    return;
  }

  for (const entry of ranked) {
    const card = document.createElement("article");
    card.className = "top-sell-card";
    card.dataset.productId = String(entry.product.id);
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `View details for ${entry.product.name}`);

    const img = document.createElement("img");
    img.src = entry.product.img;
    img.alt = entry.product.name;
    img.loading = "lazy";
    card.appendChild(img);

    const title = document.createElement("h3");
    title.textContent = entry.product.name;
    card.appendChild(title);

    const price = document.createElement("p");
    price.className = "price";
    price.textContent = entry.product.price;
    card.appendChild(price);

    card.addEventListener("click", () => openProductDetail(entry.product));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProductDetail(entry.product);
      }
    });

    topSellsGrid.appendChild(card);
  }
}

function renderCategories() {
  if (!categoryRow) {
    return;
  }

  categoryRow.innerHTML = "";
  for (const name of categories) {
    const pill = document.createElement("article");
    pill.className = "category-pill";
    pill.textContent = name;
    categoryRow.appendChild(pill);
  }
}

function renderOwnerCategoryOptions(preferredCategory = "") {
  if (!productCategory) {
    return;
  }

  productCategory.innerHTML = "";

  for (const name of categories) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    if (preferredCategory && preferredCategory.toLowerCase() === name.toLowerCase()) {
      option.selected = true;
    }
    productCategory.appendChild(option);
  }
}

function setupCursorChain() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.className = "cursor-chain-layer";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let width = 0;
  let height = 0;
  let pointerClientX = window.innerWidth * 0.5;
  let pointerClientY = window.innerHeight * 0.5;
  let targetX = window.scrollX + pointerClientX;
  let targetY = window.scrollY + pointerClientY;
  let active = false;
  let lastMoveAt = 0;

  const linkCount = 14;
  const linkSpacing = 9;
  const chain = Array.from({ length: linkCount }, (_, index) => ({
    x: targetX,
    y: targetY + (index + 1) * linkSpacing
  }));

  function syncTargetToScroll() {
    targetX = window.scrollX + pointerClientX;
    targetY = window.scrollY + pointerClientY;
  }

  function resize() {
    width = Math.max(
      window.innerWidth,
      document.documentElement.scrollWidth,
      document.body.scrollWidth
    );
    height = Math.max(
      window.innerHeight,
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    syncTargetToScroll();
  }

  function drawRing(cx, cy, radius, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    const ringGradient = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    ringGradient.addColorStop(0, "#fefefe");
    ringGradient.addColorStop(0.45, "#a9b0ba");
    ringGradient.addColorStop(0.7, "#f4f7fb");
    ringGradient.addColorStop(1, "#7f8792");
    ctx.strokeStyle = ringGradient;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#d8dee6";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 2.5, Math.PI * 0.15, Math.PI * 1.4);
    ctx.stroke();
    ctx.restore();
  }

  function drawChainLink(x, y, angle, widthValue, heightValue, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(angle);
    const linkGradient = ctx.createLinearGradient(-widthValue, -heightValue, widthValue, heightValue);
    linkGradient.addColorStop(0, "#edf1f6");
    linkGradient.addColorStop(0.5, "#8e96a2");
    linkGradient.addColorStop(1, "#f7fafc");
    ctx.strokeStyle = linkGradient;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, widthValue, heightValue, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawConnectorLoop(x, y, angle, alpha) {
    drawChainLink(x, y, angle, 4.6, 3.6, alpha);
  }

  function drawHook(x, y, angle, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(angle);
    const hookGradient = ctx.createLinearGradient(-10, -14, 8, 13);
    hookGradient.addColorStop(0, "#f4f7fb");
    hookGradient.addColorStop(0.5, "#9099a5");
    hookGradient.addColorStop(1, "#eef2f6");
    ctx.strokeStyle = hookGradient;
    ctx.lineWidth = 2.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(-2, -12);
    ctx.quadraticCurveTo(9, -5, 8, 6);
    ctx.quadraticCurveTo(8, 14, -1, 14);
    ctx.quadraticCurveTo(-9, 14, -9, 7);
    ctx.stroke();

    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(5, 6);
    ctx.quadraticCurveTo(1, 10, -3, 11);
    ctx.stroke();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    const now = performance.now();
    const idleFade = Math.max(0.18, 1 - (now - lastMoveAt) / 2800);

    const ringX = targetX;
    const ringY = targetY;
    const head = chain[0];
    const neck = chain[1];
    head.x = ringX;
    head.y = ringY;
    if (neck) {
      neck.x = ringX;
      neck.y = ringY;
    }

    for (let index = 2; index < chain.length; index += 1) {
      const prev = chain[index - 1];
      const current = chain[index];

      const dx = prev.x - current.x;
      const dy = prev.y - current.y;
      const distance = Math.hypot(dx, dy) || 1;
      const stretch = distance - linkSpacing;

      current.x += (dx / distance) * stretch * 0.48;
      current.y += (dy / distance) * stretch * 0.48 + 0.2;
      current.x += Math.sin((now * 0.002) + index * 0.4) * 0.02;
    }

    const baseAlpha = (active ? 1 : idleFade) * 0.95;
    drawRing(ringX, ringY, 9, baseAlpha);

    const next = chain[2] || head;
    const c1x = ringX;
    const c1y = ringY;
    const c2x = next.x;
    const c2y = next.y;
    const connectorAngle = Math.atan2(c2y - c1y, c2x - c1x);
    drawConnectorLoop(c1x, c1y, connectorAngle, baseAlpha);
    drawConnectorLoop((c1x + c2x) * 0.5, (c1y + c2y) * 0.5, connectorAngle, baseAlpha * 0.94);

    for (let index = 1; index < chain.length; index += 1) {
      const prev = chain[index - 1];
      const current = chain[index];
      const midX = (prev.x + current.x) * 0.5;
      const midY = (prev.y + current.y) * 0.5;
      const angle = Math.atan2(current.y - prev.y, current.x - prev.x);
      const t = index / chain.length;
      const linkAlpha = baseAlpha * (1 - t * 0.3);
    drawChainLink(midX, midY, angle, 4.2, 2.8, linkAlpha);
    }

    const tail = chain[chain.length - 1];
    const prevTail = chain[chain.length - 2];
    const hookAngle = Math.atan2(tail.y - prevTail.y, tail.x - prevTail.x) + 0.4;
    drawHook(tail.x, tail.y + 3, hookAngle, baseAlpha);

    ctx.save();
    ctx.globalAlpha = baseAlpha * 0.7;
    ctx.fillStyle = "#f7fafc";
    ctx.beginPath();
    ctx.arc(ringX - 3.5, ringY - 3.5, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);

  window.addEventListener("pointermove", (event) => {
    lastMoveAt = performance.now();
    active = true;
    pointerClientX = event.clientX;
    pointerClientY = event.clientY;
    syncTargetToScroll();
  });

  window.addEventListener("scroll", syncTargetToScroll, { passive: true });

  window.addEventListener("pointerleave", () => {
    active = false;
  });

  resize();
  animate();
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Image upload failed"));
    reader.readAsDataURL(file);
  });
}

function sendVerificationCode(method) {
  const email = loginEmail.value.trim();
  const phone = loginPhone.value.trim();

  if (!email || !phone) {
    loginMessage.textContent = "Enter email and phone before verification.";
    return;
  }

  pendingVerificationMethod = method;
  pendingVerificationCode = String(Math.floor(100000 + Math.random() * 900000));
  verifiedMethod = "";
  verifiedContact = "";

  const contact = method === "email" ? email : phone;
  loginMessage.textContent = `Verification code sent to ${contact}. (Demo code: ${pendingVerificationCode})`;
}

function confirmVerificationCode() {
  if (!pendingVerificationCode || !pendingVerificationMethod) {
    loginMessage.textContent = "Click verify with email or phone first.";
    return;
  }

  if (loginCode.value.trim() !== pendingVerificationCode) {
    loginMessage.textContent = "Invalid verification code.";
    return;
  }

  verifiedMethod = pendingVerificationMethod;
  verifiedContact = verifiedMethod === "email" ? loginEmail.value.trim() : loginPhone.value.trim();
  loginMessage.textContent = `Verified using ${verifiedMethod}.`;
}

for (const item of products) {
  renderProduct(item);
}

ownerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  ownerMessage.textContent = "";

  if (!isOwner()) {
    ownerMessage.textContent = "Only owner can add keychains.";
    openLogin();
    return;
  }

  const formData = new FormData(ownerForm);
  const name = String(formData.get("productName") || "").trim();
  const rawPrice = String(formData.get("productPrice") || "").trim();
  const selectedCategory = normalizeCategoryName(formData.get("productCategory"));
  const requestedCategory = normalizeCategoryName(formData.get("newCategory"));
  const details = String(formData.get("productDetails") || "").trim();
  const imageUrl = String(formData.get("productImageUrl") || "").trim();
  const selectedFile = productImageFile.files && productImageFile.files[0];

  let category = selectedCategory;
  if (requestedCategory) {
    category = addCategory(requestedCategory);
  }

  if (!category) {
    ownerMessage.textContent = "Select a category or add a new collection.";
    return;
  }

  if (!imageUrl && !selectedFile) {
    ownerMessage.textContent = "Add a keychain image URL or upload an image file.";
    return;
  }

  let img = imageUrl;
  if (selectedFile) {
    try {
      img = await toDataUrl(selectedFile);
    } catch {
      ownerMessage.textContent = "Could not process image file.";
      return;
    }
  }

  const numericPrice = parsePrice(rawPrice);
  const item = {
    id: nextProductId++,
    name,
    price: formatPrice(numericPrice),
    category,
    details,
    img
  };

  products.unshift(item);
  saveProducts();
  renderProduct(item, true);
  renderHeroSlider();
  renderTopSells();
  productsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  ownerForm.reset();
  renderOwnerCategoryOptions(category);
  if (newCategoryInput) {
    newCategoryInput.value = "";
  }
  ownerMessage.textContent = "Keychain added successfully.";
  applyAuthUI();
});

if (showLoginDetailsBtn) {
  showLoginDetailsBtn.addEventListener("click", () => setOwnerDetailsView("login"));
}

if (showOrderDetailsBtn) {
  showOrderDetailsBtn.addEventListener("click", () => setOwnerDetailsView("order"));
}

if (likesBtn) {
  likesBtn.addEventListener("click", spotlightLikedProducts);
}

if (heroSlider) {
  heroSlider.addEventListener("pointerenter", stopHeroSliderAutoplay);
  heroSlider.addEventListener("pointerleave", startHeroSliderAutoplay);
}

if (grid) {
  grid.addEventListener("click", (event) => {
    handleProductDetailTrigger(event, ".product-card[data-product-id]");
  });
}

if (topSellsGrid) {
  topSellsGrid.addEventListener("click", (event) => {
    handleProductDetailTrigger(event, ".top-sell-card[data-product-id]");
  });
}

verifyEmailBtn.addEventListener("click", () => sendVerificationCode("email"));
verifyPhoneBtn.addEventListener("click", () => sendVerificationCode("phone"));
confirmCodeBtn.addEventListener("click", confirmVerificationCode);

loginBtn.addEventListener("click", openLogin);
closeLoginModal.addEventListener("click", closeLogin);
loginModal.addEventListener("click", (event) => {
  if (event.target === loginModal) {
    closeLogin();
  }
});

closeCheckoutModal.addEventListener("click", closeCheckout);
checkoutModal.addEventListener("click", (event) => {
  if (event.target === checkoutModal) {
    closeCheckout();
  }
});

if (closeProductDetailModal) {
  closeProductDetailModal.addEventListener("click", closeProductDetail);
}

if (productDetailAddBtn) {
  productDetailAddBtn.addEventListener("click", () => {
    addActiveProductDetailToCart();
  });
}

if (productDetailBuyBtn) {
  productDetailBuyBtn.addEventListener("click", () => {
    addActiveProductDetailToCart({ openCheckoutAfter: true });
  });
}

sendPhoneOtpBtn.addEventListener("click", sendCheckoutPhoneOtp);
verifyPhoneOtpBtn.addEventListener("click", verifyCheckoutPhoneOtp);
sendEmailOtpBtn.addEventListener("click", sendCheckoutEmailOtp);
verifyEmailOtpBtn.addEventListener("click", verifyCheckoutEmailOtp);

checkoutPhone.addEventListener("input", () => {
  const normalizedCurrentPhone = normalizePhone(checkoutPhone.value);
  if (checkoutVerifiedPhone && normalizedCurrentPhone !== checkoutVerifiedPhone) {
    resetCheckoutPhoneVerification("Phone changed. Verify again.");
  } else if (checkoutPendingPhone && normalizedCurrentPhone !== checkoutPendingPhone) {
    resetCheckoutPhoneVerification("Phone changed. Send OTP again.");
  }
  syncCheckoutCountryFromPhone();
});

checkoutEmail.addEventListener("input", () => {
  const currentEmail = normalizeEmail(checkoutEmail.value);
  if (checkoutVerifiedEmail && currentEmail !== checkoutVerifiedEmail) {
    resetCheckoutEmailVerification("Email changed. Verify again.");
  } else if (checkoutPendingEmail && currentEmail !== checkoutPendingEmail) {
    resetCheckoutEmailVerification("Email changed. Send OTP again.");
  }
});

checkoutState.addEventListener("change", () => {
  if (!checkoutCountryCode) {
    return;
  }
  populateCheckoutDistricts(checkoutCountryCode, checkoutState.value, checkoutDistrict.value);
});

if (checkoutPaymentMethod) {
  checkoutPaymentMethod.addEventListener("change", syncPaymentMethodUI);
}

if (checkoutCardNumber) {
  checkoutCardNumber.addEventListener("input", () => {
    checkoutCardNumber.value = formatCardNumber(checkoutCardNumber.value);
  });
}

if (checkoutCardExpiry) {
  checkoutCardExpiry.addEventListener("input", () => {
    checkoutCardExpiry.value = normalizeCardExpiry(checkoutCardExpiry.value);
  });
}

if (checkoutCardCvv) {
  checkoutCardCvv.addEventListener("input", () => {
    checkoutCardCvv.value = normalizeCardCvv(checkoutCardCvv.value);
  });
}

if (checkoutUpiId) {
  checkoutUpiId.addEventListener("blur", () => {
    checkoutUpiId.value = normalizeUpiId(checkoutUpiId.value);
  });
}

checkoutForm.addEventListener("submit", submitCheckout);

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessage.textContent = "";

  const name = loginName.value.trim();
  const email = loginEmail.value.trim().toLowerCase();
  const phone = loginPhone.value.trim();

  if (!verifiedMethod || !verifiedContact) {
    loginMessage.textContent = "Complete verification before login.";
    return;
  }

  const expectedContact = verifiedMethod === "email" ? email : phone;
  if (verifiedContact !== expectedContact) {
    loginMessage.textContent = "Contact changed. Verify again.";
    return;
  }

  const role = email === OWNER_EMAIL ? "owner" : "customer";
  const loginAt = new Date().toISOString();
  const nextSession = { name, email, phone, role, verifiedBy: verifiedMethod, loginAt };
  const loginEntry = createLoginHistoryEntry(nextSession);

  saveSession(nextSession);
  appendLoginHistory(loginEntry);
  const synced = await sendLoginToSheet(nextSession);
  updateLoginHistorySyncStatus(loginEntry.id, synced ? "synced" : "queued");

  loginForm.reset();
  closeLogin();
});

logoutBtn.addEventListener("click", () => {
  saveSession(null);
  closeLogin();
});

cartBtn.addEventListener("click", handleCartButtonInteraction);
closeCartBtn.addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);

checkoutBtn.addEventListener("click", () => {
  if (!cartItems.size) {
    return;
  }
  closeCart();
  openCheckout({ forceTop: true });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
    closeLogin();
    closeCheckout();
    closeProductDetail();
  }
});

updateCartUI();
renderCategories();
renderOwnerCategoryOptions();
renderLoginHistory();
renderOrderHistory();
setOwnerDetailsView("login");
syncPaymentMethodUI();
applyAuthUI();
updateLikesUI();
updateProductsEmptyState();
renderHeroSlider();
renderTopSells();
setupCursorChain();
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
