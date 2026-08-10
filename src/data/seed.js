export const seedCategories = [
  { id: "cat-stickers", name: "Custom Stickers", slug: "custom-stickers" },
  { id: "cat-holo", name: "Holographic Stickers", slug: "holographic-stickers" },
  { id: "cat-keychains", name: "Classic Keychains", slug: "classic-keychains" },
  { id: "cat-photo", name: "Photo Keychains", slug: "photo-keychains" }
];

export const seedUsers = [];

export const seedProducts = [
  {
    id: "product-metal-tag",
    slug: "metal-tag-classic",
    name: "Metal Tag Classic",
    type: "keychain",
    categoryId: "cat-keychains",
    price: 299,
    compareAtPrice: 399,
    shortDescription: "A polished metal keychain with clean initials and everyday durability.",
    description:
      "A premium metal tag keychain made for bags, bikes, lockers, and daily carry. Add initials, a short name, or a tiny date for a personal finish.",
    materials: ["Brushed metal", "Split ring", "Scratch-resistant finish"],
    turnaroundDays: "3-5 business days",
    uploadEnabled: false,
    featured: true,
    inventory: 18,
    syncState: "local-only",
    gallery: ["/hero-slide-metal-tag.svg", "/hero-keychain.svg"],
    specs: ["Custom initials", "Gift-ready finish", "Compact daily-carry size"]
  },
  {
    id: "product-acrylic-charm",
    slug: "acrylic-charm-pop",
    name: "Acrylic Charm Pop",
    type: "keychain",
    categoryId: "cat-photo",
    price: 249,
    compareAtPrice: 349,
    shortDescription: "Bright acrylic charm for photos, names, mascots, and mini art.",
    description:
      "A lightweight acrylic charm that brings color to keys, bags, and gifting sets. Upload a design or choose a simple name-based layout.",
    materials: ["Gloss acrylic", "Steel ring", "Printed insert"],
    turnaroundDays: "4-6 business days",
    uploadEnabled: true,
    featured: true,
    inventory: 24,
    syncState: "local-only",
    gallery: ["/hero-slide-acrylic-charm.svg", "/hero-keychain.svg"],
    specs: ["Photo-friendly surface", "Lightweight build", "Custom artwork supported"]
  },
  {
    id: "product-leather-loop",
    slug: "leather-loop-daily",
    name: "Leather Loop Daily",
    type: "keychain",
    categoryId: "cat-keychains",
    price: 349,
    compareAtPrice: 449,
    shortDescription: "Soft leather-style loop with minimal lettering and metal hardware.",
    description:
      "A clean loop keychain for customers who prefer a warmer, subtle look. Designed for names, dates, initials, and compact brand marks.",
    materials: ["Leather-style strap", "Metal clasp", "Debossed detail"],
    turnaroundDays: "3-5 business days",
    uploadEnabled: false,
    featured: false,
    inventory: 15,
    syncState: "local-only",
    gallery: ["/hero-slide-leather-loop.svg", "/hero-keychain.svg"],
    specs: ["Soft-touch loop", "Minimal custom text", "Strong clasp"]
  },
  {
    id: "product-couple-tag",
    slug: "couple-tag-set",
    name: "Couple Tag Set",
    type: "keychain",
    categoryId: "cat-keychains",
    price: 499,
    compareAtPrice: 649,
    shortDescription: "Matching custom keychains for couples, best friends, and gifting.",
    description:
      "A paired tag set with coordinated styling for anniversaries, birthdays, and small celebrations. Each tag can carry a name, initial, or date.",
    materials: ["Metal tags", "Matching rings", "Premium gift finish"],
    turnaroundDays: "4-6 business days",
    uploadEnabled: false,
    featured: false,
    inventory: 12,
    syncState: "local-only",
    gallery: ["/hero-slide-couple-tag.svg", "/hero-keychain.svg"],
    specs: ["Two-piece set", "Personalized names", "Gift-ready pairing"]
  },
  {
    id: "product-vinyl-sticker",
    slug: "custom-vinyl-sticker-pack",
    name: "Custom Vinyl Sticker Pack",
    type: "sticker",
    categoryId: "cat-stickers",
    price: 199,
    compareAtPrice: 249,
    shortDescription: "Durable custom stickers for laptops, bottles, packaging, and gifts.",
    description:
      "A clean vinyl sticker pack for artwork, initials, small logos, or event designs. Great for daily use and small-batch gifting.",
    materials: ["Vinyl print", "Gloss laminate", "Peel-ready backing"],
    turnaroundDays: "3-5 business days",
    uploadEnabled: true,
    featured: false,
    inventory: 40,
    syncState: "local-only",
    gallery: ["/hero-slide-acrylic-charm.svg", "/hero-slide-metal-tag.svg"],
    specs: ["Water-resistant finish", "Custom artwork upload", "Pack of 6"]
  },
  {
    id: "product-holo-sticker",
    slug: "holographic-sticker-drop",
    name: "Holographic Sticker Drop",
    type: "sticker",
    categoryId: "cat-holo",
    price: 229,
    compareAtPrice: 299,
    shortDescription: "Shiny holographic stickers with a premium color-shift finish.",
    description:
      "A small-batch holographic sticker set that catches light beautifully on laptops, cases, planners, and packaging.",
    materials: ["Holographic vinyl", "Gloss laminate", "Precision cut"],
    turnaroundDays: "4-6 business days",
    uploadEnabled: true,
    featured: false,
    inventory: 32,
    syncState: "local-only",
    gallery: ["/hero-slide-couple-tag.svg", "/hero-slide-acrylic-charm.svg"],
    specs: ["Color-shift effect", "Custom shape support", "Pack of 5"]
  }
];

export const seedReviews = [];

export const seedOrders = [];

export const seedStore = {
  categories: seedCategories,
  users: seedUsers,
  products: seedProducts,
  reviews: seedReviews,
  orders: seedOrders,
  cart: [],
  likedProductIds: [],
  helpfulVotes: [],
  session: null
};
