import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "../services/auth";
import ErrorBoundary from "../components/ErrorBoundary";
import { LayoutDashboard, Tag, Package, ShoppingCart, Users, LogOut, ArrowLeft, Settings } from "lucide-react";

export default function AdminLayout() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-stone-200 dark:border-stone-800 justify-between">
          <span className="font-bold text-lg text-stone-950 dark:text-stone-50">NKeys Admin</span>
          <Link to="/" className="text-stone-500 hover:text-stone-700 md:hidden flex items-center gap-1">
            <ArrowLeft size={16} />
            <span>Store</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 font-semibold text-sm">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 font-semibold text-sm">
            <Package size={18} />
            <span>Products</span>
          </Link>
          <Link to="/admin/categories" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 font-semibold text-sm">
            <Tag size={18} />
            <span>Categories</span>
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 font-semibold text-sm">
            <ShoppingCart size={18} />
            <span>Orders</span>
          </Link>
          <Link to="/admin/customers" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 font-semibold text-sm">
            <Users size={18} />
            <span>Customers</span>
          </Link>
          <Link to="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 font-semibold text-sm">
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-stone-50 dark:bg-stone-800">
            <div className="w-8 h-8 rounded-full bg-stone-950 text-white dark:bg-white dark:text-stone-950 flex items-center justify-center font-bold">
              {(profile?.name || "A").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs truncate">{profile?.name || "Admin"}</p>
              <p className="text-[10px] text-stone-500 truncate">{profile?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold text-sm transition"
          >
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="hidden md:flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Management Control Panel</h1>
            <Link to="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 font-semibold text-sm">
              <ArrowLeft size={16} />
              <span>Back to Storefront</span>
            </Link>
          </div>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
