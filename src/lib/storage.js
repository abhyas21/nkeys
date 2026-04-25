import { seedStore } from "../data/seed";

const STORE_KEY = "nkeys-react-store-v1";

export function readStore() {
  if (typeof window === "undefined") return seedStore;

  try {
    const data = window.localStorage.getItem(STORE_KEY);
    return data ? JSON.parse(data) : seedStore;
  } catch (error) {
    console.error("Failed to read local storage", error);
    return seedStore;
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