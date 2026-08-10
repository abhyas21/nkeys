import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { signIn, getProfile } from "../services/auth";
import { isAdminEmail } from "../lib/auth";
import { supabase } from "../services/supabase";

const withTimeout = (request, message = "Verification is taking too long. Check your internet connection and try again.") =>
  Promise.race([
    request,
    new Promise((_, reject) => window.setTimeout(() => reject(new Error(message)), 10000))
  ]);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get("redirect");

  // OTP Login states
  const [loginMethod, setLoginMethod] = useState("password"); // "password" | "otp"
  const [otpStep, setOtpStep] = useState(1); // 1: Send email, 2: Enter code
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [otpMsg, setOtpMsg] = useState("");

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { user } = await withTimeout(signIn({ email, password }), "Login timed out. Check your internet connection and try again.");
      
      let profile = null;
      try {
        profile = await getProfile(user.id);
      } catch (err) {
        console.warn("Profile fetch failed, defaulting to customer role:", err);
      }
      
      if (redirectTarget) {
        navigate(redirectTarget);
      } else if (isAdminEmail(email) || (profile && profile.role === "admin")) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");
    setOtpMsg("");

    try {
      const { error: otpErr } = await withTimeout(supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true
        }
      }));
      if (otpErr) throw otpErr;

      setOtpStep(2);
      setCountdown(30);
      setOtpMsg("A 6-digit verification code has been sent to your email.");
    } catch (err) {
      console.error("OTP send error:", err);
      setError(err.message || "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: verifyErr } = await withTimeout(supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "email"
      }));
      if (verifyErr) throw verifyErr;

      navigate(redirectTarget || "/profile");
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return;
    
    setLoading(true);
    setError("");
    setOtpMsg("");

    try {
      const { error: otpErr } = await supabase.auth.signInWithOtp({ email });
      if (otpErr) throw otpErr;

      setCountdown(30);
      setOtpMsg("A new verification code has been sent to your email.");
    } catch (err) {
      console.error("OTP resend error:", err);
      setError(err.message || "Failed to resend verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-955 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-stone-900 border border-stone-205 dark:border-stone-850 p-8 rounded-3xl shadow-soft">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-stone-950 dark:text-stone-50">Welcome Back</h2>
          <p className="text-sm text-stone-500 mt-2">Log in to manage your NKeys orders</p>
        </div>

        {/* Tab Switching Menu */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 mb-6">
          <button
            onClick={() => { setLoginMethod("password"); setError(""); setOtpMsg(""); }}
            className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              loginMethod === "password"
                ? "border-stone-950 text-stone-950 dark:border-white dark:text-white"
                : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            Password Log In
          </button>
          <button
            onClick={() => { setLoginMethod("otp"); setError(""); setOtpMsg(""); }}
            className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              loginMethod === "otp"
                ? "border-stone-950 text-stone-950 dark:border-white dark:text-white"
                : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            Email OTP Code
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-stone-100 text-stone-950 dark:bg-stone-850 dark:text-stone-50 p-4 rounded-2xl text-xs font-semibold border border-stone-200 dark:border-stone-800">
            {error}
          </div>
        )}

        {otpMsg && (
          <div className="mb-4 bg-stone-50 text-stone-700 dark:bg-stone-850 dark:text-stone-200 p-4 rounded-2xl text-xs font-semibold border border-stone-150 dark:border-stone-800">
            {otpMsg}
          </div>
        )}

        {/* Method 1: Password Login Form */}
        {loginMethod === "password" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-stone-500">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-850 dark:text-stone-100 outline-none focus:border-stone-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-stone-500">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-850 dark:text-stone-100 outline-none focus:border-stone-400"
              />
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-xs font-semibold text-stone-600 dark:text-stone-400 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-950 hover:bg-stone-850 text-white dark:bg-white dark:text-stone-950 font-bold py-3 rounded-full transition duration-200 disabled:bg-stone-300"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
        )}

        {/* Method 2: OTP Login Flow */}
        {loginMethod === "otp" && (
          <>
            {otpStep === 1 ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-stone-500">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-850 dark:text-stone-100 outline-none focus:border-stone-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-stone-950 hover:bg-stone-850 text-white dark:bg-white dark:text-stone-950 font-bold py-3 rounded-full transition duration-200 disabled:bg-stone-300"
                >
                  {loading ? "Sending Code..." : "Send Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-stone-500 text-xs mb-1 font-semibold flex items-center justify-between">
                  <span>Sending to: <strong className="text-stone-900 dark:text-stone-100">{email}</strong></span>
                  <button
                    type="button"
                    onClick={() => { setOtpStep(1); setOtpCode(""); setError(""); setOtpMsg(""); }}
                    className="text-stone-900 dark:text-stone-100 underline font-bold uppercase tracking-wider text-[10px]"
                  >
                    Change
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-stone-500">6-Digit Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-center font-mono text-lg tracking-widest text-stone-900 dark:border-stone-700 dark:bg-stone-850 dark:text-stone-100 outline-none focus:border-stone-400"
                  />
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || loading}
                    className="font-bold text-stone-600 dark:text-stone-400 hover:underline disabled:text-stone-300 disabled:no-underline"
                  >
                    {countdown > 0 ? `Resend Code (${countdown}s)` : "Resend Code"}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-stone-950 hover:bg-stone-850 text-white dark:bg-white dark:text-stone-950 font-bold py-3 rounded-full transition duration-200 disabled:bg-stone-300"
                >
                  {loading ? "Verifying..." : "Verify & Log In"}
                </button>
              </form>
            )}
          </>
        )}

        <div className="text-center mt-6 text-sm text-stone-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-stone-950 dark:text-white hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
