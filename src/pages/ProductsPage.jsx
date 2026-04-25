import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";
import { getProductReviewSummary } from "../lib/reviews";

export default function ProductsPage() {
  const { categoriesById, isOwner, products, publishedReviews, formatMoney } = useStore();

  return (
    <div className="space-y-8">
      <section
        className="page-reveal rounded-[2rem] border border-[#ddcdbc] bg-[#fffaf3] p-5 shadow-soft dark:border-[#3a2d25] dark:bg-[#211915] sm:p-8"
        style={{ "--delay": "40ms" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">
          Product listing
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">
          All stickers and keychains
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600 dark:text-stone-400">
          Browse every product in one clean grid. Open any item for the image carousel, price,
          description, and like button.
        </p>
      </section>

      <section className="page-reveal space-y-6" style={{ "--delay": "120ms" }}>
        <div className="stagger-grid grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.length ? (
            products.map((product) => {
              const summary = getProductReviewSummary(publishedReviews, product.id);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={categoriesById[product.categoryId]?.name}
                  averageRating={summary.average}
                  reviewCount={summary.total}
                  formatMoney={formatMoney}
                />
              );
            })
          ) : (
            <div className="rounded-[2rem] border border-dashed border-[#d4bda8] bg-[#f7ecde] p-8 text-sm leading-7 text-stone-600 dark:border-[#4a382e] dark:bg-[#2a201a] dark:text-stone-400 sm:col-span-2 xl:col-span-3">
              <p className="font-semibold text-ink">No products added yet.</p>
              <p className="mt-2">
                {isOwner
                  ? "Open the admin dashboard to add the first product."
                  : "Products will appear here as soon as the owner publishes them."}
              </p>
              {isOwner ? (
                <Link
                  to="/admin"
                  className="mt-4 inline-flex items-center rounded-full bg-terracotta px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b75f38]"
                >
                  Open admin dashboard
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
