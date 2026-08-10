import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, getCategories, toggleWishlist, getWishlist, getProductImageUrl } from "../services/database";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Heart, ShoppingBag, Eye, Tag, ArrowRight } from "lucide-react";

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
        setProducts(prodData.slice(0, 6)); // Display top 6
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
        <div className="relative rounded-3xl overflow-hidden bg-stone-200 dark:bg-stone-900 h-64 md:h-96 xl:h-[450px] animate-pulse flex flex-col justify-end p-8 md:p-16 lg:p-24">
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
    <div className="space-y-12">
      {/* Hero Banner */}
      <section className="relative rounded-3xl overflow-hidden bg-stone-950 text-white p-8 md:p-16 lg:p-24 xl:py-32 xl:px-24 flex flex-col md:flex-row items-center gap-8 shadow-soft">
        <div className="flex-1 space-y-6 text-center md:text-left z-10">
          <span className="bg-white/10 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border border-white/20">New Arrivals</span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight">Custom Acrylic & Metal Keychains</h1>
          <p className="text-white/75 max-w-lg xl:max-w-2xl 2xl:max-w-3xl text-sm md:text-base xl:text-lg 2xl:text-xl">
            Express your unique style with custom-engraved names, designs, and high-detail stickers made with scratch-resistant finishes.
          </p>
          <div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-white text-stone-955 font-bold px-6 py-3 rounded-full hover:bg-stone-50 transition"
            >
              Explore Collection <ArrowRight size={18} />
            </Link>
          </div>
        </div>
        <div className="w-full md:w-1/3 flex justify-center z-10">
          <img
            src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=500"
            alt="Hero keychain"
            className="w-64 h-64 xl:w-80 xl:h-80 object-cover rounded-2xl shadow-lg border-4 border-white/10"
          />
        </div>
      </section>

      {/* Category List */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight">Explore Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-4 md:gap-6">
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
    </div>
  );
}
