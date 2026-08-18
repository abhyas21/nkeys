import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getProductImageUrl } from "../services/database";
import ErrorBoundary from "../components/ErrorBoundary";
import { ShoppingBag, Heart, User, LogOut, LayoutDashboard, Search, Home as HomeIcon, ShoppingCart } from "lucide-react";

export default function CustomerLayout() {
  const { user, profile, isAdmin, logout } = useAuth();
  const { cartCount, cartTotal, cartItems, updateQuantity, removeItem } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  const handleNavSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch("");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1918] transition-colors duration-200 pb-24 md:pb-20">
      {/* Top Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-soft">
        <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 font-bold text-xl text-stone-955 shrink-0 group">
            <img src="/logo.png" alt="NKeys Logo" className="w-10 h-10 object-contain rounded-full border border-amber-500/20 shadow-sm group-hover:scale-105 transition-transform" />
            <span className="font-serif tracking-tight text-lg md:text-xl">NKeys Store</span>
          </Link>
          
          <form onSubmit={handleNavSearchSubmit} className="hidden md:flex relative max-w-sm w-full">
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search catalog, keychains, stickers..."
              className="w-full rounded-full border border-stone-200 bg-stone-50 px-4 py-2 pl-10 text-xs outline-none focus:border-[#B08D57] transition"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
              <Search size={14} />
            </span>
          </form>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="font-semibold text-sm hover:text-[#B08D57] transition">Home</Link>
            <Link to="/products" className="font-semibold text-sm hover:text-[#B08D57] transition">Shop</Link>
            {user && (
              <>
                <Link to="/wishlist" className="font-semibold text-sm hover:text-[#B08D57] flex items-center gap-1 transition">
                  <Heart size={16} />
                  <span>Wishlist</span>
                </Link>
                <Link to="/profile" className="font-semibold text-sm hover:text-[#B08D57] flex items-center gap-1 transition">
                  <User size={16} />
                  <span>Profile</span>
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" className="font-semibold text-sm text-[#B08D57] hover:text-[#987643] flex items-center gap-1 transition">
                <LayoutDashboard size={16} />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1A1918] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#33302C] transition shadow-sm"
              >
                <LayoutDashboard size={14} />
                <span>Admin Dashboard</span>
              </Link>
            )}

            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-200 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-100 transition"
                title="Log out"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-[#1A1918] hover:bg-[#33302C] text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition shadow-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-8 pb-24 md:pb-12">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Bottom Fixed Navigation Bar (Desktop & Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-luxury flex items-center justify-around h-16 px-4">
        <Link to="/" className="flex flex-col items-center justify-center text-stone-600 hover:text-[#B08D57] transition">
          <HomeIcon size={18} />
          <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Home</span>
        </Link>
        <Link to="/products" className="flex flex-col items-center justify-center text-stone-600 hover:text-[#B08D57] transition">
          <Search size={18} />
          <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Shop</span>
        </Link>
        {user && (
          <Link to="/wishlist" className="flex flex-col items-center justify-center text-stone-600 hover:text-[#B08D57] transition">
            <Heart size={18} />
            <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Wishlist</span>
          </Link>
        )}
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex flex-col items-center justify-center text-stone-600 hover:text-[#B08D57] transition"
        >
          <ShoppingBag size={18} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2 h-4 w-4 bg-[#B08D57] text-white rounded-full text-[9px] flex items-center justify-center font-bold shadow-sm">
              {cartCount}
            </span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Bag ({cartCount})</span>
        </button>
        {isAdmin && (
          <Link to="/admin" className="flex flex-col items-center justify-center text-[#B08D57] font-bold transition">
            <LayoutDashboard size={18} />
            <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Admin</span>
          </Link>
        )}
        {user ? (
          <Link to="/profile" className="flex flex-col items-center justify-center text-stone-600 hover:text-[#B08D57] transition">
            <User size={18} />
            <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Profile</span>
          </Link>
        ) : (
          <Link to="/login" className="flex flex-col items-center justify-center text-stone-950 font-bold">
            <User size={18} />
            <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Login</span>
          </Link>
        )}
      </nav>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md bg-white dark:bg-stone-900 shadow-xl flex flex-col">
              <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <ShoppingCart /> Your Shopping Bag
                </h2>
                <button onClick={() => setCartOpen(false)} className="text-stone-500 hover:text-stone-700">Close</button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <p className="text-center text-stone-500 dark:text-stone-400 py-8">Your cart is empty.</p>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
                      <img
                        src={getProductImageUrl(item.products?.image_url)}
                        alt={item.products?.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">{item.products?.name}</h4>
                        <p className="text-xs text-stone-500">{item.products?.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 border border-stone-200 dark:border-stone-700 rounded-full px-2 py-0.5 text-xs">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                          </div>
                          <span className="font-semibold text-sm">
                            ₹{(item.products?.discount_price || item.products?.price) * item.quantity}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 text-xs self-start underline">Delete</button>
                    </div>
                  ))
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-6 border-t border-stone-200 dark:border-stone-800 space-y-4">
                  <div className="flex items-center justify-between font-bold text-base">
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <Link
                    to="/checkout"
                    onClick={() => setCartOpen(false)}
                    className="w-full block text-center bg-stone-950 hover:bg-stone-900 text-white py-3 rounded-full font-bold transition duration-200"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
