import { seedStore } from "../data/seed";

const STORE_KEY = "nkeys-react-store-v1";

export function readStore() {
  if (typeof window === "undefined") return { ...seedStore, products: [] };

  try {
    const data = window.localStorage.getItem(STORE_KEY);
    if (!data) return { ...seedStore, products: [] };
    const parsed = JSON.parse(data);
    if (parsed && Array.isArray(parsed.products)) {
      parsed.products = parsed.products.filter(
        (p) => !String(p.id).startsWith("product-") && p.slug !== "metal-tag-classic" && p.name !== "Metal Tag Classic"
      );
    }
    return parsed;
  } catch (error) {
    console.error("Failed to read local storage", error);
    return { ...seedStore, products: [] };
  }
}

export function writeStore(store) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error("Failed to write to local storage", error);
  }
}