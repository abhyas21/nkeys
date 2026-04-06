import { normalizeEmail } from "./auth";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { firebaseApp } from "./firebase";
import { isSupabaseConfigured, supabase } from "./supabase";

const DEFAULT_COUNTRY_CODE = import.meta.env.VITE_DEFAULT_COUNTRY_CODE || "+91";
const PHONE_OTP_ENABLED_VALUES = new Set(["1", "true", "yes", "on"]);
const PHONE_OTP_ENV = String(import.meta.env.VITE_ENABLE_PHONE_OTP || "").trim().toLowerCase();

const normalizePhoneDigits = (value) => String(value || "").replace(/\D/g, "").slice(-10);

export const isPhoneVerificationEnabled = PHONE_OTP_ENABLED_VALUES.has(PHONE_OTP_ENV);
export const isEmailVerificationEnabled = Boolean(isSupabaseConfigured && supabase);
export const isPhoneVerificationConfigured = Boolean(
  isPhoneVerificationEnabled && firebaseApp?.options?.apiKey && firebaseApp?.options?.authDomain
);
export const isLiveVerificationConfigured =
  isEmailVerificationEnabled || isPhoneVerificationConfigured;

let confirmationResult = null;

const buildUserMetadata = ({ name, email, phone }) => ({
  name: String(name || "").trim(),
  email: normalizeEmail(email),
  phone: normalizePhoneDigits(phone)
});

const mapEmailAuthError = (error, phase) => {
  const fallback =
    phase === "send"
      ? "The email verification code could not be sent right now."
      : "The verification code could not be confirmed. Try again.";
  const message = String(error?.message || "").trim();

  if (!message) {
    return fallback;
  }

  const normalized = message.toLowerCase();

  if (normalized.includes("rate limit")) {
    return "Too many verification attempts were made. Wait a minute and try again.";
  }

  if (
    normalized.includes("email provider") ||
    normalized.includes("email logins are disabled") ||
    normalized.includes("email signups are disabled")
  ) {
    return "Enable email OTP in Supabase Auth before using email verification.";
  }

  if (normalized.includes("invalid token") || normalized.includes("token has expired")) {
    return "The verification code is invalid or expired. Request a fresh code and try again.";
  }

  return message;
};

const mapPhoneAuthError = (error, phase) => {
  const fallback =
    phase === "send"
      ? "The mobile OTP could not be sent right now."
      : "The verification code is invalid or expired. Please request a new code.";
  const message = String(error?.message || "").trim();

  if (!message) {
    return fallback;
  }

  const normalized = message.toLowerCase();

  if (normalized.includes("too-many-requests") || normalized.includes("quota")) {
    return "Too many OTP attempts were made. Wait a minute and try again.";
  }

  if (normalized.includes("invalid-phone-number")) {
    return "Enter a valid phone number with the correct country code.";
  }

  if (normalized.includes("captcha") || normalized.includes("recaptcha")) {
    return "The security check could not be completed. Refresh the page and try again.";
  }

  return message;
};

export function getLiveVerificationSetupMessage(verificationMethod = "email") {
  if (verificationMethod === "phone") {
    return isPhoneVerificationEnabled
      ? "Enable Firebase Phone Authentication in your Firebase project to use mobile OTP."
      : "Mobile OTP is turned off for this storefront. Set VITE_ENABLE_PHONE_OTP=true to enable it.";
  }

  return "Live email verification needs Supabase Auth plus email OTP enabled.";
}

export function isVerificationMethodReady(verificationMethod) {
  return verificationMethod === "phone"
    ? isPhoneVerificationConfigured
    : isEmailVerificationEnabled;
}

export function formatPhoneForOtp(phone) {
  const digits = normalizePhoneDigits(phone);
  if (!digits) {
    return "";
  }

  return `${DEFAULT_COUNTRY_CODE}${digits}`;
}

export function getVerificationDeliveryTarget(verificationMethod, { email, phone }) {
  return verificationMethod === "phone" ? formatPhoneForOtp(phone) : normalizeEmail(email);
}

function initRecaptcha() {
  if (typeof window === "undefined") {
    return null;
  }

  const recaptchaContainer = document.getElementById("recaptcha-container");
  if (!recaptchaContainer) {
    return null;
  }

  const auth = getAuth(firebaseApp);
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
  }

  return window.recaptchaVerifier;
}

export async function sendVerificationCode({ name, email, phone, verificationMethod }) {
  if (verificationMethod === "phone") {
    if (!isVerificationMethodReady("phone")) {
      return {
        error: new Error(getLiveVerificationSetupMessage("phone"))
      };
    }

    const formattedPhone = formatPhoneForOtp(phone);
    const verifier = initRecaptcha();
    if (!verifier) {
      return {
        error: new Error("The mobile OTP security check could not start. Refresh the page and try again.")
      };
    }

    try {
      const auth = getAuth(firebaseApp);
      confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);

      return {
        error: null,
        deliveryTarget: formattedPhone
      };
    } catch (error) {
      console.error("Firebase OTP send error:", error);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId) => {
          if (window.grecaptcha) {
            window.grecaptcha.reset(widgetId);
          }
        }).catch(() => {});
      }

      return {
        error: new Error(mapPhoneAuthError(error, "send"))
      };
    }
  }

  if (!isVerificationMethodReady("email")) {
    return {
      error: new Error(getLiveVerificationSetupMessage("email"))
    };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizeEmail(email),
    options: {
      shouldCreateUser: true,
      data: buildUserMetadata({ name, email, phone })
    }
  });

  if (error) {
    return {
      error: new Error(mapEmailAuthError(error, "send"))
    };
  }

  return {
    error: null,
    deliveryTarget: normalizeEmail(email)
  };
}

export async function verifyVerificationCode({ email, verificationMethod, code }) {
  if (verificationMethod === "phone") {
    if (!isVerificationMethodReady("phone")) {
      return {
        error: new Error(getLiveVerificationSetupMessage("phone"))
      };
    }

    if (!confirmationResult) {
      return {
        error: new Error("Please request a code first before verifying.")
      };
    }

    try {
      const result = await confirmationResult.confirm(String(code || "").trim());
      return {
        data: result.user,
        error: null
      };
    } catch (error) {
      console.error("Firebase OTP verify error:", error);
      return {
        data: null,
        error: new Error(mapPhoneAuthError(error, "verify"))
      };
    }
  }

  if (!isVerificationMethodReady("email")) {
    return {
      error: new Error(getLiveVerificationSetupMessage("email"))
    };
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email: normalizeEmail(email),
    token: String(code || "").trim(),
    type: "email"
  });

  if (error) {
    return {
      data: null,
      error: new Error(mapEmailAuthError(error, "verify"))
    };
  }

  return {
    data,
    error: null
  };
}
