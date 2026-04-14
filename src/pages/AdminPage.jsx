import { ClipboardList, Package, PlusCircle, Users } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    backendLabel,
    currentCustomer,
    isOwner,
    ownerEmail,
    orders,
    products,
    sharedCatalogEnabled,
    syncStatusMessage,
    users,
    formatMoney
  } = useStore();
  const customerLogins = users.filter((user) => user.role !== "owner");
  const requestedView = searchParams.get("view");
  const activeView =
    requestedView === "orders" || requestedView === "logins" || requestedView === "products"
      ? requestedView
      : "products";

  const selectView = (view) => {
    const nextParams = new URLSearchParams(searchParams);

    if (view === "products") {
      nextParams.delete("view");
    } else {
      nextParams.set("view", view);
    }

    setSearchParams(nextParams, { replace: true });
  };

  const viewButtonClasses = (view) =>
    `inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${
      activeView === view
        ? "border-stone-900 bg-stone-900 text-white"
        : "border-stone-200 bg-white text-ink hover:border-stone-900"
    }`;

  if (!isOwner) {
    return (
      <section className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
          Admin dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Owner access only</h1>
        <p className="mt-3 text-sm leading-7 text-stone-600">
          Only the owner account ({ownerEmail}) can manage products. You are signed in as{" "}
          {currentCustomer?.email || "a customer account"}.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section
        className="page-reveal rounded-[2rem] border border-stone-200 bg-white p-8 shadow-soft"
        style={{ "--delay": "40ms" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              Admin dashboard
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-ink">
              Owner product management
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
              Add new products, upload multiple images, and keep the storefront updated for
              customers.
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-moss">
              Owner signed in as {currentCustomer?.email}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => selectView("products")}
              className={viewButtonClasses("products")}
            >
              <Package size={16} />
              Products
            </button>
            <button
              type="button"
              onClick={() => selectView("orders")}
              className={viewButtonClasses("orders")}
            >
              <ClipboardList size={16} />
              Orders
            </button>
            <button
              type="button"
              onClick={() => selectView("logins")}
              className={viewButtonClasses("logins")}
            >
              <Users size={16} />
              Logins
            </button>
            <Link
              to="/admin/products/new"
              className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
            >
              <PlusCircle size={16} />
              Add product
            </Link>
          </div>
        </div>

        {!sharedCatalogEnabled || syncStatusMessage ? (
          <div className="mt-6 rounded-3xl bg-sand p-5 text-sm leading-7 text-stone-700">
            <p className="font-semibold text-ink">Backend status</p>
            <p className="mt-2">
              {syncStatusMessage ||
                `${backendLabel} is not configured yet, so data is still limited to this browser until Supabase env vars and tables are set.`}
            </p>
          </div>
        ) : null}
      </section>

      {activeView === "products" ? (
        <section
          className="page-reveal rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft lg:p-8"
          style={{ "--delay": "120ms" }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Package size={16} className="text-terracotta" />
              Product list
            </div>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600">
              {products.length} products
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {products.length ? (
              products.map((product) => (
                <article
                  key={product.id}
                  className="rounded-3xl border border-stone-200 bg-stone-50 p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <img
                      src={product.gallery[0]}
                      alt={product.name}
                      className="h-24 w-24 rounded-2xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold text-ink">{product.name}</h2>
                        {product.syncState === "local-only" ? (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">
                            Local only
                          </span>
                        ) : null}
                        {product.featured ? (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">
                            New launch
                            </span>
                          ) : null}
                        </div>
                        <span className="text-lg font-semibold text-ink">
                          {formatMoney(product.price)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-stone-600">
                        {product.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-500">
                        <span className="rounded-full bg-white px-3 py-1">
                          {product.gallery.length} images
                        </span>
                        <span className="rounded-full bg-white px-3 py-1">
                          {product.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-8 text-sm leading-7 text-stone-600">
                No products added yet. Use the add product button to create the first listing.
              </div>
            )}
          </div>
        </section>
      ) : null}

      {activeView === "orders" ? (
        <section
          className="page-reveal rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft lg:p-8"
          style={{ "--delay": "120ms" }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ClipboardList size={16} className="text-terracotta" />
              Orders
            </div>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600">
              {orders.length} orders
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {orders.length ? (
              orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-3xl border border-stone-200 bg-stone-50 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-ink">{order.number}</p>
                      <p className="mt-1 text-sm text-stone-500">{order.status}</p>
                    </div>
                    <p className="text-lg font-semibold text-ink">{formatMoney(order.total)}</p>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                        Customer details
                      </p>
                      <p className="mt-3 text-sm leading-7 text-stone-600">
                        {order.shipping.fullName}
                        <br />
                        {order.shipping.phone}
                        <br />
                        {order.shipping.email}
                        <br />
                        {order.shipping.address}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                        Order items
                      </p>
                      <div className="mt-3 space-y-2 text-sm text-stone-600">
                        {order.items.map((item) => (
                          <p key={item.lineId}>
                            {item.name} x {item.quantity}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-8 text-sm leading-7 text-stone-600">
                No orders yet. When order data exists, the full customer and item details will
                appear here.
              </div>
            )}
          </div>
        </section>
      ) : null}

      {activeView === "logins" ? (
        <section
          className="page-reveal rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft lg:p-8"
          style={{ "--delay": "120ms" }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Users size={16} className="text-terracotta" />
              Customer logins
            </div>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600">
              {customerLogins.length} customers
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {customerLogins.length ? (
              customerLogins.map((user) => (
                <article
                  key={user.id}
                  className="rounded-3xl border border-stone-200 bg-stone-50 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-ink">{user.name}</p>
                      <p className="mt-1 text-sm text-stone-500">
                        {String(user.role || "customer").toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                        Name
                      </p>
                      <p className="mt-2 text-sm font-medium text-ink">{user.name}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                        Phone
                      </p>
                      <p className="mt-2 text-sm font-medium text-ink">{user.phone}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                        Email
                      </p>
                      <p className="mt-2 break-all text-sm font-medium text-ink">{user.email}</p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-8 text-sm leading-7 text-stone-600">
                No customer logins captured yet. Once a customer signs in with name, phone, and
                email, those details will appear here.
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
