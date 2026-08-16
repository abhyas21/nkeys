import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { getOrders, updateOrderStatus } from "../services/database";
import { Mail, Phone, Calendar, Search, Loader2, Eye, X, CheckSquare } from "lucide-react";

export default function OrdersManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected Order for Modal inspection
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data || []);
    } catch (err) {
      console.error("Error loading admin orders:", err);
      setError("Failed to fetch orders from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    const handleSync = () => {
      loadOrders();
    };
    window.addEventListener("orders-updated", handleSync);

    // Listen for realtime database modifications
    const channel = supabase
      .channel("admin-realtime-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("orders-updated", handleSync);
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    const statusUpper = String(newStatus).toUpperCase();
    setMsg("");
    setError("");

    // 1. Optimistically update local array state so the select element immediately reflects the choice
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: statusUpper, order_status: statusUpper } : o
      )
    );

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, status: statusUpper, order_status: statusUpper }));
    }

    try {
      // 2. Persist to database
      await updateOrderStatus(orderId, statusUpper);
      setMsg(`Order status updated to ${statusUpper}.`);

      // 3. Dispatch event for other tabs/components
      window.dispatchEvent(new CustomEvent("orders-updated", { detail: { orderId, status: statusUpper } }));
    } catch (err) {
      console.error("[STATUS UPDATE ERROR]:", err);
      setError(`Failed to update status: ${err.message || "Database error"}`);

      // Revert on failure
      const fresh = await getOrders();
      setOrders(fresh);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.user_email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      String(ord.status || "").toUpperCase() === String(statusFilter).toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status) => {
    const s = String(status || "").toUpperCase();
    switch (s) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900";
      case "CONFIRMED":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-450 dark:border-blue-900";
      case "PACKED":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-450 dark:border-purple-900";
      case "SHIPPED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-450 dark:border-indigo-900";
      case "DELIVERED":
        return "bg-stone-900 text-white border-stone-900 dark:bg-white dark:text-stone-950 dark:border-white";
      case "CANCELLED":
        return "bg-stone-100 text-stone-400 line-through border-stone-200 dark:bg-stone-850 dark:text-stone-500 dark:border-stone-800";
      default:
        return "bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-850 dark:text-stone-400";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="animate-spin text-stone-600 dark:text-stone-300" size={32} />
        <p className="text-sm text-stone-500 font-semibold uppercase tracking-wider">Loading Orders Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1800px] w-full mx-auto">
      <div>
        <h2 className="text-xl font-bold">Orders Fulfillment</h2>
        <p className="text-xs text-stone-500 mt-1">Review live Supabase orders and manage fulfilment states</p>
      </div>

      {msg && (
        <div className="bg-stone-100 text-stone-950 dark:bg-stone-800 dark:text-stone-100 p-4 rounded-2xl text-xs font-semibold border border-stone-200 dark:border-stone-850">
          {msg}
        </div>
      )}

      {error && (
        <div className="bg-stone-200 text-stone-950 dark:bg-stone-850 dark:text-stone-50 p-4 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Search and Filters toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-3xl shadow-soft">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order ID, name, email..."
            className="w-full pl-9 pr-4 py-2 rounded-full border border-stone-200 bg-stone-50 text-xs dark:border-stone-800 dark:bg-stone-850 dark:text-stone-100 outline-none focus:border-stone-400"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-xs text-stone-900 dark:border-stone-800 dark:bg-stone-855 dark:text-stone-100 outline-none appearance-none pr-8 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-no-repeat bg-[position:right_1rem_center]"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PACKED">PACKED</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Orders Grid/Table Display */}
      {filteredOrders.length === 0 ? (
        <p className="text-stone-500 py-16 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-3xl bg-white dark:bg-stone-900">
          No orders matching filters found.
        </p>
      ) : (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2rem] overflow-hidden shadow-soft">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-100 dark:border-stone-800 text-stone-500 uppercase tracking-wider font-extrabold bg-stone-50 dark:bg-stone-855">
                  <th className="p-4 pl-6">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Delivery Address</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4 text-center">Fulfilment Status</th>
                  <th className="p-4 pr-6 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-850/30 transition">
                    <td className="p-4 pl-6 font-mono text-[10px] font-bold text-stone-900 dark:text-stone-150">
                      {ord.id.slice(0, 8)}...
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-stone-900 dark:text-white">{ord.full_name}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{ord.user_email}</div>
                    </td>
                    <td className="p-4 max-w-xs truncate text-stone-600 dark:text-stone-400">
                      {ord.house_number}, {ord.street_1}, {ord.city_village}, {ord.state}
                    </td>
                    <td className="p-4 font-bold text-stone-900 dark:text-white">
                      ₹{ord.total_amount}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center">
                        <select
                          value={(ord.status || ord.order_status || "PENDING").toUpperCase()}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className={`rounded-full border px-3 py-1.5 font-bold uppercase tracking-wider text-[10px] outline-none transition cursor-pointer ${getStatusClass(ord.status || ord.order_status)}`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PACKED">PACKED</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {String(ord.status || "").toUpperCase() !== "DELIVERED" && (
                          <button
                            onClick={() => handleStatusChange(ord.id, "DELIVERED")}
                            className="px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 hover:bg-emerald-100 transition text-[10px] font-bold flex items-center gap-1"
                            title="Mark as Delivered"
                          >
                            <CheckSquare size={12} /> Delivered
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-2 rounded-full border border-stone-200 dark:border-stone-800 hover:border-stone-400 text-stone-500 hover:text-stone-950 dark:hover:text-white transition"
                          title="View order details"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 divide-y divide-stone-150 dark:divide-stone-800 md:hidden">
            {filteredOrders.map((ord) => (
              <div key={ord.id} className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[9px] font-bold text-stone-400">ID: {ord.id.slice(0, 8)}...</span>
                    <h4 className="font-bold text-sm mt-0.5 text-stone-900 dark:text-white">{ord.full_name}</h4>
                  </div>
                  <span className="font-bold text-sm text-stone-900 dark:text-white">₹{ord.total_amount}</span>
                </div>

                <p className="text-[11px] text-stone-500 leading-relaxed">
                  {ord.house_number}, {ord.street_1}, {ord.city_village}, {ord.state} - {ord.postal_code}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 gap-2">
                  <select
                    value={ord.status?.toUpperCase() || "PENDING"}
                    onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                    className={`rounded-full border px-3 py-1 font-bold uppercase tracking-wider text-[10px] outline-none transition ${getStatusClass(ord.status)}`}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PACKED">PACKED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>

                  <button
                    onClick={() => setSelectedOrder(ord)}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition"
                  >
                    <Eye size={12} /> Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspect Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2rem] max-w-2xl w-full p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white transition"
            >
              <X size={16} />
            </button>

            <div className="overflow-y-auto pr-1 space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Inspect Order</span>
                <h3 className="font-mono font-bold text-sm text-stone-900 dark:text-white mt-1">ID: {selectedOrder.id}</h3>
                <p className="text-[10px] text-stone-400 mt-1 flex items-center gap-1">
                  <Calendar size={10} /> Placed: {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>

              {/* Order fulfilment controller */}
              <div className="bg-stone-50 dark:bg-stone-850 p-4 rounded-2xl flex items-center justify-between border border-stone-150 dark:border-stone-800">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Fulfilment Control</span>
                <select
                  value={selectedOrder.status?.toUpperCase() || "PENDING"}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className={`rounded-full border px-3 py-1.5 font-bold uppercase tracking-wider text-[10px] outline-none transition cursor-pointer ${getStatusClass(selectedOrder.status)}`}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PACKED">PACKED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              {/* Address Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-stone-50 dark:bg-stone-850/40 p-4 rounded-2xl border border-stone-100 dark:border-stone-800 space-y-2">
                  <h4 className="font-bold text-[10px] uppercase text-stone-400 tracking-wider">Customer Details</h4>
                  <p className="font-bold text-stone-900 dark:text-white">{selectedOrder.full_name}</p>
                  <p className="text-stone-500 flex items-center gap-1"><Mail size={12} /> {selectedOrder.user_email}</p>
                  <p className="text-stone-500 flex items-center gap-1"><Phone size={12} /> {selectedOrder.phone} {selectedOrder.alt_phone ? `/ ${selectedOrder.alt_phone}` : ""}</p>
                </div>

                <div className="bg-stone-50 dark:bg-stone-850/40 p-4 rounded-2xl border border-stone-100 dark:border-stone-800 space-y-2">
                  <h4 className="font-bold text-[10px] uppercase text-stone-400 tracking-wider">Delivery Destination</h4>
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                    {selectedOrder.house_number}, {selectedOrder.street_1}
                    {selectedOrder.street_2 ? `, ${selectedOrder.street_2}` : ""}
                    <br />
                    {selectedOrder.city_village}, {selectedOrder.district}
                    <br />
                    {selectedOrder.state} - {selectedOrder.postal_code}
                  </p>
                </div>
              </div>

              {/* Line Items list */}
              <div>
                <h4 className="font-bold text-[10px] uppercase text-stone-400 tracking-wider mb-3">Items Purchased</h4>
                <div className="border border-stone-150 dark:border-stone-800 rounded-2xl overflow-hidden divide-y divide-stone-150 dark:divide-stone-800">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-4 text-xs bg-white dark:bg-stone-900">
                      <div>
                        <p className="font-bold text-stone-900 dark:text-white">{item.product_name || "Keychain"}</p>
                        <p className="text-stone-400 mt-0.5">Quantity: {item.quantity} | Unit: ₹{item.price}</p>
                      </div>
                      <span className="font-bold text-stone-900 dark:text-white">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="bg-stone-50 dark:bg-stone-850 p-4 rounded-2xl border border-stone-150 dark:border-stone-800 space-y-2 text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Delivery Charge</span>
                  <span>₹{selectedOrder.delivery_charge || 60}</span>
                </div>
                <div className="flex justify-between font-bold text-stone-900 dark:text-white pt-2 border-t border-stone-200 dark:border-stone-800 text-sm">
                  <span>Grand Total</span>
                  <span>₹{selectedOrder.total_amount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
