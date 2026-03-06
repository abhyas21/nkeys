let nextProductId = 1;

const SESSION_KEY = "nkeys_user_session";
const SHEET_FALLBACK_KEY = "nkeys_sheet_fallback";
const SALES_KEY = "nkeys_sales_by_product";
const PRODUCTS_KEY = "nkeys_products";
const CATEGORIES_KEY = "nkeys_categories";
const CART_KEY = "nkeys_cart_items";
const OWNER_EMAIL = "abhyas2006@gmail.com";
const SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzZvEO19bp-EnMHQoXwpb3TksTnrLaei8_YQ8F3rH8aaYSs9RCQw17_LbSfPhiKvygl/exec";
const DEFAULT_CATEGORIES = ["Metal", "Glass", "Rubber"];

const products = readProducts();

const grid = document.getElementById("productGrid");
const template = document.getElementById("productTemplate");
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
const checkoutModal = document.getElementById("checkoutModal");
const closeCheckoutModal = document.getElementById("closeCheckoutModal");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutMessage = document.getElementById("checkoutMessage");
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

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.16 });

const CHECKOUT_ADDRESS_DATA = {
  IN: {
    name: "India",
    dialCodes: ["91"],
    states: {
      Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
      Karnataka: ["Bengaluru Urban", "Mysuru", "Mangaluru", "Belagavi", "Hubballi"],
      "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli"],
      Delhi: ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "South Delhi"],
      "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "North 24 Parganas", "South 24 Parganas"]
    }
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
      const price = String(entry.price || "").trim();
      const category = normalizeCategoryName(entry.category || "");

      if (!Number.isFinite(id) || !name || !details || !img || !price) {
        continue;
      }

      cleaned.push({
        id,
        name,
        details,
        img,
        price,
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
    return unique.length ? unique : [...DEFAULT_CATEGORIES];
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
    return;
  }

  try {
    await fetch(SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch {
    queueSheetFallback(payload);
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
  } else {
    checkoutDistrict.value = districts[0];
  }
}

function populateCheckoutStates(countryCode, preferredState = "") {
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
  } else {
    checkoutState.value = states[0];
  }

  populateCheckoutDistricts(countryCode, checkoutState.value);
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
  populateCheckoutStates(countryCode, checkoutState.value);

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

  let paymentSnapshot = { method: paymentMethod };

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
      cardHolder,
      cardLast4: cardNumber.slice(-4),
      cardExpiry
    };
  } else if (paymentMethod === "upi") {
    const upiId = normalizeUpiId(checkoutUpiId ? checkoutUpiId.value : "");
    if (!isValidUpiId(upiId)) {
      checkoutMessage.textContent = "Enter a valid UPI ID.";
      return;
    }

    paymentSnapshot = {
      method: "upi",
      upiId
    };
  } else if (paymentMethod !== "cod") {
    checkoutMessage.textContent = "Select a valid payment method.";
    return;
  }

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
    payment: paymentSnapshot,
    createdAt: new Date().toISOString()
  };

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
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
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

function addToCart(product) {
  const existing = cartItems.get(product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cartItems.set(product.id, { product, qty: 1 });
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

function renderProduct(item, prepend = false) {
  const node = template.content.cloneNode(true);
  const card = node.querySelector(".product-card");
  const img = node.querySelector("img");
  const title = node.querySelector("h3");
  const details = node.querySelector(".details");
  const price = node.querySelector(".price");
  const addButton = node.querySelector(".add-btn");
  const deleteButton = node.querySelector(".delete-btn");

  img.src = item.img;
  img.alt = item.name;
  title.textContent = item.name;
  details.textContent = item.category ? `${item.category} - ${item.details}` : item.details;
  price.textContent = item.price;
  deleteButton.hidden = !isOwner();

  addButton.addEventListener("click", () => {
    playAddToCartAnimation(card, img);
    addToCart(item);
    addButton.textContent = "Added";
    addButton.disabled = true;

    setTimeout(() => {
      addButton.textContent = "Add to Cart";
      addButton.disabled = false;
    }, 650);
  });

  deleteButton.addEventListener("click", () => {
    if (!isOwner()) {
      openLogin();
      return;
    }

    const index = products.findIndex((product) => product.id === item.id);
    if (index !== -1) {
      products.splice(index, 1);
      saveProducts();
    }
    cartItems.delete(item.id);
    saveCart();
    updateCartUI();
    card.remove();
    updateProductsEmptyState();
    renderTopSells();
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
    empty.textContent = "No sales yet. Top products appear after checkout.";
    topSellsGrid.appendChild(empty);
    return;
  }

  for (const entry of ranked) {
    const card = document.createElement("article");
    card.className = "top-sell-card";

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
    ownerMessage.textContent = "Only owner can add products.";
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
    ownerMessage.textContent = "Select a category or add a new category.";
    return;
  }

  if (!imageUrl && !selectedFile) {
    ownerMessage.textContent = "Add an image URL or upload an image file.";
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
    price: numericPrice ? formatPrice(numericPrice) : "$0.00",
    category,
    details,
    img
  };

  products.unshift(item);
  saveProducts();
  renderProduct(item, true);
  renderTopSells();
  productsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  ownerForm.reset();
  renderOwnerCategoryOptions(category);
  if (newCategoryInput) {
    newCategoryInput.value = "";
  }
  ownerMessage.textContent = "Product added successfully.";
  applyAuthUI();
});

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

  saveSession(nextSession);
  await sendLoginToSheet(nextSession);

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
  }
});

updateCartUI();
renderCategories();
renderOwnerCategoryOptions();
syncPaymentMethodUI();
applyAuthUI();
updateProductsEmptyState();
renderTopSells();
setupCursorChain();
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
