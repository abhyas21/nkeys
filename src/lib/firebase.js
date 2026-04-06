import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBxNtlE0_nPysIP6Xy4CwkMXtoA3593YUQ",
  authDomain: "nkeys-4ccd3.firebaseapp.com",
  projectId: "nkeys-4ccd3",
  storageBucket: "nkeys-4ccd3.firebasestorage.app",
  messagingSenderId: "860797639119",
  appId: "1:860797639119:web:2c7e703fcad30f2a609aba",
  measurementId: "G-C82TRXG6WV",
};

export const firebaseApp = initializeApp(firebaseConfig);

let analyticsInstance = null;

export async function initializeFirebaseAnalytics() {
  if (analyticsInstance || typeof window === "undefined") {
    return analyticsInstance;
  }

  const analyticsSupported = await isSupported().catch(() => false);
  if (!analyticsSupported) {
    return null;
  }

  analyticsInstance = getAnalytics(firebaseApp);
  return analyticsInstance;
}
