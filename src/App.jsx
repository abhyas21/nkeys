import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import StartupAuth from "./components/StartupAuth";
import { useStore } from "./context/StoreContext";
import AddProductPage from "./pages/AddProductPage";
import AdminPage from "./pages/AdminPage";
import AboutPage from "./pages/AboutPage";
import CheckoutPage from "./pages/CheckoutPage";
import HomePage from "./pages/HomePage";
import LikesPage from "./pages/LikesPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import ProductPage from "./pages/ProductPage";
import ProductsPage from "./pages/ProductsPage";

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return null;
}

export default function App() {
  const { backendLabel, currentCustomer, isOwner, isStoreLoading } = useStore();
  const landingPage = <HomePage />;
  const checkoutPage = <CheckoutPage />;
  const successPage = <OrderSuccessPage />;
  const addProductPage = isOwner ? <AddProductPage /> : <Navigate to="/" replace />;
  const verifyPage = currentCustomer ? <Navigate to="/" replace /> : <StartupAuth />;

  useEffect(() => {
    window.__NKEYS_APP_MOUNTED__?.();
  }, []);

  if (isStoreLoading) {
    return (
      <div className="min-h-screen bg-stone-50 px-4 py-8 text-ink sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center">
          <section className="w-full rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              Syncing catalog
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-ink">Loading shared product data</h1>
            <p className="mt-4 text-sm leading-7 text-stone-600">
              NKeys is connecting to the {backendLabel.toLowerCase()} so the latest products and
              customer records are visible in this account too.
            </p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={landingPage} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/likes" element={<LikesPage />} />
          <Route path="/verify" element={verifyPage} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="/checkout" element={checkoutPage} />
          <Route path="/checkout/success/:orderId" element={successPage} />
          <Route
            path="/admin"
            element={isOwner ? <AdminPage /> : <Navigate to={currentCustomer ? "/" : "/verify"} replace />}
          />
          <Route path="/admin/products/new" element={addProductPage} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}
