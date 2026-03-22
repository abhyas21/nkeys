import {
  ArrowLeft,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Truck
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FileUploadField from "../components/FileUploadField";
import ProductCard from "../components/ProductCard";
import RatingStars from "../components/RatingStars";
import ReviewCard from "../components/ReviewCard";
import { useStore } from "../context/StoreContext";
import { getProductReviewSummary } from "../lib/reviews";

const reviewSortLabels = {
  newest: "Newest",
  highest: "Highest rated",
  lowest: "Lowest rated"
};

const initialReviewForm = {
  authorName: "",
  authorEmail: "",
  rating: 5,
  title: "",
  comment: ""
};

function readFilesAsDataUrls(files) {
  return Promise.all(
    Array.from(files).map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        })
    )
  );
}

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const {
    categoriesById,
    isOwner,
    products,
    publishedReviews,
    formatMoney,
    getProductBySlug,
    getProductReviews,
    isLikedProduct,
    addToCart,
    toggleLikedProduct,
    toggleHelpful,
    helpfulVotes,
    addReview
  } = useStore();
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [designFileName, setDesignFileName] = useState("");
  const [reviewSort, setReviewSort] = useState("newest");
  const [reviewForm, setReviewForm] = useState(initialReviewForm);
  const [reviewPhotos, setReviewPhotos] = useState([]);
  const [reviewPhotoNames, setReviewPhotoNames] = useState([]);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const heroImageRef = useRef(null);

  const product = getProductBySlug(slug);

  useEffect(() => {
    setSelectedImage(product?.gallery?.[0] || "");
    setQuantity(1);
    setDesignFileName("");
    setReviewSort("newest");
    setReviewFeedback("");
  }, [product?.id]);

  useEffect(() => {
    setReviewForm(initialReviewForm);
    setReviewPhotos([]);
    setReviewPhotoNames([]);
  }, [product?.id]);

  if (!product) {
    return (
      <section className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
          Product page
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Product not found</h1>
        <p className="mt-3 text-sm leading-7 text-stone-600">
          The product you requested is no longer available in the current catalog.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
        >
          <ArrowLeft size={16} />
          Back to catalog
        </Link>
      </section>
    );
  }

  const reviews = getProductReviews(product.id);
  const reviewSummary = getProductReviewSummary(publishedReviews, product.id);
  const isOutOfStock = product.inventory <= 0;
  const isReadOnlyCustomer = !isOwner;
  const liked = isLikedProduct(product.id);
  const maxQuantity = Math.max(1, product.inventory || 1);
  const activeImage = selectedImage || product.gallery[0];
  const activeImageIndex = Math.max(0, product.gallery.indexOf(activeImage));
  const reviewBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((review) => review.rating === star).length;
    return {
      star,
      count,
      percentage: reviewSummary.total ? (count / reviewSummary.total) * 100 : 0
    };
  });

  const sortedReviews = [...reviews].sort((left, right) => {
    if (reviewSort === "highest") {
      return right.rating - left.rating ||
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    }

    if (reviewSort === "lowest") {
      return left.rating - right.rating ||
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });

  const relatedProducts = products
    .filter(
      (item) =>
        item.id !== product.id &&
        (item.categoryId === product.categoryId || item.type === product.type)
    )
    .slice(0, 3);

  const showPreviousImage = () => {
    if (product.gallery.length <= 1) {
      return;
    }

    const previousIndex = activeImageIndex <= 0
      ? product.gallery.length - 1
      : activeImageIndex - 1;
    setSelectedImage(product.gallery[previousIndex]);
  };

  const showNextImage = () => {
    if (product.gallery.length <= 1) {
      return;
    }

    const nextIndex = activeImageIndex >= product.gallery.length - 1
      ? 0
      : activeImageIndex + 1;
    setSelectedImage(product.gallery[nextIndex]);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      return;
    }

    const originRect = heroImageRef.current?.getBoundingClientRect();

    addToCart({
      productId: product.id,
      quantity,
      customizationFileName: designFileName,
      animationOrigin: originRect
        ? {
          left: originRect.left,
          top: originRect.top,
          width: originRect.width,
          height: originRect.height
        }
        : null,
      animationImageSrc: selectedImage || product.gallery[0]
    });
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      return;
    }

    addToCart({
      productId: product.id,
      quantity,
      customizationFileName: designFileName,
      animateCart: false,
      openCart: false
    });
    navigate("/checkout");
  };

  const handleReviewPhotosChange = async (event) => {
    const files = Array.from(event.target.files || []);
    setReviewPhotoNames(files.map((file) => file.name));

    if (!files.length) {
      setReviewPhotos([]);
      return;
    }

    try {
      const photoUrls = await readFilesAsDataUrls(files);
      setReviewPhotos(photoUrls);
    } catch {
      setReviewPhotos([]);
      setReviewFeedback("Review photos could not be loaded. Try a smaller image.");
    }
  };

  const handleReviewSubmit = (event) => {
    event.preventDefault();
    addReview({
      productId: product.id,
      authorName: reviewForm.authorName.trim(),
      authorEmail: reviewForm.authorEmail.trim(),
      rating: Number(reviewForm.rating),
      title: reviewForm.title.trim(),
      comment: reviewForm.comment.trim(),
      photos: reviewPhotos
    });

    setReviewForm(initialReviewForm);
    setReviewPhotos([]);
    setReviewPhotoNames([]);
    setReviewFeedback(
      "Review submitted for moderation. Verified Purchase is applied automatically when the email matches a paid or fulfilled order for this product."
    );
  };

  return (
    <div className="space-y-10">
      <section
        className="page-reveal rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft lg:p-8"
        style={{ "--delay": "40ms" }}
      >
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-stone-500">
          <Link to="/products" className="font-semibold text-terracotta">
            Products
          </Link>
          <span>/</span>
          <span>{categoriesById[product.categoryId]?.name}</span>
          <span>/</span>
          <span className="text-ink">{product.name}</span>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div ref={heroImageRef} className="relative overflow-hidden rounded-[2rem] bg-sand">
              <img
                src={activeImage}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
              {product.gallery.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={showPreviousImage}
                    className="absolute left-4 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full bg-white/92 p-3 text-ink shadow-sm transition hover:bg-white"
                    aria-label="Show previous product image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={showNextImage}
                    className="absolute right-4 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full bg-white/92 p-3 text-ink shadow-sm transition hover:bg-white"
                    aria-label="Show next product image"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-stone-950/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                    {activeImageIndex + 1} / {product.gallery.length}
                  </div>
                </>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {product.gallery.map((image, index) => (
                <button
                  key={`${product.id}-gallery-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`overflow-hidden rounded-2xl border transition ${
                    selectedImage === image
                      ? "border-stone-900 ring-2 ring-stone-900/10"
                      : "border-stone-200 hover:border-stone-400"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-sand px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                  {categoriesById[product.categoryId]?.name}
                </span>
                {product.featured ? (
                  <span className="rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                    Featured
                  </span>
                ) : null}
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-semibold text-ink">{product.name}</h1>
                </div>
                <button
                  type="button"
                  onClick={() => toggleLikedProduct(product.id)}
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-full border bg-white transition ${
                    liked
                      ? "border-rose-200 text-rose-500"
                      : "border-stone-200 text-stone-500 hover:border-stone-900 hover:text-rose-500"
                  }`}
                  aria-label={liked ? "Remove from like list" : "Add to like list"}
                >
                  <Heart size={18} className={liked ? "fill-current" : ""} />
                </button>
              </div>
              <div>
                <p className="mt-3 text-base leading-8 text-stone-600">{product.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <RatingStars rating={reviewSummary.average} />
                  <span className="text-sm font-semibold text-ink">
                    {reviewSummary.average.toFixed(1)}/5
                  </span>
                </div>
                <span className="text-sm text-stone-500">{reviewSummary.total} reviews</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                  <ShieldCheck size={16} />
                  Verified review system enabled
                </span>
              </div>

              <div className="flex flex-wrap items-end gap-4">
                <span className="text-4xl font-semibold text-ink">{formatMoney(product.price)}</span>
                {product.compareAtPrice ? (
                  <span className="pb-1 text-lg text-stone-400 line-through">
                    {formatMoney(product.compareAtPrice)}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-sand p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Clock3 size={16} className="text-terracotta" />
                  Turnaround
                </div>
                <p className="mt-2 text-sm leading-7 text-stone-600">{product.turnaroundDays}</p>
              </div>
              <div className="rounded-3xl bg-sand p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Truck size={16} className="text-terracotta" />
                  Inventory
                </div>
                <p className="mt-2 text-sm leading-7 text-stone-600">
                  {product.inventory} units ready for the next batch.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-stone-200 p-6">
              {isReadOnlyCustomer ? (
                <div className="rounded-3xl bg-stone-50 p-5">
                  <p className="text-sm font-semibold text-ink">View-only customer access</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600">
                    Customers can browse product images, descriptions, materials, and reviews.
                    Purchase actions and product management are reserved for the owner account.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-ink">Quantity</p>
                      <p className="text-sm text-stone-500">
                        {isOutOfStock
                          ? "Currently unavailable."
                          : `${product.inventory} units available in the current batch.`}
                      </p>
                    </div>
                    <div className="inline-flex items-center rounded-full border border-stone-200">
                      <button
                        type="button"
                        onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                        disabled={isOutOfStock || quantity <= 1}
                        className="p-3 text-stone-600 disabled:cursor-not-allowed disabled:text-stone-300"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="min-w-12 text-center text-base font-semibold text-ink">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
                        disabled={isOutOfStock || quantity >= maxQuantity}
                        className="p-3 text-stone-600 disabled:cursor-not-allowed disabled:text-stone-300"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {product.uploadEnabled ? (
                    <div className="mt-5">
                      <FileUploadField
                        fileName={designFileName}
                        onChange={(file) => setDesignFileName(file?.name || "")}
                        accept=".png,.jpg,.jpeg,.pdf,.svg"
                      />
                      <p className="mt-3 text-xs leading-6 text-stone-500">
                        Upload is optional in this frontend demo. The selected file name is attached to the cart line item.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl bg-stone-50 p-4 text-sm leading-7 text-stone-600">
                      This item ships with built-in engraving or finishing options and does not require an artwork upload.
                    </div>
                  )}

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className="inline-flex flex-1 items-center justify-center rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
                    >
                      {isOutOfStock ? "Sold out" : "Add to cart"}
                    </button>
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      disabled={isOutOfStock}
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-stone-200 px-6 py-3 text-sm font-semibold text-ink transition hover:border-stone-900 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400"
                    >
                      Buy now
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-stone-200 p-5">
                <h2 className="text-lg font-semibold text-ink">Highlights</h2>
                <ul className="mt-4 space-y-3 text-sm text-stone-600">
                  {product.specs.map((spec) => (
                    <li key={spec} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-terracotta" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-stone-200 p-5">
                <h2 className="text-lg font-semibold text-ink">Materials</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.materials.map((material) => (
                    <span
                      key={material}
                      className="rounded-full bg-sand px-4 py-2 text-sm font-medium text-stone-700"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="page-reveal grid gap-8 xl:grid-cols-[0.72fr_1.28fr]"
        style={{ "--delay": "140ms" }}
      >
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            All reviews
          </p>
          <div className="mt-4 flex items-end gap-4">
            <div>
              <p className="text-4xl font-semibold text-ink">{reviewSummary.average.toFixed(1)}</p>
              <p className="text-sm text-stone-500">Average star rating</p>
            </div>
            <div className="pb-1">
              <RatingStars rating={reviewSummary.average} />
              <p className="mt-2 text-sm text-stone-500">{reviewSummary.total} total reviews</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {reviewBreakdown.map((row) => (
              <div key={row.star} className="grid grid-cols-[56px_1fr_40px] items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1 font-medium text-stone-600">
                  {row.star}
                  <Star size={14} className="fill-gold text-gold" />
                </span>
                <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-terracotta"
                    style={{ width: `${row.percentage}%` }}
                  />
                </div>
                <span className="text-right text-stone-500">{row.count}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl bg-sand p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <BadgeCheck size={16} className="text-moss" />
              Review system features
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-stone-600">
              <li>Verified Purchase badges are linked to paid or fulfilled orders by email and product.</li>
              <li>
                {isReadOnlyCustomer
                  ? "Customers can browse reviews and product media in read-only mode."
                  : "Owner mode can submit photos and helpful votes directly from the product page."}
              </li>
              <li>New submissions stay pending until they are published from the admin dashboard.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                  Review feed
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-ink">
                  Customer feedback for {product.name}
                </h2>
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">Sort reviews</span>
                <select
                  value={reviewSort}
                  onChange={(event) => setReviewSort(event.target.value)}
                  className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
                >
                  {Object.entries(reviewSortLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6 space-y-4">
              {sortedReviews.length ? (
                sortedReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onHelpful={isReadOnlyCustomer ? null : toggleHelpful}
                    hasVoted={helpfulVotes.includes(review.id)}
                  />
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-sm text-stone-500">
                  No published reviews yet for this product.
                </div>
              )}
            </div>
          </div>

          {isReadOnlyCustomer ? (
            <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                Customer access
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-ink">Browsing only</h2>
              <p className="mt-4 text-sm leading-7 text-stone-600">
                Customers can only view product information in this build. Product creation and
                other actions stay with the owner account.
              </p>
            </section>
          ) : (
            <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                Write a review
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-ink">
                Submit your own photos and rating
              </h2>
              <form className="mt-6 space-y-5" onSubmit={handleReviewSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-ink">Name</span>
                    <input
                      required
                      value={reviewForm.authorName}
                      onChange={(event) =>
                        setReviewForm((current) => ({ ...current, authorName: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-ink">Email</span>
                    <input
                      required
                      type="email"
                      value={reviewForm.authorEmail}
                      onChange={(event) =>
                        setReviewForm((current) => ({ ...current, authorEmail: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-[200px_1fr]">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-ink">Rating</span>
                    <select
                      value={reviewForm.rating}
                      onChange={(event) =>
                        setReviewForm((current) => ({
                          ...current,
                          rating: Number(event.target.value)
                        }))
                      }
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value} star{value === 1 ? "" : "s"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-ink">Review title</span>
                    <input
                      required
                      value={reviewForm.title}
                      onChange={(event) =>
                        setReviewForm((current) => ({ ...current, title: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-ink">Review</span>
                  <textarea
                    required
                    rows={5}
                    value={reviewForm.comment}
                    onChange={(event) =>
                      setReviewForm((current) => ({ ...current, comment: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
                  />
                </label>

                <label className="block rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4">
                  <span className="mb-2 block text-sm font-semibold text-ink">Review photos</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleReviewPhotosChange}
                    className="block w-full text-sm text-stone-500 file:mr-4 file:rounded-full file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                  />
                  <p className="mt-3 text-xs leading-6 text-stone-500">
                    Upload one or more customer photos to show inside the review gallery.
                  </p>
                  {reviewPhotoNames.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {reviewPhotoNames.map((name) => (
                        <span
                          key={name}
                          className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </label>

                {reviewFeedback ? (
                  <p className="rounded-2xl bg-sand px-4 py-3 text-sm text-stone-600">
                    {reviewFeedback}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
                >
                  Submit review
                </button>
              </form>
            </section>
          )}
        </div>
      </section>

      {relatedProducts.length ? (
        <section className="page-reveal space-y-6" style={{ "--delay": "220ms" }}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                Related products
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-ink">More from the same line</h2>
            </div>
          </div>

          <div className="stagger-grid grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedProducts.map((item) => {
              const summary = getProductReviewSummary(publishedReviews, item.id);
              return (
                <ProductCard
                  key={item.id}
                  product={item}
                  categoryName={categoriesById[item.categoryId]?.name}
                  averageRating={summary.average}
                  reviewCount={summary.total}
                  formatMoney={formatMoney}
                />
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
