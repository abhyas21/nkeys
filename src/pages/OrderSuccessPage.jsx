import { BadgeCheck, PackageCheck, ShoppingBag, Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getOrderById } from "../services/database";
import { useAuth } from "../context/AuthContext";

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const { isAdmin } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      setLoading(true);
      getOrderById(orderId)
        .then((data) => {
          if (data) {
            setOrder(data);
          }
        })
        .catch((err) => {
          console.error("Error fetching order confirmation:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="animate-spin text-stone-600 dark:text-stone-300" size={32} />
        <p className="text-sm text-stone-500 font-semibold uppercase tracking-wider">Loading Order Confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <section className="rounded-[2rem] border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-10 text-center shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
          Order success
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-900 dark:text-white">Order not found</h1>
        <p className="mt-3 text-sm leading-7 text-stone-500">
          We couldn't retrieve the confirmation for Order ID <span className="font-mono text-stone-900 dark:text-white font-bold">{orderId}</span>.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-950 text-white dark:bg-white dark:text-stone-950 px-6 py-3 text-sm font-semibold transition hover:bg-stone-850"
        >
          Return to catalog
        </Link>
      </section>
    );
  }

  const createdAt = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(order.created_at));

  const formatMoney = (val) => `₹${Number(val).toLocaleString("en-IN")}`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <section
        className="page-reveal rounded-[2rem] border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 text-center shadow-soft sm:p-8 lg:p-10"
      >
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white">
          <PackageCheck size={28} />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
          Order success
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-900 dark:text-white sm:text-4xl">
          Order placed successfully
        </h1>
        <p className="mt-4 text-base leading-8 text-stone-600 dark:text-stone-400">
          Your NKeys order has been saved with ID{" "}
          <span className="font-mono font-bold text-stone-900 dark:text-white">{order.id}</span>.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-stone-50 dark:bg-stone-850 p-5 border border-stone-100 dark:border-stone-800">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              Status
            </p>
            <p className="mt-2 text-xl font-semibold text-stone-900 dark:text-white">{order.status}</p>
          </div>
          <div className="rounded-3xl bg-stone-50 dark:bg-stone-850 p-5 border border-stone-100 dark:border-stone-800">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              Placed on
            </p>
            <p className="mt-2 text-xl font-semibold text-stone-900 dark:text-white">{createdAt}</p>
          </div>
          <div className="rounded-3xl bg-stone-50 dark:bg-stone-850 p-5 border border-stone-100 dark:border-stone-800">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              Total
            </p>
            <p className="mt-2 text-xl font-semibold text-stone-900 dark:text-white">{formatMoney(order.total_amount)}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full bg-stone-950 text-white dark:bg-white dark:text-stone-950 px-6 py-3 text-sm font-semibold transition hover:bg-stone-900"
          >
            <ShoppingBag size={16} />
            Continue shopping
          </Link>
          {isAdmin ? (
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-2 rounded-full border border-stone-200 dark:border-stone-800 px-6 py-3 text-sm font-semibold text-stone-900 dark:text-white hover:border-stone-900 dark:hover:border-white transition"
            >
              <BadgeCheck size={16} />
              View in admin
            </Link>
          ) : (
            <Link
              to="/profile?tab=orders"
              className="inline-flex items-center gap-2 rounded-full border border-stone-200 dark:border-stone-800 px-6 py-3 text-sm font-semibold text-stone-900 dark:text-white hover:border-stone-900 dark:hover:border-white transition"
            >
              <BadgeCheck size={16} />
              Track order
            </Link>
          )}
        </div>
      </section>

      <section
        className="page-reveal grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"
      >
        <article className="rounded-[2rem] border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            Purchased items
          </p>
          <div className="mt-6 space-y-4">
            {order.order_items?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-3xl bg-stone-50 dark:bg-stone-850 p-4 border border-stone-100 dark:border-stone-800"
              >
                <div>
                  <p className="font-semibold text-stone-900 dark:text-white">{item.product_name || "Keychain"}</p>
                  <p className="mt-1 text-sm text-stone-500">Qty {item.quantity}</p>
                </div>
                <p className="text-lg font-semibold text-stone-900 dark:text-white">{formatMoney(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            Delivery and payment
          </p>
          <div className="mt-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Shipping Address</h2>
              <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-400">
                <strong className="text-stone-900 dark:text-white">{order.full_name}</strong>
                <br />
                Email: {order.user_email}
                <br />
                Phone: {order.phone} {order.alt_phone ? `/ ${order.alt_phone}` : ""}
                <br />
                Address: {order.house_number ? `${order.house_number}, ` : ""}{order.street_1}, {order.street_2 ? `${order.street_2}, ` : ""}{order.city_village}, {order.district}, {order.state} - {order.postal_code}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Payment Method</h2>
              <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-400">
                Cash on Delivery (COD)
              </p>
            </div>

            <div className="rounded-3xl bg-stone-50 dark:bg-stone-850 p-4 border border-stone-100 dark:border-stone-800">
              <div className="flex items-center justify-between text-sm text-stone-500">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-stone-500">
                <span>Delivery Charge</span>
                <span>{formatMoney(order.delivery_charge || 60)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-stone-200 dark:border-stone-800 pt-3">
                <span className="font-semibold text-stone-900 dark:text-white">Total</span>
                <span className="text-lg font-semibold text-stone-900 dark:text-white">{formatMoney(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
