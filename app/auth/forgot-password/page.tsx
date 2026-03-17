"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Could not send reset email. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-ink-950 px-4">
        <div className="max-w-md w-full bg-white dark:bg-ink-900 rounded-2xl p-8 shadow-lg border border-stone-200 dark:border-stone-700 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-ink-950 dark:text-white mb-3">
            Check your inbox
          </h1>
          <p className="text-ink-600 dark:text-ink-400 font-sans text-sm mb-2">
            We&apos;ve sent a password reset link to
          </p>
          <p className="font-semibold text-ink-900 dark:text-white mb-4">{email}</p>
          <p className="text-ink-500 font-sans text-xs mb-8">
            Didn&apos;t receive it? Check your spam folder. The link expires in 1 hour.
          </p>
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to login
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
                <span className="font-sans font-light text-ink-500 dark:text-ink-400 ml-1">Blogs</span>
              </span>
            </Link>
            <h1 className="font-heading text-2xl font-bold text-ink-950 dark:text-white mb-2">
              Forgot your password?
            </h1>
            <p className="text-sm text-ink-500 font-sans">
              No worries — we&apos;ll send you reset instructions.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl p-4 flex gap-3 text-sm font-sans bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder="name@example.com"
                className="input-field pl-10"
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          <div className="mt-6 text-center pt-5 border-t border-stone-100 dark:border-stone-800">
            <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-brand-500 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
