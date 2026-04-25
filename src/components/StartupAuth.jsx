import {
  BadgeCheck,
  Mail,
  ShieldCheck,
  Smartphone,
  UserRound
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "../context/StoreContext";
import {
  formatPhoneForOtp,
  getLiveVerificationSetupMessage,
  getVerifiedVerificationProfile,
  getVerificationDeliveryTarget,
  isEmailVerificationEnabled,
  isPhoneVerificationEnabled,
  isVerificationMethodReady,
  sendVerificationCode,
  verifyVerificationCode
} from "../lib/liveVerification";

const initialForm = {
  name: "",
  gender: "",
  email: "",
  phone: "",
  verificationMethod: "email",
  code: ""
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_OTP_MIN_LENGTH = 6;
const EMAIL_OTP_MAX_LENGTH = 8;
const PHONE_OTP_LENGTH = 6;

const sanitizePhone = (value) => String(value || "").replace(/\D/g, "").slice(0, 10);

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

  useEffect(() => {
    let isCancelled = false;

    const restoreVerifiedSession = async () => {
      if (!isEmailVerificationEnabled) {
        return;
      }

      const { data, error } = await getVerifiedVerificationProfile();

      if (isCancelled || !data?.email) {
        if (!isCancelled && error) {
          setErrorMessage(error.message);
          setInfoMessage("");
        }
        return;
      }

      if (!data.name || !data.phone) {
        if (!isCancelled) {
          setInfoMessage(
            "Email verification returned successfully, but the profile details were incomplete. Enter your details again and request a fresh code."
          );
        }
        return;
      }

      const session = await signInCustomer({
        name: data.name,
        gender: data.gender,
        email: data.email,
        phone: data.phone,
        verifiedBy: "email"
      });

      if (isCancelled) {
        return;
      }

      if (!session) {
        setErrorMessage(
          "Email verification succeeded, but the storefront session could not be created. Try sending a fresh code."
        );
        setInfoMessage("");
        return;
      }

      setErrorMessage("");
      setInfoMessage("Email verification completed. Redirecting into the storefront.");
    };

    restoreVerifiedSession();

    return () => {
      isCancelled = true;
    };
  }, [signInCustomer]);

  const deliveryTarget = useMemo(
    () => getVerificationDeliveryTarget(form.verificationMethod, form),
    [form]
  );
  const verificationOptions = [
    {
      value: "email",
      label: "Email verification",
      copy: "Send a live code to the saved email address.",
      icon: Mail
    },
    ...(isPhoneVerificationEnabled
      ? [
        {
          value: "phone",
          label: "Mobile verification",
          copy: "Send a live OTP to the saved phone number.",
          icon: Smartphone
        }
      ]
      : [])
  ];
  const codeConstraints =
    form.verificationMethod === "phone"
      ? {
        min: PHONE_OTP_LENGTH,
        max: PHONE_OTP_LENGTH,
        label: "6-digit",
        placeholder: "6-digit code"
      }
      : {
        min: EMAIL_OTP_MIN_LENGTH,
        max: EMAIL_OTP_MAX_LENGTH,
        label: "6 to 8-digit",
        placeholder: "6 to 8-digit code"
      };
  const selectedGender = form.gender.trim().toLowerCase();
  const isMaleTheme = selectedGender === "male";
  const isFemaleTheme = selectedGender === "female";
  const pageClassName = isMaleTheme
    ? "relative overflow-hidden bg-[#120d0b] text-stone-100"
    : isFemaleTheme
      ? "relative overflow-hidden bg-[#fff2f8] text-ink"
      : "relative overflow-hidden bg-stone-50 text-ink dark:bg-stone-950 dark:text-stone-100";
  const pageStyle = isMaleTheme
    ? {
      backgroundColor: "#120d0b",
      backgroundImage:
        "radial-gradient(circle at 18% 18%, rgba(210,138,86,0.24), transparent 20%), radial-gradient(circle at 82% 12%, rgba(255,232,205,0.08), transparent 18%), radial-gradient(circle at 24% 82%, rgba(104,67,43,0.34), transparent 24%), linear-gradient(160deg, rgba(28,20,16,1), rgba(18,13,11,1) 52%, rgba(9,7,6,1))"
    }
    : isFemaleTheme
      ? {
        backgroundColor: "#fff2f8",
        backgroundImage:
          "radial-gradient(circle at 16% 14%, rgba(244,143,177,0.28), transparent 20%), radial-gradient(circle at 84% 16%, rgba(255,206,225,0.3), transparent 22%), radial-gradient(circle at 22% 84%, rgba(214,98,140,0.18), transparent 24%), linear-gradient(180deg, rgba(255,251,253,1), rgba(255,238,246,1))"
      }
      : undefined;
  const panelClassName = isMaleTheme
    ? "border-[#7b5337]/45 bg-[#1a1310]/95 text-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
    : isFemaleTheme
      ? "border-[#efbfd1] bg-[#fffafc] shadow-[0_30px_80px_rgba(217,104,149,0.14)]"
      : "border-[#ddcdbc] bg-[#fffaf3] dark:border-[#3a2d25] dark:bg-[#211915]";
  const panelStyle = isMaleTheme
    ? {
      backgroundImage:
        "linear-gradient(160deg, rgba(42,29,23,0.98), rgba(24,18,14,0.98))"
    }
    : isFemaleTheme
      ? {
        backgroundImage:
          "linear-gradient(160deg, rgba(255,252,253,0.98), rgba(255,244,248,0.98))"
      }
      : undefined;
  const eyebrowClassName = isMaleTheme
    ? "text-[#d1b299]"
    : isFemaleTheme
      ? "text-[#b55c84]"
      : "text-stone-500";
  const headingClassName = isMaleTheme
    ? "text-[#fff3e4]"
    : isFemaleTheme
      ? "text-[#6a2645]"
      : "text-ink dark:text-white";
  const bodyClassName = isMaleTheme
    ? "text-[#d8c2ae]"
    : isFemaleTheme
      ? "text-[#8a5d73]"
      : "text-stone-600 dark:text-stone-400";
  const fieldLabelClassName = isMaleTheme
    ? "text-[#fff3e4]"
    : isFemaleTheme
      ? "text-[#6a2645]"
      : "text-ink dark:text-white";
  const iconBadgeClassName = isMaleTheme
    ? "bg-[linear-gradient(135deg,#d28a56,#9e623d)] text-white shadow-lg shadow-[#d28a56]/20"
    : isFemaleTheme
      ? "bg-[linear-gradient(135deg,#f38cb5,#d86895)] text-white shadow-lg shadow-[#f38cb5]/25"
      : "bg-sand text-terracotta";
  const inputClassName = isMaleTheme
    ? "w-full rounded-2xl border border-[#7b5337]/50 bg-[#fff8ef] px-4 py-3 text-sm text-ink placeholder:text-[#9f8a78] outline-none transition focus:border-[#d28a56] focus:ring-2 focus:ring-[#d28a56]/15"
    : isFemaleTheme
      ? "w-full rounded-2xl border border-[#efbfd1] bg-[#fffafe] px-4 py-3 text-sm text-ink placeholder:text-[#b893a4] outline-none transition focus:border-[#e27ca6] focus:ring-2 focus:ring-[#e27ca6]/15"
      : "w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-ink placeholder:text-stone-400 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10";
  const selectClassName = isMaleTheme
    ? "w-full rounded-2xl border border-[#7b5337]/50 bg-[#fff8ef] px-4 py-3 text-sm text-ink outline-none transition focus:border-[#d28a56] focus:ring-2 focus:ring-[#d28a56]/15 appearance-none bg-no-repeat"
    : isFemaleTheme
      ? "w-full rounded-2xl border border-[#efbfd1] bg-[#fffafe] px-4 py-3 text-sm text-ink outline-none transition focus:border-[#e27ca6] focus:ring-2 focus:ring-[#e27ca6]/15 appearance-none bg-no-repeat"
      : "w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 appearance-none bg-no-repeat";
  const infoCardClassName = isMaleTheme
    ? "rounded-3xl border border-[#7b5337]/35 bg-[#241915]/88 p-5"
    : isFemaleTheme
      ? "rounded-3xl border border-[#efbfd1] bg-[#fff0f6] p-5"
      : "rounded-3xl border border-stone-200 bg-stone-50 p-5 dark:border-[#3a2d25] dark:bg-[#2a201a]";
  const actionCardClassName = isMaleTheme
    ? "rounded-3xl border border-[#7b5337]/35 bg-[#2a1d18]/92 p-5"
    : isFemaleTheme
      ? "rounded-3xl border border-[#efbfd1] bg-[#ffe6f1] p-5"
      : "rounded-3xl bg-sand p-5";
  const methodCardClassName = (isActive) => {
    if (isMaleTheme) {
      return isActive
        ? "border-[#d28a56] bg-[linear-gradient(135deg,#d28a56,#9e623d)] text-white shadow-lg shadow-[#d28a56]/20"
        : "border-[#7b5337]/35 bg-[#241915]/88 text-[#e3cdb8]";
    }

    if (isFemaleTheme) {
      return isActive
        ? "border-[#e27ca6] bg-[linear-gradient(135deg,#f38cb5,#d86895)] text-white shadow-lg shadow-[#f38cb5]/20"
        : "border-[#efbfd1] bg-white text-[#8a5d73]";
    }

    return isActive
      ? "border-stone-900 bg-stone-900 text-white"
      : "border-stone-200 bg-stone-50 text-stone-600";
  };
  const primaryButtonClassName = isMaleTheme
    ? "inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#d28a56,#9e623d)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-stone-500 disabled:text-white"
    : isFemaleTheme
      ? "inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#f38cb5,#d86895)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-[#d9a6bb]"
      : "inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400";
  const submitButtonClassName = isMaleTheme
    ? "inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#d28a56,#9e623d)] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-stone-500 disabled:text-white"
    : isFemaleTheme
      ? "inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#f38cb5,#d86895)] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-[#d9a6bb]"
      : "inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400";

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
    const trimmedGender = form.gender.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPhone = sanitizePhone(form.phone);

    if (!trimmedName || !trimmedGender || !trimmedEmail || !trimmedPhone) {
      return "Enter your name, gender, email, and mobile number to continue.";
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

    if (!isVerificationMethodReady(form.verificationMethod)) {
      setErrorMessage(getLiveVerificationSetupMessage(form.verificationMethod));
      setInfoMessage("");
      return;
    }

    setIsSendingCode(true);

    try {
      const { error, deliveryTarget: target } = await sendVerificationCode({
        name: form.name.trim(),
        gender: form.gender.trim(),
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
          : `Verification code sent to ${target || form.email.trim()}. Check your inbox and spam folder. If the email shows a link instead of digits, update the Supabase email template to use {{ .Token }}.`
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

    const trimmedCode = form.code.trim();
    if (
      trimmedCode.length < codeConstraints.min ||
      trimmedCode.length > codeConstraints.max
    ) {
      setErrorMessage(`Enter the ${codeConstraints.label} verification code.`);
      return;
    }

    if (!isVerificationMethodReady(form.verificationMethod)) {
      setErrorMessage(getLiveVerificationSetupMessage(form.verificationMethod));
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await verifyVerificationCode({
        email: form.email.trim(),
        phone: form.phone,
        verificationMethod: form.verificationMethod,
        code: trimmedCode
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      const session = await signInCustomer({
        name: form.name.trim(),
        gender: form.gender.trim(),
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
    <div
      className={`min-h-screen px-4 py-8 sm:px-6 lg:px-8 ${pageClassName}`}
      style={pageStyle}
    >
      {isMaleTheme ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 right-[-4rem] h-72 w-72 rounded-full bg-[#d28a56]/20 blur-3xl" />
          <div className="absolute bottom-[-4rem] left-[-3rem] h-80 w-80 rounded-full bg-[#6f4a32]/30 blur-3xl" />
          <div className="absolute left-1/2 top-24 h-px w-[60%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#d9a57d]/35 to-transparent" />
        </div>
      ) : null}
      {isFemaleTheme ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 right-[-3rem] h-72 w-72 rounded-full bg-[#f3a5c5]/28 blur-3xl" />
          <div className="absolute bottom-[-4rem] left-[-3rem] h-80 w-80 rounded-full bg-[#f9cadc]/34 blur-3xl" />
          <div className="absolute left-1/2 top-24 h-px w-[60%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#f3a5c5]/40 to-transparent" />
        </div>
      ) : null}
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center">
        <section
          className={`page-reveal-right w-full rounded-[2rem] border p-8 shadow-soft lg:p-10 ${panelClassName}`}
          style={panelStyle}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${eyebrowClassName}`}>
                Verify identity
              </p>
              <h1 className={`mt-2 text-3xl font-semibold ${headingClassName}`}>Name, mobile, email</h1>
              <p className={`mt-3 max-w-xl text-sm leading-7 ${bodyClassName}`}>
                Enter your details, request the verification code, then use it to continue into
                the store.
              </p>
            </div>
            <span className={`motion-float inline-flex h-12 w-12 items-center justify-center rounded-2xl ${iconBadgeClassName}`}>
              <UserRound size={20} />
            </span>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleVerify}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className={`mb-2 block text-sm font-semibold ${fieldLabelClassName}`}>Full name</span>
                <input
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Enter your full name"
                  className={inputClassName}
                />
              </label>

              <label className="block">
                <span className={`mb-2 block text-sm font-semibold ${fieldLabelClassName}`}>Gender</span>
                <select
                  value={form.gender}
                  onChange={(event) => updateField("gender", event.target.value)}
                  className={selectClassName}
                  style={{
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')`,
                    backgroundPosition: "right 1rem center",
                    paddingRight: "2.5rem",
                    colorScheme: "light"
                  }}
                >
                  <option value="" disabled style={{ color: "#7c6b61", backgroundColor: "#ffffff" }}>Select gender</option>
                  <option value="Male" style={{ color: "#241812", backgroundColor: "#ffffff" }}>Male</option>
                  <option value="Female" style={{ color: "#241812", backgroundColor: "#ffffff" }}>Female</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className={`mb-2 block text-sm font-semibold ${fieldLabelClassName}`}>Mobile number</span>
                <input
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="10-digit mobile"
                  className={inputClassName}
                />
              </label>

              <label className="block">
                <span className={`mb-2 block text-sm font-semibold ${fieldLabelClassName}`}>Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="you@example.com"
                  className={inputClassName}
                />
              </label>
            </div>

            {isPhoneVerificationEnabled ? (
              <div>
                <span className={`mb-3 block text-sm font-semibold ${fieldLabelClassName}`}>Verify with</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {verificationOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField("verificationMethod", option.value)}
                      className={`rounded-3xl border p-5 text-left transition ${methodCardClassName(
                        form.verificationMethod === option.value
                      )}`}
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
            ) : (
              <div className={infoCardClassName}>
                <div className={`flex items-center gap-2 ${fieldLabelClassName}`}>
                  <Mail size={18} />
                  <p className="text-base font-semibold">Email verification</p>
                </div>
                <p className={`mt-2 text-sm leading-6 ${bodyClassName}`}>
                  The website is using email OTP for verified entry. Mobile numbers are still
                  captured for orders and customer support.
                </p>
              </div>
            )}

            <div className={actionCardClassName}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className={`text-sm font-semibold ${fieldLabelClassName}`}>
                    {form.verificationMethod === "phone"
                      ? "Verify with mobile OTP"
                      : "Verify with email code"}
                  </p>
                  <p className={`mt-1 text-sm leading-6 ${bodyClassName}`}>
                    {deliveryTarget
                      ? `The code will be sent to ${form.verificationMethod === "phone"
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
                  className={primaryButtonClassName}
                >
                  {isSendingCode ? "Sending..." : sendButtonLabel}
                  <BadgeCheck size={16} />
                </button>
              </div>
            </div>

            <label className="block">
              <span className={`mb-2 block text-sm font-semibold ${fieldLabelClassName}`}>
                Enter verification code
              </span>
              <input
                inputMode="numeric"
                value={form.code}
                onChange={(event) =>
                  updateField("code", event.target.value.replace(/\D/g, "").slice(0, codeConstraints.max))
                }
                placeholder={codeConstraints.placeholder}
                className={inputClassName}
              />
            </label>

            {form.verificationMethod === "email" ? (
              <p className={`rounded-2xl px-4 py-3 text-sm leading-6 ${isMaleTheme
                ? "bg-white/5 text-stone-300"
                : isFemaleTheme
                  ? "bg-[#fff0f6] text-[#7a5a68]"
                  : "bg-stone-50 text-stone-600 dark:bg-[#2a201a] dark:text-stone-400"
                }`}>
                Supabase email codes are manual digits only when the email template uses
                {" "}
                <span className={`font-semibold ${headingClassName}`}>{`{{ .Token }}`}</span>.
                If you receive a "Confirm your signup" link instead, change the Supabase email template.
              </p>
            ) : null}

            {isPhoneVerificationEnabled ? <div id="recaptcha-container"></div> : null}

            {!isVerificationMethodReady(form.verificationMethod) ? (
              <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {getLiveVerificationSetupMessage(form.verificationMethod)}
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
              className={submitButtonClassName}
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
