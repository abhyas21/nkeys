import { Heart } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";
import { getProductReviewSummary } from "../lib/reviews";

export default function LikesPage() {
  const { categoriesById, likedProducts, publishedReviews, formatMoney } = useStore();

  return (
    <div className="space-y-8">
      <section
        className="page-reveal rounded-[2rem] border border-stone-200 bg-white p-8 shadow-soft"
        style={{ "--delay": "40ms" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
          Like list
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-ink">Saved products</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
          Products you like appear here so you can come back to them quickly.
        </p>
      </section>

      <section className="page-reveal space-y-6" style={{ "--delay": "120ms" }}>
        <div className="stagger-grid grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {likedProducts.length ? (
            likedProducts.map((product) => {
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
              <div className="flex items-center gap-3 text-ink">
                <Heart size={18} className="text-rose-500" />
                <span className="font-semibold">No liked products yet</span>
              </div>
              <p className="mt-3">
                Tap the heart on any product card or product page to add it to this list.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
