import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getProducts, getCategories, toggleWishlist, getWishlist, getProductImageUrl } from "../services/database";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Heart, ShoppingBag, Eye, Tag, ArrowRight, Sparkles, Star } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    }
    loadData();

    const handleSync = () => {
      loadData();
    };
    window.addEventListener("products-updated", handleSync);
    return () => window.removeEventListener("products-updated", handleSync);
  }, [user]);

  const handleWishlist = async (productId) => {
    if (!user) return;
    const wishId = `wish-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const res = await toggleWishlist({ id: wishId, user_id: user.id, product_id: productId });
    
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (res.added) {
        next.add(productId);
      } else {
        next.delete(productId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="space-y-12">
        {/* Hero Banner Skeleton */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-stone-200 dark:bg-stone-900 h-64 md:h-96 xl:h-[450px] animate-pulse flex flex-col justify-end p-8 md:p-16 lg:p-24">
          <div className="h-4 w-24 bg-stone-300 dark:bg-stone-800 rounded mb-4" />
          <div className="h-8 w-64 md:w-96 xl:w-[600px] bg-stone-300 dark:bg-stone-800 rounded mb-4" />
          <div className="h-4 w-48 md:w-80 xl:w-[400px] bg-stone-300 dark:bg-stone-800 rounded" />
        </div>

        {/* Categories Skeleton */}
        <div className="space-y-6">
          <div className="h-6 w-48 bg-stone-200 dark:bg-stone-900 animate-pulse rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-video bg-stone-200 dark:bg-stone-900 animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Luxury Light Hero Banner */}
      <section className="relative rounded-[2.5rem] overflow-hidden bg-[#FAF6F0] text-stone-900 p-8 sm:p-12 md:p-16 lg:p-20 xl:py-24 xl:px-20 flex flex-col lg:flex-row items-center justify-between gap-12 border border-stone-200/50">
        {/* Left Typography Content */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 space-y-6 text-left z-10"
        >
          <span className="text-[#B08D57] tracking-[0.25em] text-[11px] sm:text-xs font-bold uppercase block">
            HANDCRAFTED IN INDIA
          </span>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[78px] text-[#1A1918] font-normal leading-[1.08] tracking-tight">
            Keys to <br />
            <span className="italic text-[#B89762] font-serif font-normal">Your</span> <br />
            Story
          </h1>

          <p className="font-sans text-stone-600 text-sm sm:text-base md:text-lg max-w-md leading-relaxed">
            Custom keychains and stickers that carry your personality. Designed with care, made to last.
          </p>

          {/* Feature Badges Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="bg-white/90 border border-stone-200/80 shadow-xs rounded-full px-4 py-2 text-xs font-medium text-stone-700 flex items-center gap-2">
              <Sparkles size={14} className="text-[#B89762]" />
              <span>Premium Engraving</span>
            </div>
            <div className="bg-white/90 border border-stone-200/80 shadow-xs rounded-full px-4 py-2 text-xs font-medium text-stone-700 flex items-center gap-2">
              <span className="text-stone-400">🛡️</span>
              <span>Quality Assured</span>
            </div>
            <div className="bg-white/90 border border-stone-200/80 shadow-xs rounded-full px-4 py-2 text-xs font-medium text-stone-700 flex items-center gap-2">
              <span className="text-stone-400">🚚</span>
              <span>Fast Delivery</span>
            </div>
            <div className="bg-white/90 border border-stone-200/80 shadow-xs rounded-full px-4 py-2 text-xs font-medium text-stone-700 flex items-center gap-2">
              <span className="text-stone-400">🔄</span>
              <span>Easy Returns</span>
            </div>
          </div>
        </motion.div>

        {/* Right Staggered Visual Gallery Cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="w-full lg:w-auto flex items-center justify-center gap-3 sm:gap-4 relative z-10 overflow-x-auto py-4"
        >
          {/* Card 1 */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
            className="shrink-0"
          >
            <img
              src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop"
              alt="Luxury bag and accessory display"
              className="w-36 sm:w-48 lg:w-52 h-52 sm:h-64 lg:h-72 object-cover rounded-[1.75rem] shadow-xl border border-stone-200/60"
            />
          </motion.div>

          {/* Card 2 (Center Featured) */}
          <motion.div
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
            className="shrink-0 z-10"
          >
            <img
              src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop"
              alt="Luxury red quilted handbag display"
              className="w-44 sm:w-56 lg:w-60 h-60 sm:h-76 lg:h-84 object-cover rounded-[1.75rem] shadow-2xl border border-stone-200/60 -translate-y-2"
            />
          </motion.div>

          {/* Card 3 */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
            className="shrink-0"
          >
            <img
              src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop"
              alt="Luxury perfume and watch display"
              className="w-36 sm:w-48 lg:w-52 h-52 sm:h-64 lg:h-72 object-cover rounded-[1.75rem] shadow-xl border border-stone-200/60"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Category List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Explore Categories</h2>
          <Link to="/products" className="text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1">
            All Products <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 w-full">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="group relative rounded-2xl overflow-hidden aspect-video bg-stone-100 dark:bg-stone-850 flex items-center justify-center p-4 border border-stone-200 dark:border-stone-800 transition"
            >
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition z-10" />
              <img
                src={cat.image_url || "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=300"}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <span className="relative z-20 font-bold text-white text-sm md:text-base text-center drop-shadow">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured / Popular Products Section */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Trending Keychains & Products</h2>
            <p className="text-xs text-stone-500 mt-1">Handcrafted custom accessories available now</p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 py-2 text-xs font-bold text-stone-900 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            Explore Catalog <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
          {products.map((prod) => {
            const isWish = wishlistIds.has(prod.id);
            return (
              <div
                key={prod.id}
                className="group relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden flex flex-col hover:shadow-soft transition w-full"
              >
                <div className="relative aspect-square overflow-hidden bg-stone-100 dark:bg-stone-850">
                  <img
                    src={getProductImageUrl(prod.image_url)}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
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
                      <Heart size={16} className={isWish ? "fill-current" : ""} />
                    </button>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                      <Tag size={10} /> {prod.categories?.name || "Accessory"}
                    </span>
                    <Link to={`/products/${prod.slug || prod.id}`}>
                      <h3 className="font-bold text-base mt-1 hover:underline text-stone-950 dark:text-stone-50 line-clamp-1">{prod.name}</h3>
                    </Link>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">{prod.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-850">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-stone-950 dark:text-stone-50">
                        ₹{prod.discount_price || prod.price}
                      </span>
                      {prod.discount_price && (
                        <span className="text-xs text-stone-400 line-through">₹{prod.price}</span>
                      )}
                    </div>

                    <button
                      onClick={() => addItem(prod)}
                      className="inline-flex items-center gap-1 bg-stone-950 dark:bg-white text-white dark:text-stone-950 px-3.5 py-2 rounded-full text-xs font-bold hover:bg-stone-900 transition"
                    >
                      <ShoppingBag size={14} /> Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
