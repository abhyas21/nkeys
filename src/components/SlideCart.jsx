import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function SlideCart() {
  const {
    cartItems,
    cartOpen,
    cartSubtotal,
    cartCount,
    formatMoney,
    isOwner,
    removeFromCart,
    updateCartQuantity,
    setCartOpen
  } = useStore();

  if (!isOwner) {
    return null;
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-stone-950/40 transition-opacity duration-300 ${
          cartOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setCartOpen(false)}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l border-stone-200 bg-white shadow-soft transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              Cart
            </p>
            <h3 className="mt-1 text-xl font-semibold text-ink">
              {cartCount} item{cartCount === 1 ? "" : "s"}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="rounded-full border border-stone-200 p-2 text-stone-600 transition hover:border-stone-900 hover:text-stone-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="stagger-grid flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {cartItems.length ? (
            cartItems.map((line) => {
              const inventory = Number(line.product.inventory) || 0;
              const isUnavailable = inventory <= 0;
              const atMaxQuantity = inventory > 0 && line.quantity >= inventory;

              return (
                <article key={line.id} className="lift-card rounded-3xl border border-stone-200 p-4">
                  <div className="flex gap-4">
                    <img
                      src={line.product.gallery[0]}
                      alt={line.product.name}
                      className="motion-media h-24 w-24 rounded-2xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink">{line.product.name}</p>
                          <p className="mt-1 text-sm text-stone-500">
                            {formatMoney(line.product.price)}
                          </p>
                          {line.customizationFileName ? (
                            <p className="mt-1 truncate text-xs text-terracotta">
                              Artwork: {line.customizationFileName}
                            </p>
                          ) : null}
                          {isUnavailable ? (
                            <p className="mt-1 text-xs text-rose-600">Currently unavailable</p>
                          ) : atMaxQuantity ? (
                            <p className="mt-1 text-xs text-stone-500">
                              Max available quantity reached
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(line.id)}
                          className="rounded-full p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-stone-200">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(line.id, Math.max(1, line.quantity - 1))}
                            disabled={line.quantity <= 1}
                            className="p-2 text-stone-600 disabled:cursor-not-allowed disabled:text-stone-300"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="min-w-10 text-center text-sm font-semibold text-ink">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(line.id, line.quantity + 1)}
                            disabled={isUnavailable || atMaxQuantity}
                            className="p-2 text-stone-600 disabled:cursor-not-allowed disabled:text-stone-300"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <p className="font-semibold text-ink">{formatMoney(line.lineTotal)}</p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-10 text-center">
              <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                <ShoppingBag size={20} className="text-terracotta" />
              </span>
              <h4 className="mt-4 text-lg font-semibold text-ink">Your cart is empty</h4>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                Add stickers or keychains to start building your order.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-stone-200 px-6 py-5">
          <div className="mb-4 flex items-center justify-between text-sm text-stone-500">
            <span>Subtotal</span>
            <span className="text-lg font-semibold text-ink">{formatMoney(cartSubtotal)}</span>
          </div>
          <Link
            to="/checkout"
            onClick={() => setCartOpen(false)}
            className="inline-flex w-full items-center justify-center rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
          >
            Continue to checkout
          </Link>
        </div>
      </aside>
    </>
  );
}
