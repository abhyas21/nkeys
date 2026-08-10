import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWishlist, toggleWishlist } from "../services/database";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Trash2, ShoppingBag, Eye } from "lucide-react";

export default function Wishlist() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getWishlist(user.id)
        .then((data) => setItems(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleRemove = async (productId) => {
    if (!user) return;
    const wishId = `wish-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await toggleWishlist({ id: wishId, user_id: user.id, product_id: productId });
    setItems((prev) => prev.filter((item) => item.product_id !== productId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-terracotta"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Wishlist</h1>
        <p className="text-sm text-stone-500 mt-1">Products you have saved for later</p>
      </div>

      {items.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-3xl bg-white dark:bg-stone-900">
          <p className="text-stone-500">Your wishlist is empty.</p>
          <Link to="/products" className="bg-terracotta text-white px-5 py-2.5 rounded-full text-xs font-bold mt-4 inline-block">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const prod = item.products;
            if (!prod) return null;
            const isOutOfStock = ((prod.stock_d || 0) + (prod.stock_k || 0)) <= 0;
            return (
              <div
                key={item.id}
                className="group relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden flex flex-col hover:shadow-soft transition"
              >
                <div className="relative aspect-square overflow-hidden bg-stone-100 dark:bg-stone-850">
                  <img
                    src={prod.image_url || "https://images.unsplash.com/photo-1544816155-12df9643f363?w=300"}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                  />
                  <button
                    onClick={() => handleRemove(prod.id)}
                    className="absolute top-4 right-4 p-2 rounded-full border border-stone-200 bg-white text-stone-500 hover:text-stone-900 dark:bg-stone-900 dark:border-stone-800 dark:hover:text-stone-100 shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-base">{prod.name}</h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">{prod.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-stone-950 dark:text-stone-50">
                      ₹{prod.discount_price || prod.price}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/products/${prod.id}`}
                        className="p-2 rounded-full border border-stone-200 hover:border-terracotta dark:border-stone-700 text-stone-500 hover:text-terracotta"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => addItem(prod.id, 1)}
                        disabled={isOutOfStock}
                        className="bg-stone-950 hover:bg-stone-850 text-white dark:bg-white dark:text-stone-950 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 disabled:bg-stone-300 transition"
                      >
                        <ShoppingBag size={12} />
                        {isOutOfStock ? "Sold Out" : "Add"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
