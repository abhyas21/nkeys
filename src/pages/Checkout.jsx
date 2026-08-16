import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../services/supabase";
import { createOrder } from "../services/database";
import { MapPin, CreditCard, ShoppingBag, ArrowRight, ArrowLeft, Loader2, ClipboardCheck } from "lucide-react";

export default function Checkout() {
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Steps: 1: Shipping Address, 2: Payment Method, 3: Review
  const [step, setStep] = useState(1);

  // Address form states
  const [fullName, setFullName] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [cityVillage, setCityVillage] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [street1, setStreet1] = useState("");
  const [street2, setStreet2] = useState("");
  const [houseNumber, setHouseNumber] = useState("");

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState("cod"); // cod or card

  // Card details state
  const [cardNo, setCardNo] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Status & Error handling
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const formatCardNo = (val) => {
    const clean = val.replace(/\D/g, "");
    const parts = [];
    for (let i = 0; i < clean.length; i += 4) {
      parts.push(clean.substring(i, i + 4));
    }
    return parts.length > 0 ? parts.join(" ") : clean;
  };

  const formatExpiry = (val) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length >= 2) {
      return `${clean.slice(0, 2)}/${clean.slice(2, 4)}`;
    }
    return clean;
  };

  const handleNextStep = (e) => {
    if (e) e.preventDefault();
    if (step === 1) {
      if (!fullName.trim() || !primaryPhone.trim() || !state.trim() || !district.trim() || !cityVillage.trim() || !postalCode.trim() || !street1.trim() || !houseNumber.trim()) {
        setError("Please fill in all required address fields.");
        return;
      }
      setError("");
      setStep(2);
    } else if (step === 2) {
      if (paymentMethod === "card") {
        if (cardNo.replace(/\s/g, "").length !== 16 || cardExpiry.length !== 5 || cardCvv.length !== 3) {
          setError("Please enter valid card details.");
          return;
        }
      }
      setError("");
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const orderPayload = {
        user_id: user?.id || null,
        customer_email: (user?.email || "customer@example.com").toLowerCase().trim(),
        user_email: (user?.email || "customer@example.com").toLowerCase().trim(),
        full_name: fullName,
        phone: primaryPhone,
        alt_phone: secondaryPhone || null,
        state,
        district,
        city_village: cityVillage,
        postal_code: postalCode,
        street_1: street1,
        street_2: street2 || null,
        house_number: houseNumber,
        subtotal: cartTotal,
        delivery_charge: 60,
        total_amount: cartTotal + 60,
        payment_method: "Manual / Pending Contact (8074445067)",
        status: "Pending"
      };

      const itemsToInsert = cartItems.map((item) => ({
        product_id: item.product_id,
        product_name: item.products?.name || item.name || "Keychain Item",
        price: Number(item.products?.discount_price || item.products?.price || item.price || 0),
        quantity: Number(item.quantity || 1)
      }));

      const newOrder = await createOrder(orderPayload, itemsToInsert);

      // Clear cart and display success
      await clearCart();
      window.dispatchEvent(new Event('orders-updated'));
      addToast("Order placed successfully!");
      navigate(`/order-success/${newOrder.id}`);
    } catch (err) {
      console.error("Order submission failed:", err);
      setError(err.message || "Failed to submit your order. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-6">
        <ShoppingBag size={48} className="mx-auto text-stone-300" />
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <p className="text-sm text-stone-500">Add products to your cart before proceeding to checkout.</p>
        <Link to="/products" className="inline-flex items-center gap-2 bg-stone-950 text-white dark:bg-white dark:text-stone-955 px-6 py-3 rounded-full text-xs font-bold transition">
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1800px] w-full mx-auto py-8">
      {/* Step Indicators */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-850 pb-4 text-xs font-bold uppercase tracking-wider text-stone-400">
        <span className={step >= 1 ? "text-stone-900 dark:text-white" : ""}>1. Shipping Address</span>
        <span className={step >= 2 ? "text-stone-900 dark:text-white" : ""}>2. Payment Method</span>
        <span className={step >= 3 ? "text-stone-900 dark:text-white" : ""}>3. Review Order</span>
      </div>

      {error && (
        <div className="bg-stone-100 text-stone-950 dark:bg-stone-850 dark:text-stone-100 p-4 rounded-2xl text-xs font-semibold border border-stone-200 dark:border-stone-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step Form Blocks */}
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <form onSubmit={handleNextStep} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-3xl space-y-4 shadow-soft">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 mb-2">
                <MapPin size={16} /> Shipping Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Recipient's name"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs outline-none dark:border-stone-800 dark:bg-stone-855 dark:text-stone-100 focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Primary Phone *</label>
                  <input
                    type="tel"
                    required
                    value={primaryPhone}
                    onChange={(e) => setPrimaryPhone(e.target.value)}
                    placeholder="10-digit primary number"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs outline-none dark:border-stone-800 dark:bg-stone-855 dark:text-stone-100 focus:border-stone-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Secondary Phone</label>
                  <input
                    type="tel"
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                    placeholder="Optional alternate number"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs outline-none dark:border-stone-800 dark:bg-stone-855 dark:text-stone-100 focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Postal Code (PIN) *</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="6-digit PIN code"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs outline-none dark:border-stone-800 dark:bg-stone-855 dark:text-stone-100 focus:border-stone-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">House/Flat Number *</label>
                  <input
                    type="text"
                    required
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    placeholder="e.g. H.No 12 / Flat 4B"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs outline-none dark:border-stone-800 dark:bg-stone-855 dark:text-stone-100 focus:border-stone-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Street Address 1 *</label>
                  <input
                    type="text"
                    required
                    value={street1}
                    onChange={(e) => setStreet1(e.target.value)}
                    placeholder="e.g. Main Market, Near High School"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs outline-none dark:border-stone-800 dark:bg-stone-855 dark:text-stone-100 focus:border-stone-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Street Address 2</label>
                <input
                  type="text"
                  value={street2}
                  onChange={(e) => setStreet2(e.target.value)}
                  placeholder="e.g. Landmark, Sector or Block (Optional)"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs outline-none dark:border-stone-800 dark:bg-stone-855 dark:text-stone-100 focus:border-stone-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">City / Village *</label>
                  <input
                    type="text"
                    required
                    value={cityVillage}
                    onChange={(e) => setCityVillage(e.target.value)}
                    placeholder="e.g. Delhi"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs outline-none dark:border-stone-800 dark:bg-stone-855 dark:text-stone-100 focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Central Delhi"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs outline-none dark:border-stone-800 dark:bg-stone-855 dark:text-stone-100 focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Delhi"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs outline-none dark:border-stone-800 dark:bg-stone-855 dark:text-stone-100 focus:border-stone-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-stone-950 hover:bg-stone-900 text-white dark:bg-white dark:text-stone-955 py-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-2 mt-4"
              >
                Continue to Payment <ArrowRight size={14} />
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-3xl space-y-6 shadow-soft">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <CreditCard size={16} /> Payment Information
              </h3>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl my-4 text-center">
                <p className="text-amber-900 font-semibold text-base">
                  Online Payment Integration Coming Soon!
                </p>
                <p className="text-amber-800 text-sm mt-1">
                  After clicking <strong>Place Order</strong>, your order will be submitted directly. 
                  Please message us on WhatsApp/Phone at <strong className="underline font-bold">8074445067</strong> or wait for our team to contact you to confirm payment and delivery details.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-stone-200 hover:border-stone-400 dark:border-stone-800 py-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="flex-1 bg-[#1A1918] hover:bg-[#33302C] text-white dark:bg-white dark:text-stone-950 py-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  Review Order <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-3xl space-y-6 shadow-soft">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <ClipboardCheck size={16} /> Review Your Order
              </h3>

              <div className="space-y-4">
                <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
                  <h4 className="text-xs font-extrabold uppercase text-stone-400 tracking-wider mb-2">Delivery Address</h4>
                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                    <strong>{fullName}</strong> | {primaryPhone} {secondaryPhone ? ` / ${secondaryPhone}` : ""}
                    <br />
                    {houseNumber}, {street1}, {street2 ? `${street2}, ` : ""}{cityVillage}, {district}, {state} - {postalCode}
                  </p>
                </div>

                <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
                  <h4 className="text-xs font-extrabold uppercase text-stone-400 tracking-wider mb-2">Payment Option</h4>
                  <p className="text-xs text-stone-700 dark:text-stone-300">
                    {paymentMethod === "cod" ? "Cash on Delivery (COD)" : "Debit / Credit Card"}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold uppercase text-stone-400 tracking-wider mb-3">Cart Summary</h4>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-stone-900 dark:text-white">{item.products?.name}</p>
                          <p className="text-stone-400 mt-0.5">Quantity: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-stone-900 dark:text-white">
                          ₹{(item.products?.discount_price || item.products?.price || 0) * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-stone-150 dark:border-stone-800">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border border-stone-200 hover:border-stone-400 dark:border-stone-850 py-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={processing}
                  className="flex-1 bg-stone-950 hover:bg-stone-900 text-white dark:bg-white dark:text-stone-955 py-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="animate-spin" size={14} /> Placing Order...
                    </>
                  ) : (
                    <>
                      Place Order (₹{cartTotal + 60}) <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Subtotals Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-3xl space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-stone-900 dark:text-white pb-3 border-b border-stone-200 dark:border-stone-800">
              Payment Summary
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Delivery Charge</span>
                <span>₹60</span>
              </div>
              <div className="flex justify-between font-bold text-stone-900 dark:text-white pt-2 border-t border-stone-200 dark:border-stone-800 text-sm">
                <span>Total Amount</span>
                <span>₹{cartTotal + 60}</span>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-stone-850 border border-stone-150 dark:border-stone-800 rounded-2xl text-[10px] text-stone-400 text-center leading-relaxed">
              Delivery charges are flat ₹60 across all regions in India.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
