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
        className="page-reveal grid gap-6 rounded-[2rem] border border-[#ddcdbc] bg-[#fffaf3] p-5 shadow-soft dark:border-[#3a2d25] dark:bg-[#211915] sm:gap-8 sm:p-8 lg:grid-cols-[1.02fr_0.98fr] lg:p-10"
        style={{ "--delay": "40ms" }}
      >
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center rounded-full bg-sand px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#765f51] dark:text-[#d8c7b7]">
            New launch
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold text-ink sm:text-4xl lg:text-5xl">
            Explore all products
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 dark:text-stone-400 sm:text-base sm:leading-8">
            Browse the full catalog in a clean product grid. Open any item to view its image
            carousel, price, description, and save it to your like list.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b75f38] sm:w-auto"
            >
              Browse catalog
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/about"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#ddcdbc] px-6 py-3 text-sm font-semibold text-ink transition hover:border-terracotta hover:text-terracotta dark:border-[#3a2d25] dark:text-white sm:w-auto"
            >
              About
            </Link>
            {isOwner ? (
              <Link
                to="/admin"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#ddcdbc] px-6 py-3 text-sm font-semibold text-ink transition hover:border-terracotta hover:text-terracotta dark:border-[#3a2d25] dark:text-white sm:w-auto"
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

          <article className="launch-card-3d rounded-[2rem] border border-[#ddcdbc] bg-[#f7ecde] p-4 shadow-soft dark:border-[#4a382e] dark:bg-[#2a201a] sm:p-5">
            {launchProduct ? (
              <>
                <div className="overflow-hidden rounded-[1.6rem] bg-[#fffaf3] dark:bg-[#211915]">
                  <img
                    src={launchProduct.gallery[0]}
                    alt={launchProduct.name}
                    className="aspect-[4/4.1] w-full object-cover"
                  />
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">
                      New launch
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-ink sm:text-2xl">
                      {launchProduct.name}
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#fffaf3] px-3 py-2 text-sm font-semibold text-ink shadow-sm dark:bg-[#211915] dark:text-white">
                    {formatMoney(launchProduct.price)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-400">
                  {launchProduct.shortDescription}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400">
                  <span className="rounded-full bg-[#fffaf3] px-3 py-2 dark:bg-[#211915]">
                    {categoriesById[launchProduct.categoryId]?.name}
                  </span>
                  <span className="rounded-full bg-[#fffaf3] px-3 py-2 dark:bg-[#211915]">
                    {launchProduct.gallery.length} photos
                  </span>
                </div>
              </>
            ) : (
              <div className="flex min-h-[25rem] flex-col justify-between rounded-[1.6rem] bg-[linear-gradient(145deg,#fffaf3,#efe1cf)] p-6 dark:bg-[linear-gradient(145deg,#2b211c,#211915)]">
                <div className="launch-placeholder-media rounded-[1.5rem]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">
                    New launch
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-ink">Fresh drop coming soon</h2>
                  <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-400">
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
            <div className="rounded-[2rem] border border-dashed border-[#d4bda8] bg-[#f7ecde] p-8 text-sm leading-7 text-stone-600 dark:border-[#4a382e] dark:bg-[#2a201a] dark:text-stone-400 md:col-span-2 xl:col-span-4">
              No products available yet. {isOwner
                ? "Use the admin dashboard to add the first product."
                : "Products will appear here as soon as the owner publishes them."}
            </div>
          )}
        </div>
      </section>

      <section
        className="page-reveal rounded-[2rem] border border-[#ddcdbc] bg-[#fffaf3] p-5 shadow-soft dark:border-[#3a2d25] dark:bg-[#211915] sm:p-8"
        style={{ "--delay": "180ms" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">
          About NKeys
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
          Made for customers who like clean browsing
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-stone-600 dark:text-stone-400">
          NKeys keeps the storefront simple: explore products, open details, save favorites, and
          browse launches without clutter.
        </p>
      </section>
    </div>
  );
}
