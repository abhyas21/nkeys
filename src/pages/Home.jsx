import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getProducts, getCategories, getProductImageUrl, toggleWishlist, getWishlist } from "../services/database";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { ArrowRight, ShoppingBag, Heart } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [prodData, catData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);

        const activeList = (prodData || []).filter((p) => p.is_active !== false);

        setAllProducts(activeList);
        setRecentProducts(activeList.slice(0, 3));
        setCategories(catData || []);

        if (user) {
          const wish = await getWishlist(user.id);
          setWishlistIds(new Set(wish.map((w) => String(w.product_id))));
        }
      } catch (err) {
        console.error("Error loading home page data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();

    const handleSync = () => loadHomeData();
    window.addEventListener("products-updated", handleSync);
    return () => window.removeEventListener("products-updated", handleSync);
  }, [user]);

  const handleWishlistToggle = async (e, productId) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    const wishId = `wish-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const res = await toggleWishlist({ id: wishId, user_id: user.id, product_id: productId });
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (res.added) next.add(String(productId));
      else next.delete(String(productId));
      return next;
    });
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    e.preventDefault();
    addItem(product, 1);
    if (addToast) addToast(`Added ${product.name} to bag!`);
  };

  return (
    <div className="space-y-16">
      {/* Clean Hero Section */}
      <section className="relative rounded-[2.5rem] overflow-hidden bg-[#FAF6F0] text-stone-900 p-8 sm:p-12 md:p-16 lg:p-20 xl:py-24 xl:px-20 flex flex-col lg:flex-row items-center justify-between gap-12 border border-stone-200/50">

        {/* Left Column: Heading ONLY */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 space-y-8 text-left z-10"
        >
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[80px] text-[#1A1918] font-normal leading-[1.08] tracking-tight">
            Unlock Your Style
          </h1>

          <div>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 bg-[#1A1918] hover:bg-[#33302C] text-white font-semibold text-sm px-8 py-3.5 rounded-full shadow-md transition-all duration-300"
            >
              <span>Explore Collection</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

        {/* Right Gallery: Top 3 Database Products */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="w-full lg:w-auto flex items-center justify-center gap-3 sm:gap-4 relative z-10 overflow-x-auto py-4"
        >
          {loading ? (
            <div className="flex gap-4">
              <div className="w-36 sm:w-48 h-52 sm:h-64 bg-stone-200 rounded-[1.75rem] animate-pulse" />
              <div className="w-44 sm:w-56 h-60 sm:h-76 bg-stone-300 rounded-[1.75rem] animate-pulse -translate-y-2" />
              <div className="w-36 sm:w-48 h-52 sm:h-64 bg-stone-200 rounded-[1.75rem] animate-pulse" />
            </div>
          ) : recentProducts.length === 0 ? (
            <div className="text-stone-400 text-xs py-8 text-center">No products found</div>
          ) : (
            recentProducts.map((product, idx) => {
              const isCenter = idx === 1;
              return (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => navigate(`/products/${product.id}`)}
                  className={`shrink-0 cursor-pointer group relative ${isCenter ? "z-10" : ""}`}
                >
                  <div
                    className={`overflow-hidden rounded-[1.75rem] border border-stone-200/60 bg-white shadow-xl transition duration-300 relative ${isCenter
                        ? "w-44 sm:w-56 lg:w-60 h-60 sm:h-76 lg:h-84 shadow-2xl -translate-y-2"
                        : "w-36 sm:w-48 lg:w-52 h-52 sm:h-64 lg:h-72"
                      }`}
                  >
                    <img
                      src={getProductImageUrl(product.image_url)}
                      alt={product.name}
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/hero-keychain.svg";
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end">
                      <p className="font-serif font-bold text-xs sm:text-sm truncate">{product.name}</p>
                      <p className="text-[11px] font-extrabold text-[#B89762] mt-0.5">
                        ₹{product.discount_price || product.price}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>

      </section>

      {/* Explore Products Grid Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-serif text-[#1A1918]">
              Explore Products
            </h2>
            <p className="text-xs text-stone-500 mt-1">Discover handcrafted keychains and custom creations</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold uppercase tracking-wider text-[#B08D57] hover:text-[#987643] flex items-center gap-1.5 transition"
          >
            <span>All Products</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Category Filter Pills (if categories exist) */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 whitespace-nowrap transition"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-square bg-stone-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : allProducts.length === 0 ? (
          <div className="text-center py-12 text-stone-400 text-sm">No products found</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {allProducts.map((prod) => {
              const isWish = wishlistIds.has(String(prod.id));
              const isOutOfStock = Number(prod.stock ?? prod.inventory ?? 0) <= 0;

              return (
                <article
                  key={prod.id}
                  onClick={() => navigate(`/products/${prod.id}`)}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-soft hover:shadow-luxury transition-all duration-300 cursor-pointer"
                >
                  {/* Wishlist Button */}
                  {user && (
                    <button
                      type="button"
                      onClick={(e) => handleWishlistToggle(e, prod.id)}
                      className={`absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white/90 shadow-sm backdrop-blur transition ${isWish
                          ? "border-rose-200 text-rose-500"
                          : "border-stone-200 text-stone-400 hover:text-rose-500"
                        }`}
                      aria-label="Wishlist"
                    >
                      <Heart size={16} className={isWish ? "fill-current" : ""} />
                    </button>
                  )}

                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-stone-100">
                    <img
                      src={getProductImageUrl(prod.image_url)}
                      alt={prod.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/hero-keychain.svg";
                      }}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#B08D57]">
                      {prod.categories?.name || "Keychain"}
                    </p>
                    <h3 className="font-serif text-sm sm:text-base font-bold text-[#1A1918] group-hover:text-[#B08D57] transition-colors truncate">
                      {prod.name}
                    </h3>

                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-stone-100">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-extrabold text-[#1A1918]">
                          ₹{prod.discount_price || prod.price}
                        </span>
                        {prod.discount_price && (
                          <span className="text-[11px] text-stone-400 line-through">
                            ₹{prod.price}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, prod)}
                        disabled={isOutOfStock}
                        className="inline-flex items-center gap-1 rounded-full bg-[#1A1918] active:bg-[#33302C] hover:bg-[#33302C] px-3 py-1.5 text-[11px] font-bold text-white transition shadow-sm disabled:bg-stone-300"
                      >
                        <ShoppingBag size={12} />
                        <span>{isOutOfStock ? "Sold Out" : "Add"}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}