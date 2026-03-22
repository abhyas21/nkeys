export const seedCategories = [
  { id: "cat-stickers", name: "Custom Stickers", slug: "custom-stickers" },
  { id: "cat-holo", name: "Holographic Stickers", slug: "holographic-stickers" },
  { id: "cat-keychains", name: "Classic Keychains", slug: "classic-keychains" },
  { id: "cat-photo", name: "Photo Keychains", slug: "photo-keychains" }
];

export const seedUsers = [];

export const seedProducts = [];

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
