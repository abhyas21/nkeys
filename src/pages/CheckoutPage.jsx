import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Copy,
  CreditCard,
  MapPin,
  QrCode,
  ShieldCheck,
  Tag,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";

const steps = ["Shipping", "Payment", "Review"];
const RECEIVER_UPI_ID = "paytmqr6n9n10@ptys";
const RECEIVER_UPI_NAME = "NKeys";
const TEST_COUPON_CODE = "testnkey";
const TEST_COUPON_TOTAL = 2;

const createInitialShipping = (customer = null) => ({
  fullName: customer?.name || "",
  email: customer?.email || "",
  phone: customer?.phone || "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  notes: ""
});

const initialPayment = {
  method: "upi",
  upiReference: "",
  cardName: "",
  cardLast4: "",
  codNotes: ""
};

function createUpiPaymentLink(amount) {
  const params = new URLSearchParams({
    pa: RECEIVER_UPI_ID,
    pn: RECEIVER_UPI_NAME,
    tn: "NKeys order payment",
    am: amount.toFixed(2),
    cu: "INR"
  });

  return `upi://pay?${params.toString()}`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartSubtotal, currentCustomer, formatMoney, submitOrder } = useStore();
  const [stepIndex, setStepIndex] = useState(0);
  const [shipping, setShipping] = useState(() => createInitialShipping(currentCustomer));
  const [payment, setPayment] = useState(initialPayment);
  const [errorMessage, setErrorMessage] = useState("");
  const [upiQrCode, setUpiQrCode] = useState("");
  const [upiQrError, setUpiQrError] = useState("");
  const [upiCopied, setUpiCopied] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [couponFeedback, setCouponFeedback] = useState("");

  const shippingComplete = [
    shipping.fullName,
    shipping.email,
    shipping.phone,
    shipping.address,
    shipping.city,
    shipping.state,
    shipping.pincode
  ].every(Boolean);

  const paymentComplete =
    payment.method === "cod" ||
    payment.method === "upi" ||
    (payment.method === "card" &&
      payment.cardName.trim() &&
      payment.cardLast4.trim().length === 4);

  const deliveryFee = cartItems.length ? 79 : 0;
  const grossTotal = cartSubtotal + deliveryFee;
  const hasTestCoupon = appliedCouponCode === TEST_COUPON_CODE;
  const discountAmount = hasTestCoupon ? Math.max(0, grossTotal - TEST_COUPON_TOTAL) : 0;
  const grandTotal = Math.max(0, grossTotal - discountAmount);
  const upiPaymentLink = createUpiPaymentLink(grandTotal);

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(upiPaymentLink, {
      width: 280,
      margin: 1,
      color: {
        dark: "#171717",
        light: "#FFFFFF"
      }
    })
      .then((dataUrl) => {
        if (!cancelled) {
          setUpiQrCode(dataUrl);
          setUpiQrError("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUpiQrCode("");
          setUpiQrError("UPI QR could not be generated right now. Use the UPI ID below.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [upiPaymentLink]);

  const nextStep = () => {
    if (stepIndex === 0 && !shippingComplete) {
      setErrorMessage("Complete the shipping form before moving to payment.");
      return;
    }

    if (stepIndex === 1 && !paymentComplete) {
      setErrorMessage("Complete the selected payment details before reviewing the order.");
      return;
    }

    setErrorMessage("");
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const previousStep = () => {
    setErrorMessage("");
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const applyCoupon = () => {
    const normalizedCoupon = couponInput.trim().toLowerCase();

    if (!normalizedCoupon) {
      setAppliedCouponCode("");
      setCouponFeedback("Enter a coupon code to apply a discount.");
      return;
    }

    if (normalizedCoupon === TEST_COUPON_CODE) {
      setAppliedCouponCode(TEST_COUPON_CODE);
      setCouponFeedback("Coupon applied. The payable total is now ₹2.");
      return;
    }

    setAppliedCouponCode("");
    setCouponFeedback("Invalid coupon code.");
  };

  const removeCoupon = () => {
    setAppliedCouponCode("");
    setCouponInput("");
    setCouponFeedback("Coupon removed.");
  };

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(RECEIVER_UPI_ID);
      setUpiCopied(true);
      window.setTimeout(() => setUpiCopied(false), 2200);
    } catch {
      setUpiCopied(false);
      setErrorMessage("UPI ID could not be copied automatically. Please copy it manually.");
    }
  };

  const placeOrder = () => {
    if (!shippingComplete || !paymentComplete) {
      setErrorMessage("Shipping and payment details must be complete before placing the order.");
      return;
    }

    const order = submitOrder({
      shipping: {
        ...shipping,
        address: `${shipping.address}, ${shipping.city}, ${shipping.state} ${shipping.pincode}`
      },
      payment: {
        method:
          payment.method === "upi"
            ? "UPI"
            : payment.method === "card"
              ? "Card"
              : "Cash on Delivery",
        reference:
          payment.method === "upi"
            ? payment.upiReference.trim()
              ? `UTR / Ref: ${payment.upiReference.trim()}`
              : `Pay to ${RECEIVER_UPI_ID}`
            : payment.method === "card"
              ? `Card ending ${payment.cardLast4}`
              : payment.codNotes || "Collect on delivery"
      },
      shippingAmount: deliveryFee,
      discountAmount,
      couponCode: appliedCouponCode,
      totalAmount: grandTotal
    });

    navigate(`/checkout/success/${order.id}`);
  };

  if (!cartItems.length) {
    return (
      <section className="rounded-[2rem] border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 text-center shadow-soft sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
          Checkout
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-ink dark:text-white">Your cart is empty</h1>
        <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-400">
          Add products before moving through the shipping, payment, and review steps.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
        >
          Browse products
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:gap-8">
      <section
        className="page-reveal rounded-[2rem] border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-soft sm:p-6 lg:p-8"
        style={{ "--delay": "40ms" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              Checkout flow
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink dark:text-white sm:text-4xl">
              Shipping, payment, then final review
            </h1>
          </div>
          <div className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sand px-4 py-2 text-sm font-medium text-stone-600 sm:w-auto">
            <ShieldCheck size={16} className="text-moss" />
            Secure demo checkout
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {steps.map((step, index) => {
            const active = stepIndex === index;
            const complete = stepIndex > index;
            return (
              <div
                key={step}
                className={`rounded-3xl border px-5 py-4 ${active
                    ? "border-stone-900 bg-stone-900 text-white"
                    : complete
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-stone-200 bg-stone-50 text-stone-500"
                  }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em]">
                  Step {index + 1}
                </p>
                <p className="mt-2 text-base font-semibold sm:text-lg">{step}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          {stepIndex === 0 ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                  Shipping
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
                  Where should the order go?
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-ink">Full name</span>
                  <input
                    value={shipping.fullName}
                    onChange={(event) =>
                      setShipping((current) => ({ ...current, fullName: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-ink">Email</span>
                  <input
                    type="email"
                    value={shipping.email}
                    onChange={(event) =>
                      setShipping((current) => ({ ...current, email: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-ink">Phone</span>
                  <input
                    value={shipping.phone}
                    onChange={(event) =>
                      setShipping((current) => ({ ...current, phone: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-ink">Street address</span>
                  <input
                    value={shipping.address}
                    onChange={(event) =>
                      setShipping((current) => ({ ...current, address: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-ink">City</span>
                  <input
                    value={shipping.city}
                    onChange={(event) =>
                      setShipping((current) => ({ ...current, city: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-ink">State</span>
                  <input
                    value={shipping.state}
                    onChange={(event) =>
                      setShipping((current) => ({ ...current, state: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-ink">PIN code</span>
                  <input
                    value={shipping.pincode}
                    onChange={(event) =>
                      setShipping((current) => ({ ...current, pincode: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-ink">Delivery notes</span>
                  <textarea
                    rows={4}
                    value={shipping.notes}
                    onChange={(event) =>
                      setShipping((current) => ({ ...current, notes: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
                  />
                </label>
              </div>
            </div>
          ) : null}

          {stepIndex === 1 ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                  Payment
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
                  How should the order be paid?
                </h2>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  {
                    value: "upi",
                    label: "UPI",
                    copy: "Fastest option for India-first checkout."
                  },
                  {
                    value: "card",
                    label: "Card",
                    copy: "Capture only a lightweight demo token."
                  },
                  {
                    value: "cod",
                    label: "Cash on delivery",
                    copy: "Customer pays at delivery."
                  }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPayment((current) => ({ ...current, method: option.value }))}
                    className={`rounded-3xl border p-5 text-left transition ${payment.method === option.value
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 bg-stone-50 text-stone-600"
                      }`}
                  >
                    <p className="text-lg font-semibold">{option.label}</p>
                    <p className="mt-2 text-sm leading-6 opacity-90">{option.copy}</p>
                  </button>
                ))}
              </div>

              {payment.method === "upi" ? (
                <div className="space-y-4">
                  <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                    <div className="rounded-3xl border border-stone-200 bg-white p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                        <QrCode size={16} className="text-terracotta" />
                        Scan to pay
                      </div>
                      <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white p-3">
                        {upiQrCode ? (
                          <img
                            src={upiQrCode}
                            alt={`UPI QR for ${RECEIVER_UPI_ID}`}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="flex aspect-square items-center justify-center rounded-[1rem] bg-stone-50 text-sm text-stone-500">
                            QR loading
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                      <p className="text-sm font-semibold text-ink">Pay via any UPI app</p>
                      <p className="mt-2 text-sm leading-7 text-stone-600">
                        Scan the QR or pay directly to the receiver UPI ID below for this order total.
                      </p>

                      <div className="mt-4 rounded-2xl bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                          Receiver UPI ID
                        </p>
                        <p className="mt-2 break-all text-lg font-semibold text-ink">
                          {RECEIVER_UPI_ID}
                        </p>
                        <p className="mt-3 text-sm text-stone-600">
                          Amount: <span className="font-semibold text-ink">{formatMoney(grandTotal)}</span>
                        </p>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={copyUpiId}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-stone-900"
                        >
                          <Copy size={16} />
                          {upiCopied ? "Copied" : "Copy UPI ID"}
                        </button>
                        <a
                          href={upiPaymentLink}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
                        >
                          Open UPI app
                        </a>
                      </div>

                      {upiQrError ? (
                        <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                          {upiQrError}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-ink">
                      UTR / payment reference
                    </span>
                    <input
                      value={payment.upiReference}
                      onChange={(event) =>
                        setPayment((current) => ({
                          ...current,
                          upiReference: event.target.value
                        }))
                      }
                      placeholder="Optional UTR or payer UPI ID"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
                    />
                    <p className="mt-2 text-xs leading-6 text-stone-500">
                      After payment, add the UTR or payer UPI ID if you want it recorded with the order.
                    </p>
                  </label>
                </div>
              ) : null}

              {payment.method === "card" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-ink">Name on card</span>
                    <input
                      value={payment.cardName}
                      onChange={(event) =>
                        setPayment((current) => ({ ...current, cardName: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-ink">Last 4 digits</span>
                    <input
                      maxLength={4}
                      value={payment.cardLast4}
                      onChange={(event) =>
                        setPayment((current) => ({
                          ...current,
                          cardLast4: event.target.value.replace(/\D/g, "").slice(0, 4)
                        }))
                      }
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
                    />
                  </label>
                </div>
              ) : null}

              {payment.method === "cod" ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-ink">Collection note</span>
                  <textarea
                    rows={4}
                    value={payment.codNotes}
                    onChange={(event) =>
                      setPayment((current) => ({ ...current, codNotes: event.target.value }))
                    }
                    placeholder="Optional delivery or payment instruction"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
                  />
                </label>
              ) : null}

              <div className="rounded-3xl bg-sand p-5 text-sm leading-7 text-stone-600">
                This frontend stores only lightweight demo payment references. Real payment capture should move behind a secure backend.
              </div>
            </div>
          ) : null}

          {stepIndex === 2 ? (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                  Review order
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
                  Confirm before placing the order
                </h2>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <article className="rounded-3xl border border-stone-200 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <MapPin size={16} className="text-terracotta" />
                    Shipping details
                  </div>
                  <p className="mt-4 text-sm leading-7 text-stone-600">
                    {shipping.fullName}
                    <br />
                    {shipping.email}
                    <br />
                    {shipping.phone}
                    <br />
                    {shipping.address}, {shipping.city}, {shipping.state} {shipping.pincode}
                  </p>
                </article>

                <article className="rounded-3xl border border-stone-200 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <CreditCard size={16} className="text-terracotta" />
                    Payment details
                  </div>
                  <p className="mt-4 text-sm leading-7 text-stone-600">
                    {payment.method === "upi"
                      ? "UPI"
                      : payment.method === "card"
                        ? "Card"
                        : "Cash on delivery"}
                    <br />
                    {payment.method === "upi"
                      ? `Pay to ${RECEIVER_UPI_ID}${payment.upiReference.trim() ? ` | UTR / Ref: ${payment.upiReference.trim()}` : ""}`
                      : null}
                    {payment.method === "card" ? `Card ending ${payment.cardLast4}` : null}
                    {payment.method === "cod"
                      ? payment.codNotes || "Payment collected on delivery."
                      : null}
                    {appliedCouponCode ? (
                      <>
                        <br />
                        Coupon: {appliedCouponCode}
                      </>
                    ) : null}
                  </p>
                </article>
              </div>

              <div className="rounded-3xl bg-sand p-5 text-sm leading-7 text-stone-600">
                Review the item list in the summary panel, then place the order. A success page with order number and saved details will follow immediately.
              </div>
            </div>
          ) : null}
        </div>

        {errorMessage ? (
          <p className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={previousStep}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold text-ink transition hover:border-stone-900 sm:w-auto"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          ) : (
            <Link
              to="/products"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold text-ink transition hover:border-stone-900 sm:w-auto"
            >
              <ArrowLeft size={16} />
              Keep shopping
            </Link>
          )}

          {stepIndex < steps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 sm:w-auto"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={placeOrder}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 sm:w-auto"
            >
              Place order
              <BadgeCheck size={16} />
            </button>
          )}
        </div>
      </section>

      <aside
        className="page-reveal-right space-y-5 rounded-[2rem] border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-soft sm:p-6 xl:sticky xl:top-28 xl:self-start"
        style={{ "--delay": "120ms" }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            Order summary
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-ink dark:text-white sm:text-3xl">
            {cartItems.length} line items
          </h2>
        </div>

        <div className="space-y-4">
          {cartItems.map((line) => (
            <article key={line.id} className="rounded-3xl bg-stone-50 p-4">
              <div className="flex gap-3 sm:gap-4">
                <img
                  src={line.product.gallery[0]}
                  alt={line.product.name}
                  className="h-16 w-16 rounded-2xl object-cover sm:h-20 sm:w-20"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{line.product.name}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    Qty {line.quantity} - {formatMoney(line.product.price)}
                  </p>
                  {line.customizationFileName ? (
                    <p className="mt-2 truncate text-xs text-terracotta">
                      Artwork: {line.customizationFileName}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="rounded-3xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Tag size={16} className="text-terracotta" />
            Coupon card
          </div>
          <p className="mt-2 text-sm leading-7 text-stone-600">
            Use <span className="font-semibold text-ink">{TEST_COUPON_CODE}</span> to make the payable total ₹2 for testing.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={couponInput}
              onChange={(event) => setCouponInput(event.target.value)}
              placeholder="Enter coupon code"
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
            />
            <button
              type="button"
              onClick={applyCoupon}
              className="inline-flex items-center justify-center rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
            >
              Apply
            </button>
          </div>
          {hasTestCoupon ? (
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <span>
                Coupon <span className="font-semibold">{appliedCouponCode}</span> is active.
              </span>
              <button
                type="button"
                onClick={removeCoupon}
                className="inline-flex items-center gap-1 font-semibold text-emerald-800"
              >
                <X size={14} />
                Remove
              </button>
            </div>
          ) : null}
          {couponFeedback ? (
            <p className={`mt-4 rounded-2xl px-4 py-3 text-sm ${hasTestCoupon ? "bg-emerald-50 text-emerald-700" : "bg-stone-50 text-stone-600"
              }`}>
              {couponFeedback}
            </p>
          ) : null}
        </div>

        <div className="rounded-3xl border border-stone-200 p-5">
          <div className="flex items-center justify-between text-sm text-stone-500">
            <span>Subtotal</span>
            <span>{formatMoney(cartSubtotal)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-stone-500">
            <span>Delivery</span>
            <span>{formatMoney(deliveryFee)}</span>
          </div>
          {discountAmount > 0 ? (
            <div className="mt-3 flex items-center justify-between text-sm text-emerald-700">
              <span>Coupon discount</span>
              <span>-{formatMoney(discountAmount)}</span>
            </div>
          ) : null}
          <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
            <span className="text-sm font-semibold text-ink">Grand total</span>
            <span className="text-2xl font-semibold text-ink">{formatMoney(grandTotal)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
