"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Mail, Lock, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please check and try again.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-ink-950 px-4 py-12">
        <div className="w-full max-w-md text-center">
          <Link href="/">
            <span className="font-heading text-3xl font-black text-ink-950 dark:text-white">
              A<span className="text-brand-500">to</span>Z
              <span className="font-sans font-light text-ink-500 ml-1 text-2xl">Blogs</span>
            </span>
          </Link>
          <div className="mt-8 bg-white dark:bg-ink-900 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 p-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-5">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-ink-900 dark:text-white mb-3">
              Account created!
            </h1>
            <p className="font-sans text-ink-500 text-sm mb-2">
              We&apos;ve sent a verification email to
            </p>
            <p className="font-sans text-ink-900 dark:text-white font-semibold mb-4">
              {form.email}
            </p>
            <p className="font-sans text-ink-500 text-sm mb-6">
              Please open the email and click <strong>Verify Email</strong> before signing in. Check your spam folder if you don&apos;t see it.
            </p>
            <Link
              href="/auth/login"
              className="btn-primary w-full flex items-center justify-center"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-ink-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-heading text-3xl font-black text-ink-950 dark:text-white">
              A<span className="text-brand-500">to</span>Z
              <span className="font-sans font-light text-ink-500 ml-1 text-2xl">Blogs</span>
            </span>
          </Link>
          <h1 className="font-heading text-2xl font-bold text-ink-900 dark:text-white mt-4">
            Create your account
          </h1>
          <p className="font-sans text-ink-500 mt-1">Join thousands of readers</p>
        </div>

        <div className="bg-white dark:bg-ink-900 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 p-8">
          {/* Inline Error */}
          {error && (
            <div className="mb-5 rounded-xl p-4 flex gap-3 text-sm font-sans bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                placeholder="Full name"
                className="input-field pl-10"
                required
                minLength={2}
                autoComplete="name"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="Email address"
                className="input-field pl-10"
                required
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="Password (min. 8 characters)"
                className="input-field pl-10 pr-10"
                required
                minLength={8}
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

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type={showPass ? "text" : "password"}
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                placeholder="Confirm password"
                className="input-field pl-10"
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center font-sans text-xs text-ink-400 mt-4">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="text-brand-500">Terms</Link> and{" "}
            <Link href="/privacy" className="text-brand-500">Privacy Policy</Link>
          </p>

          <p className="text-center font-sans text-sm text-ink-500 mt-4">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-brand-500 hover:text-brand-600 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
