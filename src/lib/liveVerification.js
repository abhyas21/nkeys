import { normalizeEmail } from "./auth";
import { isSupabaseConfigured, supabase } from "./supabase";

const DEFAULT_COUNTRY_CODE = import.meta.env.VITE_DEFAULT_COUNTRY_CODE || "+91";

const normalizePhoneDigits = (value) => String(value || "").replace(/\D/g, "").slice(-10);

const mapAuthError = (error, verificationMethod, phase) => {
  const fallback =
    phase === "send"
      ? verificationMethod === "phone"
        ? "The mobile OTP could not be sent right now."
        : "The email verification code could not be sent right now."
      : "The verification code could not be confirmed. Try again.";
  const message = String(error?.message || "").trim();

  if (!message) {
    return fallback;
  }

  const normalized = message.toLowerCase();

  if (normalized.includes("rate limit")) {
    return "Too many verification attempts were made. Wait a minute and try again.";
  }

  if (normalized.includes("phone provider") || normalized.includes("sms provider")) {
    return "Enable an SMS provider in Supabase Auth before using mobile OTP.";
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

export const isLiveVerificationConfigured = Boolean(isSupabaseConfigured && supabase);

export function getLiveVerificationSetupMessage() {
  return "Live verification needs Supabase Auth plus enabled email and SMS providers.";
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

const buildUserMetadata = ({ name, email, phone }) => ({
  name: String(name || "").trim(),
  email: normalizeEmail(email),
  phone: normalizePhoneDigits(phone)
});

export async function sendVerificationCode({ name, email, phone, verificationMethod }) {
  if (!isLiveVerificationConfigured) {
    return {
      error: new Error(getLiveVerificationSetupMessage())
    };
  }

  const userMetadata = buildUserMetadata({ name, email, phone });
  const request =
    verificationMethod === "phone"
      ? {
          phone: formatPhoneForOtp(phone),
          options: {
            shouldCreateUser: true,
            channel: "sms",
            data: userMetadata
          }
        }
      : {
          email: normalizeEmail(email),
          options: {
            shouldCreateUser: true,
            data: userMetadata
          }
        };

  const { error } = await supabase.auth.signInWithOtp(request);

  if (error) {
    return {
      error: new Error(mapAuthError(error, verificationMethod, "send"))
    };
  }

  return {
    error: null,
    deliveryTarget: getVerificationDeliveryTarget(verificationMethod, { email, phone })
  };
}

export async function verifyVerificationCode({ email, phone, verificationMethod, code }) {
  if (!isLiveVerificationConfigured) {
    return {
      error: new Error(getLiveVerificationSetupMessage())
    };
  }

  const request =
    verificationMethod === "phone"
      ? {
          phone: formatPhoneForOtp(phone),
          token: String(code || "").trim(),
          type: "sms"
        }
      : {
          email: normalizeEmail(email),
          token: String(code || "").trim(),
          type: "email"
        };

  const { data, error } = await supabase.auth.verifyOtp(request);

  if (error) {
    return {
      data: null,
      error: new Error(mapAuthError(error, verificationMethod, "verify"))
    };
  }

  return {
    data,
    error: null
  };
}
