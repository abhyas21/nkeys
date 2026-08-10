import { useEffect, useState } from "react";
import { getOrders, getProducts, getCustomersCount } from "../services/database";
import { DollarSign, ShoppingCart, Users, Package, Award } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    ordersCount: 0,
    productsCount: 0,
    customersCount: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const orders = await getOrders();
        const products = await getProducts();
        const customersCount = await getCustomersCount();

        // Calculate Revenue
        const totalRevenue = orders
          .filter((o) => o.payment_status === "Paid" || o.status === "Delivered")
          .reduce((sum, o) => sum + Number(o.total_amount), 0);

        setStats({
          revenue: totalRevenue,
          ordersCount: orders.length,
          productsCount: products.length,
          customersCount: customersCount
        });

        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-terracotta"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold">Analytics Overview</h2>
        <p className="text-xs text-stone-500 mt-1">Realtime performance metrics for NKeys Store</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-terracotta/10 text-terracotta rounded-2xl">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Total Sales</p>
            <h3 className="text-xl font-extrabold mt-1">₹{stats.revenue}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100 rounded-2xl">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Orders Count</p>
            <h3 className="text-xl font-extrabold mt-1">{stats.ordersCount}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100 rounded-2xl">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Products Catalog</p>
            <h3 className="text-xl font-extrabold mt-1">{stats.productsCount}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100 rounded-2xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Total Customers</p>
            <h3 className="text-xl font-extrabold mt-1">{stats.customersCount}</h3>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 space-y-4">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Award size={18} className="text-terracotta" /> Recent Shop Orders
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-xs font-bold uppercase text-stone-500">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer Email</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Total Amount</th>
                <th className="pb-3">Order Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="py-3 font-mono text-xs">{order.id}</td>
                  <td className="py-3">{order.profiles?.email || order.user_email || "Deleted User"}</td>
                  <td className="py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="py-3 font-semibold">₹{order.total_amount}</td>
                  <td className="py-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      order.status === "Delivered" ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900" : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
