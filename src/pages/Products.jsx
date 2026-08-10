import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getProducts, getCategories, toggleWishlist, getWishlist, getProductImageUrl } from "../services/database";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { Search, Heart, ShoppingBag, Eye, Tag, Sparkles, Filter, Grid, List, Star } from "lucide-react";

export default function Products() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedPreviewProduct, setSelectedPreviewProduct] = useState(null);

  // Filter States
  const [priceLimit, setPriceLimit] = useState(1000);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  // Sync URL search queries
  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      try {
        const prodData = await getProducts();
        const catData = await getCategories();
        setProducts(prodData);
        setCategories(catData);

        if (user) {
          const wish = await getWishlist(user.id);
          setWishlistIds(new Set(wish.map((w) => w.product_id)));
        }
      } catch (err) {
        console.error(err);
      } finally {
        startTransition(() => {
          setLoading(false);
        });
      }
    }
    loadData();
  }, [user]);

  // Wrap transition to keep VITE performance high
  const startTransition = (cb) => {
    cb();
  };

  const handleWishlist = async (productId) => {
    if (!user) {
      addToast("Please login to wishlist products", "error");
      return;
    }
    const wishId = `wish-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const res = await toggleWishlist({ id: wishId, user_id: user.id, product_id: productId });
    
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (res.added) {
        next.add(productId);
        addToast("Added to wishlist!");
      } else {
        next.delete(productId);
        addToast("Removed from wishlist");
      }
      return next;
    });
  };

  const filteredAndSortedProducts = products
    .filter((prod) => {
      const matchesSearch = searchQuery.trim() === "" ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === "all" || prod.category_id === selectedCategory;
      
      const price = prod.discount_price || prod.price;
      const matchesPrice = price <= priceLimit;

      const rating = prod.rating || 4.5; // fallback
      const matchesRating = rating >= minRating;

      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") {
        return (a.discount_price || a.price) - (b.discount_price || b.price);
      }
      if (sortBy === "price-high") {
        return (b.discount_price || b.price) - (a.discount_price || a.price);
      }
      if (sortBy === "alphabetical") {
        return a.name.localeCompare(b.name);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-14 bg-stone-200 dark:bg-stone-900 rounded-3xl" />
        <div className="h-8 w-64 bg-stone-200 dark:bg-stone-900 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-stone-200 dark:bg-stone-900 h-96 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search, Filter Toggle, Sort Header */}
      <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-3xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-soft">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-stone-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search custom keychains..."
            className="w-full rounded-full border border-stone-200 bg-stone-50 py-2.5 pl-11 pr-4 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-850 dark:text-stone-100 outline-none focus:border-stone-450"
          />
        </div>

        <div className="flex gap-2 items-center self-end md:self-auto">
          {/* Collapsible Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-stone-200 dark:border-stone-800 text-xs font-semibold uppercase tracking-wider transition ${
              showFilters ? "bg-stone-950 text-white dark:bg-white dark:text-stone-950" : "bg-white hover:bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-400"
            }`}
          >
            <Filter size={14} /> Filters
          </button>

          {/* Grid/List Toggle */}
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="p-2.5 rounded-full border border-stone-200 dark:border-stone-800 bg-white hover:bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-400"
            title={viewMode === "grid" ? "Switch to List view" : "Switch to Grid view"}
          >
            {viewMode === "grid" ? <List size={16} /> : <Grid size={16} />}
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-850 dark:text-stone-100 outline-none appearance-none pr-8 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-no-repeat bg-[position:right_1rem_center]"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </section>

      {/* Categories Pills */}
      <section className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition shrink-0 ${
            selectedCategory === "all"
              ? "bg-stone-950 text-white dark:bg-white dark:text-stone-950 shadow-sm"
              : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 dark:bg-stone-900 dark:text-stone-400 dark:border-stone-800"
          }`}
        >
          <Sparkles size={12} />
          All Products
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition shrink-0 ${
              selectedCategory === cat.id
                ? "bg-stone-950 text-white dark:bg-white dark:text-stone-950 shadow-sm"
                : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 dark:bg-stone-900 dark:text-stone-400 dark:border-stone-800"
            }`}
          >
            <Tag size={12} />
            {cat.name}
          </button>
        ))}
      </section>

      {/* Main catalog content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Collapsible Sidebar Filter Panel */}
        {showFilters && (
          <aside className="lg:col-span-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-3xl p-6 shadow-soft space-y-6 h-fit animate-slide-in">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-850 pb-3">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-stone-900 dark:text-stone-100">Filter Products</h3>
              <button onClick={() => { setPriceLimit(1000); setMinRating(0); }} className="text-[10px] underline font-bold uppercase tracking-wider text-stone-400 hover:text-stone-950 dark:hover:text-stone-50">Reset</button>
            </div>

            {/* Price range limit slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider">
                <span>Max Price</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">₹{priceLimit}</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={priceLimit}
                onChange={(e) => setPriceLimit(Number(e.target.value))}
                className="w-full h-1 bg-stone-150 rounded-lg appearance-none cursor-pointer accent-stone-950 dark:accent-white"
              />
            </div>

            {/* Star Rating threshold selector */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Minimum Rating</h4>
              <div className="flex flex-col gap-2">
                {[4, 3, 2, 0].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => setMinRating(stars)}
                    className={`flex items-center gap-2 text-xs font-semibold py-1 px-3 rounded-full border transition text-left ${
                      minRating === stars
                        ? "border-stone-950 bg-stone-950 text-white dark:border-white dark:bg-white dark:text-stone-950"
                        : "border-stone-150 text-stone-600 dark:border-stone-800 dark:text-stone-400"
                    }`}
                  >
                    <Star size={12} className="fill-current text-stone-400" />
                    <span>{stars === 0 ? "Any rating" : `${stars} stars & up`}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Grid/List Items */}
        <section className={`lg:col-span-${showFilters ? "3" : "4"}`}>
          {filteredAndSortedProducts.length > 0 ? (
            <div className={
              viewMode === "grid"
                ? showFilters
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6"
                  : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-8 gap-6"
                : "space-y-4"
            }>
              {filteredAndSortedProducts.map((prod) => {
                const isWish = wishlistIds.has(prod.id);
                const isOutOfStock = ((prod.stock_d || 0) + (prod.stock_k || 0)) <= 0;
                
                if (viewMode === "grid") {
                  return (
                    <div
                      key={prod.id}
                      className="group relative bg-white/40 dark:bg-stone-900/40 backdrop-blur-sm border border-stone-200 dark:border-stone-850 rounded-3xl overflow-hidden flex flex-col hover:shadow-soft transition"
                    >
                      <div className="relative aspect-square overflow-hidden bg-stone-100 dark:bg-stone-850">
                        <img
                          src={getProductImageUrl(prod.image_url)}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-102 transition duration-300 cursor-pointer"
                          onClick={() => setSelectedPreviewProduct(prod)}
                        />
                        {user && (
                          <button
                            onClick={() => handleWishlist(prod.id)}
                            className={`absolute top-4 right-4 p-2 rounded-full border bg-white dark:bg-stone-900 shadow-sm transition ${
                              isWish
                                ? "border-stone-950 text-stone-950 dark:border-stone-100 dark:text-stone-100"
                                : "border-stone-200 dark:border-stone-800 text-stone-400 hover:text-stone-950 dark:hover:text-stone-100"
                            }`}
                          >
                            <Heart size={18} className={isWish ? "fill-current" : ""} />
                          </button>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                            <Tag size={12} /> {prod.categories?.name}
                          </span>
                          <h3 className="font-bold text-base mt-1 cursor-pointer hover:underline" onClick={() => setSelectedPreviewProduct(prod)}>{prod.name}</h3>
                          <p className="text-xs text-stone-500 mt-1 line-clamp-2">{prod.description}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-stone-950 dark:text-stone-50">
                              ₹{prod.discount_price || prod.price}
                            </span>
                            {prod.discount_price && (
                              <span className="text-xs text-stone-400 line-through">₹{prod.price}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedPreviewProduct(prod)}
                              className="p-2 rounded-full border border-stone-200 hover:border-stone-400 dark:border-stone-700 text-stone-500 hover:text-stone-950"
                              title="Quick View"
                            >
                              <Eye size={16} />
                            </button>
                            {user && (
                              <button
                                onClick={() => {
                                  addItem(prod.id, 1);
                                  addToast(`Added ${prod.name} to cart!`);
                                }}
                                disabled={isOutOfStock}
                                className="bg-stone-950 hover:bg-stone-850 text-white dark:bg-white dark:text-stone-950 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 disabled:bg-stone-300 transition"
                              >
                                <ShoppingBag size={12} />
                                {isOutOfStock ? "Sold Out" : "Add"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  // List View Mode
                  return (
                    <div
                      key={prod.id}
                      className="flex gap-6 bg-white/40 dark:bg-stone-900/40 backdrop-blur-sm border border-stone-200 dark:border-stone-850 rounded-3xl p-4 hover:shadow-soft transition items-center"
                    >
                      <img
                        src={getProductImageUrl(prod.image_url)}
                        alt={prod.name}
                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-2xl cursor-pointer"
                        onClick={() => setSelectedPreviewProduct(prod)}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{prod.categories?.name}</span>
                        <h3 className="font-bold text-base truncate cursor-pointer hover:underline" onClick={() => setSelectedPreviewProduct(prod)}>{prod.name}</h3>
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2 hidden sm:block">{prod.description}</p>
                        
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-base font-bold">₹{prod.discount_price || prod.price}</span>
                          {prod.discount_price && <span className="text-xs line-through text-stone-400">₹{prod.price}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0 items-end">
                        {user && (
                          <button
                            onClick={() => handleWishlist(prod.id)}
                            className={`p-2 rounded-full border shadow-sm transition ${
                              isWish ? "border-stone-955 text-stone-955 dark:border-white" : "border-stone-200 text-stone-400"
                            }`}
                          >
                            <Heart size={16} className={isWish ? "fill-current" : ""} />
                          </button>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedPreviewProduct(prod)}
                            className="p-2 rounded-full border border-stone-200 hover:border-stone-400 dark:border-stone-700 text-stone-500 hover:text-stone-950"
                          >
                            <Eye size={16} />
                          </button>
                          {user && (
                            <button
                              onClick={() => {
                                addItem(prod.id, 1);
                                addToast(`Added ${prod.name} to cart!`);
                              }}
                              disabled={isOutOfStock}
                              className="bg-stone-950 text-white dark:bg-white dark:text-stone-950 px-3 py-1.5 rounded-full text-xs font-bold disabled:bg-stone-300 transition"
                            >
                              {isOutOfStock ? "Sold Out" : "Add to Cart"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-stone-500">
              No products found matching your active filters.
            </div>
          )}
        </section>
      </div>

      {/* Quick Preview Modal */}
      {selectedPreviewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md" onClick={() => setSelectedPreviewProduct(null)} />
          <div className="relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 max-w-2xl w-full rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedPreviewProduct(null)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 font-bold">Close</button>
            <div className="w-full md:w-1/2 aspect-square rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-850">
              <img src={getProductImageUrl(selectedPreviewProduct.image_url)} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{selectedPreviewProduct.categories?.name}</span>
                <h3 className="font-extrabold text-xl mt-1">{selectedPreviewProduct.name}</h3>
                <p className="text-xs text-stone-500 mt-2 leading-relaxed">{selectedPreviewProduct.description}</p>
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-xl font-bold">₹{selectedPreviewProduct.discount_price || selectedPreviewProduct.price}</span>
                  {selectedPreviewProduct.discount_price && <span className="text-xs line-through text-stone-400">₹{selectedPreviewProduct.price}</span>}
                </div>
                <div className="text-xs text-stone-500 mb-4 font-semibold uppercase tracking-wider">
                  Stock Status: {((selectedPreviewProduct.stock_d || 0) + (selectedPreviewProduct.stock_k || 0)) > 0 ? (
                    <span className="text-stone-900 dark:text-stone-100">In Stock (Delhi: {selectedPreviewProduct.stock_d || 0} | Kolkata: {selectedPreviewProduct.stock_k || 0})</span>
                  ) : (
                    <span className="text-stone-400">Out of Stock</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/products/${selectedPreviewProduct.id}`}
                    className="flex-1 text-center border border-stone-200 hover:border-stone-400 dark:border-stone-700 text-stone-800 dark:text-stone-200 py-3 rounded-full text-xs font-bold transition"
                    onClick={() => setSelectedPreviewProduct(null)}
                  >
                    View Details
                  </Link>
                  {user && ((selectedPreviewProduct.stock_d || 0) + (selectedPreviewProduct.stock_k || 0)) > 0 && (
                    <button
                      onClick={() => {
                        addItem(selectedPreviewProduct.id, 1);
                        addToast(`Added ${selectedPreviewProduct.name} to cart!`);
                        setSelectedPreviewProduct(null);
                      }}
                      className="flex-1 bg-stone-950 hover:bg-stone-900 text-white dark:bg-white dark:text-stone-950 py-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={14} /> Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
