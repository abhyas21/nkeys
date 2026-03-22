import {
  BadgeCheck,
  Mail,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  UserRound
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "../context/StoreContext";
import {
  formatPhoneForOtp,
  getLiveVerificationSetupMessage,
  getVerificationDeliveryTarget,
  isLiveVerificationConfigured,
  sendVerificationCode,
  verifyVerificationCode
} from "../lib/liveVerification";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  verificationMethod: "email",
  code: ""
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizePhone = (value) => String(value || "").replace(/\D/g, "").slice(0, 10);

const verificationHighlights = [
  "Name, mobile, and email captured in one step",
  "Live code delivery through Supabase Auth",
  "Same verified entry for customers and owner"
];

export default function StartupAuth() {
  const { signInCustomer } = useStore();
  const [form, setForm] = useState(initialForm);
  const [verificationSent, setVerificationSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (!cooldownSeconds) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldownSeconds]);

  const deliveryTarget = useMemo(
    () => getVerificationDeliveryTarget(form.verificationMethod, form),
    [form]
  );

  const sendButtonLabel = cooldownSeconds
    ? `Resend in ${cooldownSeconds}s`
    : verificationSent
      ? "Resend code"
      : "Send code";

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: field === "phone" ? sanitizePhone(value) : value
    }));

    if (field !== "code") {
      setVerificationSent(false);
      setInfoMessage("");
      setErrorMessage("");
    }
  };

  const validateDetails = () => {
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPhone = sanitizePhone(form.phone);

    if (!trimmedName || !trimmedEmail || !trimmedPhone) {
      return "Enter your name, email, and mobile number to continue.";
    }

    if (!emailPattern.test(trimmedEmail)) {
      return "Enter a valid email address.";
    }

    if (trimmedPhone.length !== 10) {
      return "Enter a valid 10-digit mobile number.";
    }

    return "";
  };

  const handleSendCode = async () => {
    const validationMessage = validateDetails();
    if (validationMessage) {
      setErrorMessage(validationMessage);
      setInfoMessage("");
      return;
    }

    if (!isLiveVerificationConfigured) {
      setErrorMessage(getLiveVerificationSetupMessage());
      setInfoMessage("");
      return;
    }

    setIsSendingCode(true);

    try {
      const { error, deliveryTarget: target } = await sendVerificationCode({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone,
        verificationMethod: form.verificationMethod
      });

      if (error) {
        setErrorMessage(error.message);
        setInfoMessage("");
        return;
      }

      setVerificationSent(true);
      setErrorMessage("");
      setCooldownSeconds(30);
      setForm((current) => ({ ...current, code: "" }));
      setInfoMessage(
        form.verificationMethod === "phone"
          ? `OTP sent to ${target || formatPhoneForOtp(form.phone)}. Enter the SMS code to continue.`
          : `Verification code sent to ${target || form.email.trim()}. Check your inbox and spam folder.`
      );
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    const validationMessage = validateDetails();
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    if (!verificationSent) {
      setErrorMessage("Send the verification code first.");
      return;
    }

    if (form.code.trim().length < 6) {
      setErrorMessage("Enter the 6-digit verification code.");
      return;
    }

    if (!isLiveVerificationConfigured) {
      setErrorMessage(getLiveVerificationSetupMessage());
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await verifyVerificationCode({
        email: form.email.trim(),
        phone: form.phone,
        verificationMethod: form.verificationMethod,
        code: form.code.trim()
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      const session = await signInCustomer({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone,
        verifiedBy: form.verificationMethod
      });

      if (!session) {
        setErrorMessage("The session could not be created after verification. Try again.");
        return;
      }

      setErrorMessage("");
      setInfoMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="page-reveal flex flex-col justify-between rounded-[2rem] border border-stone-200 bg-white p-8 shadow-soft lg:p-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full bg-sand px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-600">
              <Store size={14} className="text-terracotta" />
              Login to enter NKeys
            </div>

            <div className="space-y-4">
              <h1 className="max-w-2xl font-sans text-4xl font-semibold leading-tight text-ink md:text-5xl">
                Start with a verified login before entering the store.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-stone-600 md:text-lg">
                Enter your name, phone number, and email once. Then request a live verification
                code through email or SMS and use that code to open the storefront.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {verificationHighlights.map((item) => (
                <article key={item} className="lift-card rounded-3xl bg-sand p-5">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-terracotta shadow-sm">
                    <Sparkles size={18} />
                  </span>
                  <p className="mt-4 text-sm leading-7 text-stone-700">{item}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-[1.8rem] border border-stone-200 bg-stone-950 p-6 text-white">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-300">
              <ShieldCheck size={14} />
              Verification
            </div>
            <p className="mt-3 text-lg font-semibold">
              {isLiveVerificationConfigured
                ? "Live email and SMS verification is active."
                : "Live verification setup is still required."}
            </p>
            <p className="mt-3 text-sm leading-7 text-stone-300">
              {isLiveVerificationConfigured
                ? "Codes are sent by Supabase Auth and verified before the storefront unlocks."
                : "Add your Supabase keys, enable email OTP, and connect an SMS provider to send real verification codes."}
            </p>
          </div>
        </section>

        <section
          className="page-reveal-right rounded-[2rem] border border-stone-200 bg-white p-8 shadow-soft lg:p-10"
          style={{ "--delay": "120ms" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                Verify identity
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-ink">Name, mobile, email</h2>
            </div>
            <span className="motion-float inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sand text-terracotta">
              <UserRound size={20} />
            </span>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleVerify}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">Full name</span>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">Mobile number</span>
                <input
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="10-digit mobile"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
                />
              </label>
            </div>

            <div>
              <span className="mb-3 block text-sm font-semibold text-ink">Verify with</span>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    value: "email",
                    label: "Email verification",
                    copy: "Send a live code to the saved email address.",
                    icon: Mail
                  },
                  {
                    value: "phone",
                    label: "Mobile verification",
                    copy: "Send a live OTP to the saved phone number.",
                    icon: Smartphone
                  }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField("verificationMethod", option.value)}
                    className={`rounded-3xl border p-5 text-left transition ${
                      form.verificationMethod === option.value
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 bg-stone-50 text-stone-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <option.icon size={18} />
                      <p className="text-base font-semibold">{option.label}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 opacity-90">{option.copy}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-sand p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {form.verificationMethod === "phone"
                      ? "Verify with mobile OTP"
                      : "Verify with email code"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    {deliveryTarget
                      ? `The code will be sent to ${
                          form.verificationMethod === "phone"
                            ? deliveryTarget
                            : form.email.trim().toLowerCase()
                        }.`
                      : "Complete your details first, then send the code."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isSendingCode || isSubmitting || Boolean(cooldownSeconds)}
                  className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
                >
                  {isSendingCode ? "Sending..." : sendButtonLabel}
                  <BadgeCheck size={16} />
                </button>
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">Enter verification code</span>
              <input
                inputMode="numeric"
                value={form.code}
                onChange={(event) =>
                  updateField("code", event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="6-digit code"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
              />
            </label>

            {!isLiveVerificationConfigured ? (
              <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {getLiveVerificationSetupMessage()}
              </p>
            ) : null}

            {infoMessage ? (
              <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {infoMessage}
              </p>
            ) : null}

            {errorMessage ? (
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || isSendingCode}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
            >
              {isSubmitting ? "Verifying..." : "Verify and enter store"}
              <ShieldCheck size={16} />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
