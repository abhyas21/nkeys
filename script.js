let nextProductId = 1;

const SESSION_KEY = "nkeys_user_session";
const SHEET_FALLBACK_KEY = "nkeys_sheet_fallback";
const OWNER_EMAIL = "abhyas2006@gmail.com";
const SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzZvEO19bp-EnMHQoXwpb3TksTnrLaei8_YQ8F3rH8aaYSs9RCQw17_LbSfPhiKvygl/exec";

const products = [];

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
const ownerForm = document.getElementById("ownerForm");
const ownerMessage = document.getElementById("ownerMessage");
const ownerLockMessage = document.getElementById("ownerLockMessage");
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

const cartItems = new Map();
let session = readSession();
let pendingVerificationCode = "";
let pendingVerificationMethod = "";
let verifiedMethod = "";
let verifiedContact = "";

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.16 });

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
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

function applyAuthUI() {
  const loggedIn = isLoggedIn();
  loginBtn.hidden = loggedIn;
  logoutBtn.hidden = !loggedIn;

  if (loggedIn) {
    sessionUser.textContent = `${session.name} (${session.role})`;
  } else {
    sessionUser.textContent = "";
  }

  ownerForm.style.display = isOwner() ? "grid" : "none";
  ownerLockMessage.style.display = isOwner() ? "none" : "block";
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

function openCart() {
  cartDrawer.classList.add("open");
  cartBackdrop.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartBackdrop.setAttribute("aria-hidden", "false");
  document.body.classList.add("cart-open");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartBackdrop.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartBackdrop.setAttribute("aria-hidden", "true");
  document.body.classList.remove("cart-open");
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
    updateCartUI();
  });
  row.appendChild(plusBtn);

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "remove-btn";
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => {
    cartItems.delete(entry.product.id);
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

  const dropItem = document.createElement("div");
  dropItem.className = "cart-product-drop";
  dropItem.style.backgroundImage = `url("${sourceImage.src}")`;

  const sourceRect = sourceImage.getBoundingClientRect();
  const diagramWidth = Math.min(window.innerWidth * 0.86, 980);
  const floorY = Math.min(window.innerHeight - 360, sourceRect.bottom + 30);
  const cartStartX = window.innerWidth + 120;
  const cartEndX = -diagramWidth - 120;
  const cartY = Math.max(56, floorY);
  const itemStartX = sourceRect.left + sourceRect.width / 2 - 30;
  const itemStartY = sourceRect.top + sourceRect.height / 2 - 30;
  const cartPocketOffset = diagramWidth * 0.43;
  const desiredDropX = sourceRect.left + sourceRect.width * 0.45;
  const itemDropX = Math.min(
    window.innerWidth - 120,
    Math.max(40, desiredDropX)
  );
  const cartMidXForDrop = itemDropX - cartPocketOffset;
  const itemHoverY = cartY - 98;
  const itemEndY = cartY + 10;

  cartRunner.style.width = `${diagramWidth}px`;

  cartRunner.style.transform = `translate(${cartStartX}px, ${cartY}px)`;
  cartRunner.style.opacity = "0.95";
  cartRunner.style.transition = "transform 2.8s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 2.8s ease";

  dropItem.style.transform = `translate(${itemStartX}px, ${itemStartY}px) scale(1)`;
  dropItem.style.opacity = "0.95";
  dropItem.style.transition = "transform 0.75s ease-out, opacity 0.75s ease-out";

  layer.appendChild(cartRunner);
  layer.appendChild(dropItem);
  document.body.appendChild(layer);

  requestAnimationFrame(() => {
    cartRunner.style.transform = `translate(${cartMidXForDrop}px, ${cartY}px)`;
  });

  setTimeout(() => {
    dropItem.style.transform = `translate(${itemDropX}px, ${itemHoverY}px) scale(0.78)`;
  }, 700);

  setTimeout(() => {
    dropItem.style.transition = "transform 0.62s cubic-bezier(0.2, 0.7, 0.3, 1), opacity 0.62s ease";
    dropItem.style.transform = `translate(${itemDropX}px, ${itemEndY}px) scale(0.22)`;
    dropItem.style.opacity = "0.02";
  }, 1450);

  setTimeout(() => {
    cartRunner.style.transition = "transform 1.1s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 1.1s ease";
    cartRunner.style.transform = `translate(${cartEndX}px, ${cartY}px)`;
  }, 1750);

  setTimeout(() => {
    cartBtn.classList.remove("cart-bump");
    void cartBtn.offsetWidth;
    cartBtn.classList.add("cart-bump");
  }, 2550);

  setTimeout(() => {
    layer.remove();
  }, 3350);
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
  details.textContent = item.details;
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
    }
    cartItems.delete(item.id);
    updateCartUI();
    card.remove();
  });

  if (prepend) {
    grid.prepend(node);
  } else {
    grid.appendChild(node);
  }

  observer.observe(card);
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
    ownerMessage.textContent = "Only owner can add products. Login with owner email.";
    openLogin();
    return;
  }

  const formData = new FormData(ownerForm);
  const name = String(formData.get("productName") || "").trim();
  const rawPrice = String(formData.get("productPrice") || "").trim();
  const details = String(formData.get("productDetails") || "").trim();
  const imageUrl = String(formData.get("productImageUrl") || "").trim();
  const selectedFile = productImageFile.files && productImageFile.files[0];

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
    details,
    img
  };

  products.unshift(item);
  renderProduct(item, true);
  ownerForm.reset();
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

cartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);

checkoutBtn.addEventListener("click", () => {
  if (!cartItems.size) {
    return;
  }
  cartItems.clear();
  updateCartUI();
  closeCart();
  alert("Order placed successfully.");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
    closeLogin();
  }
});

updateCartUI();
applyAuthUI();
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
