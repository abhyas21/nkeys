import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";
import { getProductReviewSummary } from "../lib/reviews";

export default function ProductsPage() {
  const { categoriesById, isOwner, products, publishedReviews, formatMoney } = useStore();

  return (
    <div className="space-y-8">
      <section
        className="page-reveal rounded-[2rem] border border-stone-200 bg-white p-8 shadow-soft"
        style={{ "--delay": "40ms" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
          Product listing
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-ink">All stickers and keychains</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
          Browse every product in one clean grid. Open any item for the image carousel, price,
          description, and like button.
        </p>
      </section>

      <section className="page-reveal space-y-6" style={{ "--delay": "120ms" }}>
        <div className="stagger-grid grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
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
            <div className="rounded-[2rem] border border-dashed border-stone-300 bg-stone-50 p-8 text-sm leading-7 text-stone-600 md:col-span-2 2xl:col-span-3">
              <p className="font-semibold text-ink">No products added yet.</p>
              <p className="mt-2">
                {isOwner
                  ? "Open the admin dashboard to add the first product."
                  : "Products will appear here as soon as the owner publishes them."}
              </p>
              {isOwner ? (
                <Link
                  to="/admin"
                  className="mt-4 inline-flex items-center rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
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
