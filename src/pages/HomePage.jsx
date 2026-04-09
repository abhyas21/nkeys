import { ArrowRight, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";
import { getProductReviewSummary } from "../lib/reviews";

export default function HomePage() {
  const { categoriesById, featuredProducts, isOwner, products, publishedReviews, formatMoney } = useStore();
  const launchProduct = featuredProducts[0] || products[0] || null;

  return (
    <div className="space-y-8">
      <section
        className="page-reveal grid gap-6 rounded-[2rem] border border-stone-200 bg-white p-5 shadow-soft sm:gap-8 sm:p-8 lg:grid-cols-[1.02fr_0.98fr] lg:p-10"
        style={{ "--delay": "40ms" }}
      >
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center rounded-full bg-sand px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-600">
            New launch
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold text-ink sm:text-4xl lg:text-5xl">
            Explore all products
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base sm:leading-8">
            Browse the full catalog in a clean product grid. Open any item to view its image
            carousel, price, description, and save it to your like list.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 sm:w-auto"
            >
              Browse catalog
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/about"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-200 px-6 py-3 text-sm font-semibold text-ink transition hover:border-stone-900 sm:w-auto"
            >
              About
            </Link>
            {isOwner ? (
              <Link
                to="/admin"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-200 px-6 py-3 text-sm font-semibold text-ink transition hover:border-stone-900 sm:w-auto"
              >
                <BadgeCheck size={16} />
                Admin dashboard
              </Link>
            ) : null}
          </div>
        </div>

        <div className="page-reveal-right launch-showcase" style={{ "--delay": "140ms" }}>
          <div className="launch-orb launch-orb-a" />
          <div className="launch-orb launch-orb-b" />

          <article className="launch-card-3d rounded-[2rem] border border-stone-200 bg-stone-50 p-4 shadow-soft sm:p-5">
            {launchProduct ? (
              <>
                <div className="overflow-hidden rounded-[1.6rem] bg-white">
                  <img
                    src={launchProduct.gallery[0]}
                    alt={launchProduct.name}
                    className="aspect-[4/4.1] w-full object-cover"
                  />
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                      New launch
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-ink sm:text-2xl">
                      {launchProduct.name}
                    </h2>
                  </div>
                  <span className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-ink shadow-sm">
                    {formatMoney(launchProduct.price)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  {launchProduct.shortDescription}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-500">
                  <span className="rounded-full bg-white px-3 py-2">
                    {categoriesById[launchProduct.categoryId]?.name}
                  </span>
                  <span className="rounded-full bg-white px-3 py-2">
                    {launchProduct.gallery.length} photos
                  </span>
                </div>
              </>
            ) : (
              <div className="flex min-h-[25rem] flex-col justify-between rounded-[1.6rem] bg-[linear-gradient(145deg,#fff7ef,#f4ede3)] p-6">
                <div className="launch-placeholder-media rounded-[1.5rem]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                    New launch
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-ink">Fresh drop coming soon</h2>
                  <p className="mt-3 text-sm leading-7 text-stone-600">
                    Add your first product from the owner dashboard and it will appear here as the
                    highlighted launch card.
                  </p>
                </div>
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="page-reveal space-y-6" style={{ "--delay": "120ms" }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            Product grid
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">All products</h2>
        </div>

        <div className="stagger-grid grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
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
            <div className="rounded-[2rem] border border-dashed border-stone-300 bg-stone-50 p-8 text-sm leading-7 text-stone-600 md:col-span-2 xl:col-span-4">
              No products available yet. {isOwner
                ? "Use the admin dashboard to add the first product."
                : "Products will appear here as soon as the owner publishes them."}
            </div>
          )}
        </div>
      </section>

      <section
        className="page-reveal rounded-[2rem] border border-stone-200 bg-white p-5 shadow-soft sm:p-8"
        style={{ "--delay": "180ms" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
          About NKeys
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
          Made for customers who like clean browsing
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-stone-600">
          NKeys keeps the storefront simple: explore products, open details, save favorites, and
          browse launches without clutter.
        </p>
      </section>
    </div>
  );
}
