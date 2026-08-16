import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";
import { updatePassword, signOut } from "../services/auth";
import { getUserOrders } from "../services/database";
import { ShoppingBag, MapPin, Settings, ShieldCheck, ChevronRight, Truck, Loader2, AlertCircle, LogOut } from "lucide-react";

export default function Profile() {
  const { user, profile, loading: authLoading, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") || "orders";

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // Redirect if user is not authenticated once auth check resolves
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Load user orders and profile data cleanly
  useEffect(() => {
    let isMounted = true;

    // Safety 2.5s timeout for profile data loading state
    const safetyTimer = setTimeout(() => {
      if (isMounted && loading) {
        setLoading(false);
      }
    }, 2500);

    async function loadUserData() {
      if (!user) {
        if (isMounted) setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const ordData = await getUserOrders(user);
        if (isMounted) {
          setOrders(ordData || []);
        }
      } catch (err) {
        console.error("Profile page data fetch error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
          clearTimeout(safetyTimer);
        }
      }
    }

    const refreshCustomerOrders = async () => {
      if (user && isMounted) {
        const data = await getUserOrders(user);
        if (isMounted) setOrders(data || []);
      }
    };

    if (!authLoading) {
      loadUserData();
    }

    window.addEventListener("orders-updated", refreshCustomerOrders);
    window.addEventListener("focus", refreshCustomerOrders);

    const channel = supabase
      .channel("customer-realtime-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        refreshCustomerOrders();
      })
      .subscribe();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      window.removeEventListener("orders-updated", refreshCustomerOrders);
      window.removeEventListener("focus", refreshCustomerOrders);
      supabase.removeChannel(channel);
    };
  }, [user, authLoading]);

  const handleLogout = async () => {
    await logout();
  };

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
    setMsg("");
    setError("");
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      await updatePassword(newPassword);
      setMsg("Password updated successfully!");
      setNewPassword("");
      setError("");
    } catch (err) {
      setError(err.message || "Failed to update password.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="animate-spin text-stone-600 dark:text-stone-300" size={32} />
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Loading Profile Details...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-[1800px] w-full mx-auto">
      {/* Sidebar Navigation */}
      <aside className="space-y-2">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-3xl mb-4 shadow-soft">
          <div className="w-12 h-12 bg-stone-950 text-white dark:bg-white dark:text-stone-955 rounded-full flex items-center justify-center font-bold text-lg mb-3">
            {(profile?.name || user?.email || "U").slice(0, 1).toUpperCase()}
          </div>
          <h2 className="font-bold text-base truncate text-stone-900 dark:text-white">{profile?.name || user?.email?.split("@")[0]}</h2>
          <p className="text-xs text-stone-500 truncate mt-0.5">{user?.email}</p>
        </div>

        <button
          onClick={() => handleTabChange("orders")}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-xs transition ${
            activeTab === "orders" ? "bg-stone-950 text-white dark:bg-white dark:text-stone-955 shadow-sm" : "bg-white border border-stone-200 hover:bg-stone-50 dark:bg-stone-900 dark:border-stone-800 text-stone-700 dark:text-stone-300"
          }`}
        >
          <span className="flex items-center gap-2">
            <ShoppingBag size={16} />
            <span>Orders History</span>
          </span>
          <ChevronRight size={14} />
        </button>

        <button
          onClick={() => handleTabChange("settings")}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-xs transition ${
            activeTab === "settings" ? "bg-stone-950 text-white dark:bg-white dark:text-stone-955 shadow-sm" : "bg-white border border-stone-200 hover:bg-stone-50 dark:bg-stone-900 dark:border-stone-800 text-stone-700 dark:text-stone-300"
          }`}
        >
          <span className="flex items-center gap-2">
            <Settings size={16} />
            <span>Security Settings</span>
          </span>
          <ChevronRight size={14} />
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-xs transition bg-white border border-stone-200 hover:bg-stone-100 dark:bg-stone-900 dark:border-stone-800 text-stone-700 dark:text-stone-300"
        >
          <span className="flex items-center gap-2">
            <LogOut size={16} />
            <span>Log Out</span>
          </span>
          <ChevronRight size={14} />
        </button>
      </aside>

      {/* Main Workspace */}
      <main className="md:col-span-3 space-y-6">
        {msg && (
          <div className="bg-stone-100 text-stone-950 dark:bg-stone-800 dark:text-stone-100 p-4 rounded-2xl text-xs font-semibold border border-stone-200 dark:border-stone-800">
            {msg}
          </div>
        )}

        {error && (
          <div className="bg-stone-100 text-stone-950 dark:bg-stone-850 dark:text-stone-100 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 border border-stone-200 dark:border-stone-800">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Tab 1: Orders History */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-stone-900 dark:text-white">Your Orders</h3>
            {orders.length === 0 ? (
              <div className="text-stone-500 py-16 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-3xl bg-white dark:bg-stone-900 space-y-3">
                <p>You haven't placed any orders yet.</p>
                <Link to="/products" className="inline-block bg-stone-950 text-white dark:bg-white dark:text-stone-950 px-5 py-2 rounded-full text-xs font-bold transition">
                  Explore Catalog
                </Link>
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-3xl space-y-4 shadow-soft"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-stone-100 dark:border-stone-800 pb-3 gap-2">
                    <div>
                      <p className="text-xs text-stone-500">Order ID: <span className="font-mono font-bold text-stone-900 dark:text-stone-200">{ord.id}</span></p>
                      <p className="text-xs text-stone-500 mt-0.5">Placed: {new Date(ord.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        ord.status === "Delivered" ? "bg-stone-950 text-white dark:bg-white dark:text-stone-955" : ord.status === "Cancelled" ? "bg-stone-100 text-stone-400 line-through dark:bg-stone-850 dark:text-stone-500" : "bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100"
                      }`}>
                        {ord.status}
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-stone-100 dark:divide-stone-800 space-y-2">
                    {ord.order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs py-2">
                        <div>
                          <p className="font-bold text-stone-900 dark:text-white">{item.product_name || "Keychain Item"}</p>
                          <p className="text-stone-400 mt-0.5">Quantity: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-stone-900 dark:text-white">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Order tracking indicator */}
                  <div className="border-t border-stone-100 dark:border-stone-800 pt-4 space-y-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                      <Truck size={14} /> Tracking Status
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-stone-400 font-bold uppercase">
                      <span className={ord.status !== "Cancelled" ? "text-stone-900 dark:text-white" : ""}>Pending</span>
                      <span className={["Confirmed", "Packed", "Shipped", "Delivered"].includes(ord.status) ? "text-stone-900 dark:text-white" : ""}>Confirmed</span>
                      <span className={["Packed", "Shipped", "Delivered"].includes(ord.status) ? "text-stone-900 dark:text-white" : ""}>Packed</span>
                      <span className={["Shipped", "Delivered"].includes(ord.status) ? "text-stone-900 dark:text-white" : ""}>Shipped</span>
                      <span className={ord.status === "Delivered" ? "text-stone-900 dark:text-white" : ""}>Delivered</span>
                    </div>
                    <div className="relative w-full h-1 bg-stone-150 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-stone-950 dark:bg-white transition-all duration-300"
                        style={{
                          width:
                            ord.status === "Pending" ? "15%" :
                            ord.status === "Confirmed" ? "35%" :
                            ord.status === "Packed" ? "60%" :
                            ord.status === "Shipped" ? "85%" :
                            ord.status === "Delivered" ? "100%" : "0%"
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 text-xs font-bold border-t border-stone-100 dark:border-stone-800">
                    <span>Total Amount</span>
                    <span>₹{ord.total_amount}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Security Settings */}
        {activeTab === "settings" && (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-3xl space-y-6 shadow-soft">
            <h3 className="font-bold text-lg flex items-center gap-2 text-stone-900 dark:text-white">
              <ShieldCheck /> Update Security Password
            </h3>

            <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-sm">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-2 text-stone-500">New Account Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs dark:border-stone-800 dark:bg-stone-850 outline-none focus:border-stone-400"
                />
              </div>

              <button type="submit" className="bg-stone-950 hover:bg-stone-900 text-white dark:bg-white dark:text-stone-955 font-bold px-6 py-2.5 rounded-full text-xs transition">
                Update Password
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
