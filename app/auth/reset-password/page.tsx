"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, CheckCircle2, AlertCircle, AlertTriangle, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline mismatch feedback while typing
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  useEffect(() => {
    if (!token) setError(null); // handled by early return below
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please check and try again.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/auth/login"), 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Could not reset password. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // No token in URL
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-ink-950 px-4">
        <div className="max-w-md w-full bg-white dark:bg-ink-900 rounded-2xl p-8 shadow-lg border border-stone-200 dark:border-stone-700 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-5">
            <AlertCircle className="w-9 h-9" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-ink-950 dark:text-white mb-3">
            Invalid Link
          </h1>
          <p className="text-ink-500 font-sans text-sm mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link href="/auth/forgot-password" className="btn-primary w-full flex items-center justify-center">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-ink-950 px-4">
        <div className="max-w-md w-full bg-white dark:bg-ink-900 rounded-2xl p-8 shadow-lg border border-stone-200 dark:border-stone-700 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-ink-950 dark:text-white mb-3">
            Password reset!
          </h1>
          <p className="text-ink-500 font-sans text-sm mb-6">
            Your password has been successfully updated. Redirecting you to the login page…
          </p>
          <Link href="/auth/login" className="btn-primary w-full flex items-center justify-center">
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-ink-950 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-ink-900 rounded-2xl p-8 shadow-lg border border-stone-200 dark:border-stone-700">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <span className="font-heading text-2xl font-black">
                A<span className="text-brand-500">to</span>Z
                <span className="font-sans font-light text-ink-500 ml-1">Blogs</span>
              </span>
            </Link>
            <h1 className="font-heading text-2xl font-bold text-ink-950 dark:text-white mb-2">
              Set New Password
            </h1>
            <p className="text-sm text-ink-500 font-sans">Must be at least 8 characters.</p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl p-4 flex gap-3 text-sm font-sans bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type={showPass ? "text" : "password"}
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder="New password"
                className="input-field pl-10 pr-10 font-mono"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                  placeholder="Confirm new password"
                  className={`input-field pl-10 font-mono ${mismatch ? "border-red-400 dark:border-red-500 focus:ring-red-400" : ""}`}
                  autoComplete="new-password"
                />
              </div>
              {mismatch && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-sans">
                  Passwords don&apos;t match yet.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || mismatch}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Resetting…</>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
