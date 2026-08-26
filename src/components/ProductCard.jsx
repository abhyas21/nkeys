import { Heart, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { getProductImageUrl } from "../services/database";

export default function ProductCard({
  product,
  categoryName,
  formatMoney
}) {
  const { isLikedProduct, toggleLikedProduct } = useStore();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const liked = isLikedProduct(product?.id);
  const isOutOfStock = Number(product?.inventory ?? product?.stock ?? 0) <= 0;
  const hasSalePrice = Number(product?.compareAtPrice || 0) > Number(product?.price || 0);
  const discountPercent = hasSalePrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const targetLink = `/products/${product?.slug || product?.id}`;

  const handleCardClick = (e) => {
    navigate(targetLink);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isOutOfStock) return;
    addItem(product, 1);
    if (addToast) addToast(`Added ${product?.name || "Item"} to bag!`);
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleLikedProduct(product.id);
  };

  return (
    <article
      onClick={handleCardClick}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-soft hover:shadow-luxury transition-all duration-300 cursor-pointer"
    >
      <button
        type="button"
        onClick={handleWishlistToggle}
        className={`absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/90 shadow-sm backdrop-blur transition ${
          liked
            ? "border-rose-200 text-rose-500"
            : "border-stone-200 text-stone-400 hover:text-rose-500"
        }`}
        aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart size={18} className={liked ? "fill-current" : ""} />
      </button>

      <div className="relative aspect-square overflow-hidden bg-stone-100">
        <img
          src={getProductImageUrl(product?.image_url || product?.image || product?.gallery?.[0])}
          alt={product?.name || "Product"}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/hero-keychain.svg";
          }}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product?.featured ? (
            <span className="rounded-full bg-[#B08D57] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              New
            </span>
          ) : null}
          {hasSalePrice ? (
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              {discountPercent}% OFF
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#B08D57]">
            {categoryName || product?.categories?.name || "General"}
          </p>
          <h3 className="font-serif text-lg font-bold text-[#1A1918] group-hover:text-[#B08D57] transition-colors mt-1">
            {product?.name}
          </h3>
        </div>

        {product?.shortDescription && (
          <p className="text-xs leading-relaxed text-stone-500 line-clamp-2">{product.shortDescription}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2 border-t border-stone-100">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-[#1A1918]">
              {formatMoney ? formatMoney(product?.price) : `₹${product?.discount_price || product?.price}`}
            </span>
            {hasSalePrice && formatMoney ? (
              <span className="text-xs text-stone-400 line-through">
                {formatMoney(product.compareAtPrice)}
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#1A1918] active:bg-[#33302C] hover:bg-[#33302C] px-4 py-2 text-xs font-bold text-white transition shadow-sm disabled:bg-stone-300"
          >
            <ShoppingBag size={14} />
            <span>{isOutOfStock ? "Sold Out" : "Add"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
