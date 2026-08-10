import { useEffect, Suspense, useState } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { isAdminEmail } from "./lib/auth";
import ErrorBoundary from "./components/ErrorBoundary";
import { Loader2 } from "lucide-react";

// Layouts
import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./layouts/AdminLayout";

// Customer Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import OrderSuccessPage from "./pages/OrderSuccessPage";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Admin Pages
import Dashboard from "./admin/Dashboard";
import ProductsManager from "./admin/ProductsManager";
import CategoriesManager from "./admin/CategoriesManager";
import OrdersManager from "./admin/OrdersManager";
import CustomersManager from "./admin/CustomersManager";
import SettingsManager from "./admin/SettingsManager";

function RouteFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 space-y-3">
      <Loader2 className="animate-spin text-stone-600 dark:text-stone-400" size={28} />
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Loading view...</p>
    </div>
  );
}

function CustomerRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [authTimedOut, setAuthTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAuthTimedOut(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading && !authTimedOut) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-stone-600 dark:text-stone-300" size={28} />
      </div>
    );
  }
  return user ? <Outlet /> : <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
}

function AdminRoute() {
  const { user, isAdmin, loading } = useAuth();
  const [authTimedOut, setAuthTimedOut] = useState(false);
  const demoAdmin = import.meta.env.VITE_DEMO_ADMIN === "true";

  useEffect(() => {
    const timer = setTimeout(() => setAuthTimedOut(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading && !authTimedOut) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-stone-600 dark:text-stone-300" size={28} />
      </div>
    );
  }

  const isAllowed = Boolean(user && isAdminEmail(user.email));
  return isAllowed ? <Outlet /> : <Navigate to="/" replace />;
}

export default function App() {
  useEffect(() => {
    window.__NKEYS_APP_MOUNTED__?.();
  }, []);

  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Customer Routes */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/shop" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            
            {/* Protected Customer Routes */}
            <Route element={<CustomerRoute />}>
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/products" element={<ProductsManager />} />
              <Route path="/admin/categories" element={<CategoriesManager />} />
              <Route path="/admin/orders" element={<OrdersManager />} />
              <Route path="/admin/customers" element={<CustomersManager />} />
              <Route path="/admin/settings" element={<SettingsManager />} />
            </Route>
          </Route>

          {/* Catch-all redirect to 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
