import { ArrowRight, Heart } from "lucide-react";
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
  const { isLikedProduct, toggleLikedProduct } = useStore();
  const liked = isLikedProduct(product.id);

  return (
    <article className="product-depth-card group lift-card flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-soft">
      <button
        type="button"
        onClick={() => toggleLikedProduct(product.id)}
        className={`absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white/92 shadow-sm backdrop-blur transition ${
          liked
            ? "border-rose-200 text-rose-500"
            : "border-stone-200 text-stone-500 hover:border-stone-900 hover:text-rose-500"
        }`}
        aria-label={liked ? "Remove from like list" : "Add to like list"}
      >
        <Heart size={18} className={liked ? "fill-current" : ""} />
      </button>

      <Link to={`/products/${product.slug}`} className="block">
        <div className="aspect-[4/4.3] overflow-hidden bg-stone-100">
          <img
            src={product.gallery[0]}
            alt={product.name}
            className="motion-media h-full w-full object-cover"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            {categoryName}
          </p>
          <Link to={`/products/${product.slug}`} className="mt-2 block">
            <h3 className="font-sans text-xl font-semibold text-ink">{product.name}</h3>
          </Link>
        </div>

        <p className="text-sm leading-6 text-stone-600">{product.shortDescription}</p>

        <div className="mt-auto flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <RatingStars rating={averageRating} size={14} />
              <span className="text-sm font-medium text-stone-600">
                {averageRating.toFixed(1)} ({reviewCount})
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-2xl font-semibold text-ink">{formatMoney(product.price)}</span>
            </div>
          </div>

          <Link
            to={`/products/${product.slug}`}
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-ink transition duration-300 hover:-translate-y-0.5 hover:border-stone-900"
          >
            View
            <ArrowRight size={16} className="transition duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
