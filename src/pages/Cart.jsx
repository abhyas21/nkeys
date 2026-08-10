import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { getProductImageUrl } from "../services/database";
import { ShoppingBag, ArrowRight, Trash2, Ticket } from "lucide-react";

export default function Cart() {
  const { user } = useAuth();
  const { cartItems, cartTotal, updateQuantity, removeItem } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const handleProceedToCheckout = () => {
    if (!user) {
      navigate("/login?redirect=/checkout");
    } else {
      navigate("/checkout");
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === "NKEYS10") {
      setDiscountPercent(10);
      setAppliedCoupon("NKEYS10");
      addToast("10% Coupon Applied Successfully!");
    } else {
      addToast("Invalid Coupon Code", "error");
    }
    setCouponCode("");
  };

  const discountAmount = Math.round((cartTotal * discountPercent) / 100);
  const finalTotal = cartTotal - discountAmount;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-6">
        <div className="inline-flex p-6 bg-stone-150 rounded-full text-stone-400">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-2xl font-extrabold">Your bag is empty</h2>
        <p className="text-sm text-stone-500">Looks like you haven't added anything to your cart yet. Let's find some keychains!</p>
        <Link to="/products" className="inline-flex items-center gap-2 bg-stone-950 hover:bg-stone-900 text-white px-6 py-3 rounded-full text-xs font-bold transition">
          Browse shop <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8 animate-fade-in">
      <h1 className="text-3xl font-extrabold tracking-tight">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 border border-stone-200 dark:border-stone-850 bg-white dark:bg-stone-900 rounded-3xl items-center shadow-soft"
            >
              <img
                src={getProductImageUrl(item.products?.image_url)}
                alt={item.products?.name}
                className="w-20 h-20 object-cover rounded-2xl border border-stone-100"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">{item.products?.categories?.name}</span>
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">{item.products?.name}</h4>
                <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">{item.products?.description}</p>
                <div className="flex items-center gap-2 border border-stone-200 dark:border-stone-700 rounded-full px-2 py-0.5 text-xs w-max mt-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                  <span className="font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
              </div>
              <div className="text-right flex flex-col justify-between items-end h-20 shrink-0">
                <button
                  onClick={() => {
                    removeItem(item.id);
                    addToast("Item removed from cart");
                  }}
                  className="text-stone-400 hover:text-stone-950 dark:hover:text-stone-100"
                >
                  <Trash2 size={16} />
                </button>
                <span className="font-bold text-sm text-stone-950 dark:text-stone-50">
                  ₹{(item.products?.discount_price || item.products?.price) * item.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary sidebar */}
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-3xl p-6 shadow-soft space-y-6">
            <h3 className="font-bold text-base">Order Summary</h3>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="PROMOCODE"
                className="flex-1 rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-xs outline-none text-stone-900 dark:border-stone-700 dark:bg-stone-850 dark:text-stone-100"
              />
              <button
                type="submit"
                className="bg-stone-950 text-white dark:bg-white dark:text-stone-950 px-4 rounded-full text-xs font-bold hover:bg-stone-900 transition flex items-center gap-1 shrink-0"
              >
                <Ticket size={12} /> Apply
              </button>
            </form>

            {appliedCoupon && (
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-500">
                <span>Coupon Applied</span>
                <span>{appliedCoupon} (-10%)</span>
              </div>
            )}

            <div className="space-y-2 border-t border-b border-stone-100 dark:border-stone-850 py-4 text-xs space-y-3">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-stone-500">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-500">
                <span>Shipping</span>
                <span>Free Express</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Estimated Tax (18% GST)</span>
                <span>Included</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-sm">
              <span>Total Price</span>
              <span>₹{finalTotal}</span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full text-center bg-stone-950 hover:bg-stone-900 text-white dark:bg-white dark:text-stone-950 py-3 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              Checkout Now <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
