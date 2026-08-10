import { useState } from "react";
import { Link } from "react-router-dom";
import { resetPassword } from "../services/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await resetPassword(email);
      setSuccess("Reset link sent! Check your inbox.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 rounded-3xl shadow-soft">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-terracotta">Reset Password</h2>
          <p className="text-sm text-stone-500 mt-2">Enter your email to receive a recovery link</p>
        </div>

        {error && (
          <div className="mb-4 bg-stone-200 text-stone-950 dark:bg-stone-850 dark:text-stone-50 p-4 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100 p-4 rounded-2xl text-sm font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-stone-500">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-850 dark:text-stone-100 outline-none focus:border-terracotta"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-terracotta hover:bg-terracotta/90 text-white font-bold py-3 rounded-full transition duration-200 disabled:bg-stone-300"
          >
            {loading ? "Sending link..." : "Send Recovery Link"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-stone-500">
          Back to{" "}
          <Link to="/login" className="font-semibold text-terracotta hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
