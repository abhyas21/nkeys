import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProducts, getProductImages, toggleWishlist, getWishlist, getProductImageUrl } from "../services/database";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { Heart, ShoppingBag, ArrowLeft, Tag, Truck, ShieldCheck, Star, MessageSquare } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { addToast } = useToast();
  
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState("");
  const [isWish, setIsWish] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Variant States
  const [selectedColor, setSelectedColor] = useState("Silver");
  const [selectedSize, setSelectedSize] = useState("Standard");

  // Tab State
  const [activeTab, setActiveTab] = useState("description");

  // Local Review State
  const [localReviews, setLocalReviews] = useState([
    { id: 1, user: "Abhyas", rating: 5, comment: "Incredible engraving quality, feels premium and solid!", date: "2026-08-01" },
    { id: 2, user: "Nikhita", rating: 4, comment: "Looks great on my car keys, slight delay in shipping but worth it.", date: "2026-07-28" }
  ]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);

  useEffect(() => {
    async function loadProductData() {
      try {
        const prodData = await getProducts();
        const found = prodData.find((p) => p.id === id);
        if (found) {
          setProduct(found);
          setActiveImage(found.image_url);
          const gallery = await getProductImages(found.id);
          setImages(gallery);

          if (user) {
            const wish = await getWishlist(user.id);
            setIsWish(wish.some((w) => w.product_id === found.id));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProductData();
  }, [id, user]);

  const handleWishlist = async () => {
    if (!user) {
      addToast("Please login to wishlist products", "error");
      return;
    }
    const wishId = `wish-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const res = await toggleWishlist({ id: wishId, user_id: user.id, product_id: product.id });
    setIsWish(res.added);
    addToast(res.added ? "Added to wishlist!" : "Removed from wishlist");
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      addToast("Review comment cannot be empty", "error");
      return;
    }
    const review = {
      id: Date.now(),
      user: user?.name || "Guest User",
      rating: newRating,
      comment: newComment,
      date: new Date().toISOString().split("T")[0]
    };
    setLocalReviews((prev) => [review, ...prev]);
    setNewComment("");
    addToast("Review submitted successfully!");
  };

  if (loading) {
    return (
      <div className="max-w-[1800px] w-full mx-auto p-4 space-y-12 animate-pulse">
        <div className="h-6 w-32 bg-stone-200 dark:bg-stone-900 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="aspect-square bg-stone-200 dark:bg-stone-900 rounded-3xl lg:col-span-5" />
          <div className="space-y-4">
            <div className="h-8 w-64 bg-stone-200 dark:bg-stone-900 rounded" />
            <div className="h-4 w-32 bg-stone-200 dark:bg-stone-900 rounded" />
            <div className="h-24 w-full bg-stone-200 dark:bg-stone-900 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold">Product not found.</h2>
        <Link to="/products" className="text-stone-500 hover:text-stone-950 mt-2 inline-block underline">Back to Catalog</Link>
      </div>
    );
  }

  const isOutOfStock = ((product.stock_d || 0) + (product.stock_k || 0)) <= 0;

  return (
    <div className="space-y-8 animate-fade-in max-w-[1800px] w-full mx-auto">
      <div className="flex items-center gap-2">
        <Link to="/products" className="text-stone-500 hover:text-stone-700 flex items-center gap-1 text-sm font-semibold">
          <ArrowLeft size={16} />
          <span>Back to shop</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16">
        {/* Images Gallery with Hover Zoom */}
        <div className="space-y-4 lg:col-span-6 xl:col-span-5">
          <div className="relative aspect-square bg-stone-100 dark:bg-stone-850 rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 group">
            <img
              src={getProductImageUrl(activeImage)}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
            />
          </div>
          {images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveImage(product.image_url)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                  activeImage === product.image_url ? "border-stone-950 dark:border-white" : "border-transparent"
                }`}
              >
                <img src={getProductImageUrl(product.image_url)} alt="" className="w-full h-full object-cover" />
              </button>
              {images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.image_url)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    activeImage === img.image_url ? "border-stone-955 dark:border-white" : "border-transparent"
                  }`}
                >
                  <img src={getProductImageUrl(img.image_url)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Configs / Buy Path */}
        <div className="flex flex-col justify-between space-y-6 lg:col-span-6 xl:col-span-7">
          <div className="space-y-4">
            <span className="text-xs text-stone-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <Tag size={12} /> {product.categories?.name}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 dark:text-stone-50">{product.name}</h1>
            
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold">
                ₹{product.discount_price || product.price}
              </span>
              {product.discount_price && (
                <span className="text-sm text-stone-400 line-through">₹{product.price}</span>
              )}
            </div>

            <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">{product.description}</p>
            
            {/* Color variants selector */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Keychain Ring Hardware</span>
              <div className="flex gap-2">
                {["Silver", "Gold", "Black Matte"].map((col) => (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    className={`px-4 py-2 rounded-full border text-xs font-semibold tracking-wide transition ${
                      selectedColor === col
                        ? "border-stone-950 bg-stone-950 text-white dark:border-white dark:bg-white dark:text-stone-950"
                        : "border-stone-200 text-stone-600 dark:border-stone-800 dark:text-stone-400"
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Size variants selector */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Size Profile</span>
              <div className="flex gap-2">
                {["Standard", "Large (+₹50)"].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-4 py-2 rounded-full border text-xs font-semibold tracking-wide transition ${
                      selectedSize === sz
                        ? "border-stone-950 bg-stone-950 text-white dark:border-white dark:bg-white dark:text-stone-950"
                        : "border-stone-200 text-stone-600 dark:border-stone-800 dark:text-stone-400"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Summary / Actions */}
          <div className="space-y-4 border-t border-stone-200 dark:border-stone-800 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-600 dark:text-stone-400">Warehouse availability</span>
              <span className="text-xs font-bold uppercase tracking-wider">
                {isOutOfStock ? "Out of Stock" : `Delhi: ${product.stock_d || 0} | Kolkata: ${product.stock_k || 0}`}
              </span>
            </div>

            {!isOutOfStock && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-stone-600 dark:text-stone-400">Quantity</span>
                <div className="flex items-center gap-3 border border-stone-200 dark:border-stone-700 rounded-full px-3 py-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="font-bold text-sm">-</button>
                  <span className="font-bold text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min((product.stock_d || 0) + (product.stock_k || 0), quantity + 1))} className="font-bold text-sm">+</button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {user ? (
                <button
                  onClick={() => {
                    addItem(product.id, quantity);
                    addToast(`Added ${quantity} ${product.name} to cart!`);
                  }}
                  disabled={isOutOfStock}
                  className="flex-1 bg-stone-950 hover:bg-stone-900 text-white dark:bg-white dark:text-stone-950 font-bold py-3 rounded-full flex items-center justify-center gap-2 transition disabled:bg-stone-300 text-xs"
                >
                  <ShoppingBag size={14} />
                  <span>Add to Bag</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex-1 bg-stone-955 hover:bg-stone-900 text-white font-bold py-3 rounded-full text-center transition text-xs"
                >
                  Login to Buy
                </Link>
              )}
              
              {user && (
                <button
                  onClick={handleWishlist}
                  className={`p-3 rounded-full border transition ${
                    isWish
                      ? "border-stone-950 bg-stone-100 text-stone-950 dark:border-white dark:bg-stone-850 dark:text-white"
                      : "border-stone-200 text-stone-400 hover:text-stone-950 dark:hover:text-stone-100"
                  }`}
                >
                  <Heart size={18} className={isWish ? "fill-current" : ""} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <section className="border-t border-stone-200 dark:border-stone-850 pt-8 space-y-6">
        <div className="flex border-b border-stone-150 dark:border-stone-800 pb-2 gap-6">
          {["description", "specifications", "reviews"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition ${
                activeTab === t ? "border-stone-950 text-stone-950 dark:border-white dark:text-white" : "border-transparent text-stone-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Panel contents */}
        {activeTab === "description" && (
          <div className="text-xs text-stone-500 leading-relaxed max-w-2xl space-y-2">
            <p>Our keychains undergo a 4-step detailing process: precision cutting, surface coating, micro-fine detailing, and double finishing checks. Ideal for keys, backpacks, luggage identifiers, and bespoke gift arrangements.</p>
          </div>
        )}

        {activeTab === "specifications" && (
          <div className="max-w-md text-xs space-y-3">
            <div className="flex justify-between border-b border-stone-100 pb-2">
              <span className="text-stone-400 font-semibold uppercase tracking-wider">Material</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">Stainless Steel / High-Impact Acrylic</span>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-2">
              <span className="text-stone-400 font-semibold uppercase tracking-wider">Engraving Type</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">Deep Laser Etching</span>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-2">
              <span className="text-stone-400 font-semibold uppercase tracking-wider">Weight</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">18 - 25 grams</span>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Star Breakdown */}
            <div className="md:col-span-1 bg-stone-50 dark:bg-stone-850 p-6 rounded-3xl space-y-4 border border-stone-150">
              <h4 className="font-extrabold text-sm uppercase tracking-wider">Ratings Summary</h4>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-extrabold">4.5</span>
                <div>
                  <div className="flex text-stone-950 dark:text-white">
                    <Star size={14} className="fill-current" />
                    <Star size={14} className="fill-current" />
                    <Star size={14} className="fill-current" />
                    <Star size={14} className="fill-current" />
                    <Star size={14} />
                  </div>
                  <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">Based on {localReviews.length} reviews</span>
                </div>
              </div>

              {/* Progress bars */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-500">
                  <span>5 stars</span>
                  <div className="flex-1 mx-3 h-1 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div className="bg-stone-950 dark:bg-white h-full w-[80%]" />
                  </div>
                  <span>80%</span>
                </div>
                <div className="flex items-center justify-between text-stone-500">
                  <span>4 stars</span>
                  <div className="flex-1 mx-3 h-1 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div className="bg-stone-950 dark:bg-white h-full w-[20%]" />
                  </div>
                  <span>20%</span>
                </div>
              </div>
            </div>

            {/* List and Submission Form */}
            <div className="md:col-span-2 space-y-6">
              {/* Submission Form */}
              {user && (
                <form onSubmit={handleAddReview} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 p-6 rounded-3xl space-y-4 shadow-soft">
                  <h4 className="font-bold text-sm uppercase tracking-wider">Add a review</h4>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-stone-500">Select Rating:</span>
                    <select
                      value={newRating}
                      onChange={(e) => setNewRating(Number(e.target.value))}
                      className="border border-stone-200 dark:border-stone-850 bg-stone-50 px-3 py-1.5 rounded-full text-xs font-semibold outline-none"
                    >
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>
                  <textarea
                    rows="3"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Describe your design and delivery experience..."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs outline-none resize-none"
                  />
                  <button type="submit" className="bg-stone-950 hover:bg-stone-900 text-white dark:bg-white dark:text-stone-950 px-5 py-2 rounded-full text-xs font-bold transition">Submit Review</button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {localReviews.map((rev) => (
                  <div key={rev.id} className="border-b border-stone-150 pb-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{rev.user}</span>
                      <span className="text-[10px] text-stone-400">{rev.date}</span>
                    </div>
                    <div className="flex text-stone-950 dark:text-white">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={10} className={i < rev.rating ? "fill-current" : ""} />
                      ))}
                    </div>
                    <p className="text-xs text-stone-500">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
