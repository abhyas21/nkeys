import { ArrowRight, Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import RatingStars from "./RatingStars";

export default function ProductCard({
  product,
  categoryName,
  averageRating = 0,
  reviewCount = 0,
  formatMoney
}) {
  const { addToCart, isLikedProduct, toggleLikedProduct } = useStore();
  const liked = isLikedProduct(product.id);
  const isOutOfStock = Number(product.inventory) <= 0;
  const hasSalePrice = Number(product.compareAtPrice) > Number(product.price);
  const discountPercent = hasSalePrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <article className="product-depth-card group lift-card flex h-full flex-col overflow-hidden rounded-3xl border border-[#ddcdbc] bg-[#fffaf3] shadow-soft dark:border-[#3a2d25] dark:bg-[#211915]">
      <button
        type="button"
        onClick={() => toggleLikedProduct(product.id)}
        className={`absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border bg-[#fffaf3]/92 shadow-sm backdrop-blur transition dark:bg-[#16110e]/90 dark:text-stone-400 sm:right-4 sm:top-4 sm:h-11 sm:w-11 ${liked
            ? "border-rose-200 text-rose-500 dark:border-rose-900"
            : "border-[#ddcdbc] text-stone-500 hover:border-terracotta hover:text-rose-500 dark:border-[#3a2d25] dark:hover:border-[#7b5b48]"
          }`}
        aria-label={liked ? "Remove from like list" : "Add to like list"}
      >
        <Heart size={18} className={liked ? "fill-current" : ""} />
      </button>

      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/4.3] overflow-hidden bg-[#f1e0cd] dark:bg-[#2a201a]">
          <img
            src={product.gallery[0]}
            alt={product.name}
            className="motion-media h-full w-full object-cover"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {product.featured ? (
              <span className="rounded-full bg-terracotta px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
                New
              </span>
            ) : null}
            {hasSalePrice ? (
              <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
                {discountPercent}% off
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">
            {categoryName}
          </p>
          <Link to={`/products/${product.slug}`} className="mt-2 block">
            <h3 className="font-sans text-lg font-semibold text-ink dark:text-white sm:text-xl">{product.name}</h3>
          </Link>
        </div>

        <p className="text-sm leading-6 text-stone-600 dark:text-stone-400">{product.shortDescription}</p>

        <div className="mt-auto flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <RatingStars rating={averageRating} size={14} />
              <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
                {averageRating.toFixed(1)} ({reviewCount})
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-xl font-semibold text-ink dark:text-white sm:text-2xl">
                {formatMoney(product.price)}
              </span>
              {hasSalePrice ? (
                <span className="text-sm font-semibold text-stone-400 line-through">
                  {formatMoney(product.compareAtPrice)}
                </span>
              ) : null}
            </div>
            <p className={`mt-2 text-xs font-semibold ${isOutOfStock ? "text-rose-600" : "text-moss dark:text-emerald-300"}`}>
              {isOutOfStock ? "Sold out" : `${product.inventory} in stock`}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() => addToCart({ productId: product.id, quantity: 1 })}
              disabled={isOutOfStock}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200 sm:w-auto"
            >
              <ShoppingBag size={16} />
              Add
            </button>
            <Link
              to={`/products/${product.slug}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#ddcdbc] px-4 py-2 text-sm font-semibold text-ink transition duration-300 hover:-translate-y-0.5 hover:border-terracotta hover:text-terracotta dark:border-[#3a2d25] dark:text-white dark:hover:border-[#7b5b48] sm:w-auto"
            >
              View
              <ArrowRight size={16} className="transition duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
