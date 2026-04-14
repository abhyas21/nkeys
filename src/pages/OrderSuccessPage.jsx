import { BadgeCheck, PackageCheck, ShoppingBag } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const { orders, formatMoney, isOwner } = useStore();

  const order = orders.find((item) => item.id === orderId) || null;

  if (!order) {
    return (
      <section className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
          Order success
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Order not found</h1>
        <p className="mt-3 text-sm leading-7 text-stone-600">
          The success page expects an order created in this local session.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
        >
          Return to catalog
        </Link>
      </section>
    );
  }

  const createdAt = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(order.createdAt));

  return (
    <div className="space-y-8">
      <section
        className="page-reveal rounded-[2rem] border border-stone-200 bg-white p-5 text-center shadow-soft sm:p-8 lg:p-10"
        style={{ "--delay": "40ms" }}
      >
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          <PackageCheck size={28} />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
          Order success
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">
          Order placed successfully
        </h1>
        <p className="mt-4 text-base leading-8 text-stone-600">
          Your NKeys order has been saved locally with number{" "}
          <span className="font-semibold text-ink">{order.number}</span>.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-sand p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              Status
            </p>
            <p className="mt-2 text-xl font-semibold text-ink">{order.status}</p>
          </div>
          <div className="rounded-3xl bg-sand p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              Placed on
            </p>
            <p className="mt-2 text-xl font-semibold text-ink">{createdAt}</p>
          </div>
          <div className="rounded-3xl bg-sand p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              Total
            </p>
            <p className="mt-2 text-xl font-semibold text-ink">{formatMoney(order.total)}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
          >
            <ShoppingBag size={16} />
            Continue shopping
          </Link>
          {isOwner ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-6 py-3 text-sm font-semibold text-ink transition hover:border-stone-900"
            >
              <BadgeCheck size={16} />
              View in admin
            </Link>
          ) : null}
        </div>
      </section>

      <section
        className="page-reveal grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"
        style={{ "--delay": "140ms" }}
      >
        <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            Purchased items
          </p>
          <div className="mt-6 space-y-4">
            {order.items.map((item) => (
              <div
                key={item.lineId}
                className="flex items-center justify-between gap-4 rounded-3xl bg-stone-50 p-4"
              >
                <div>
                  <p className="font-semibold text-ink">{item.name}</p>
                  <p className="mt-1 text-sm text-stone-500">Qty {item.quantity}</p>
                  {item.customizationFileName ? (
                    <p className="mt-2 text-xs text-terracotta">
                      Artwork: {item.customizationFileName}
                    </p>
                  ) : null}
                </div>
                <p className="text-lg font-semibold text-ink">{formatMoney(item.total)}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            Delivery and payment
          </p>
          <div className="mt-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-ink">Shipping</h2>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                {order.shipping.fullName}
                <br />
                {order.shipping.email}
                <br />
                {order.shipping.phone}
                <br />
                {order.shipping.address}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-ink">Payment</h2>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                {order.payment.method}
                <br />
                {order.payment.reference}
              </p>
            </div>

            <div className="rounded-3xl bg-sand p-4">
              <div className="flex items-center justify-between text-sm text-stone-500">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotal ?? order.total)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-stone-500">
                <span>Delivery</span>
                <span>{formatMoney(order.shippingAmount ?? 0)}</span>
              </div>
              {order.discountAmount ? (
                <div className="mt-2 flex items-center justify-between text-sm text-emerald-700">
                  <span>
                    Discount{order.couponCode ? ` (${order.couponCode})` : ""}
                  </span>
                  <span>-{formatMoney(order.discountAmount)}</span>
                </div>
              ) : null}
              <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-3">
                <span className="font-semibold text-ink">Total</span>
                <span className="text-lg font-semibold text-ink">{formatMoney(order.total)}</span>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
