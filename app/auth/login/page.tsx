"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Loader2, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";

type AlertType = "error" | "unverified" | null;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.ok) {
      router.refresh();
      router.push("/");
      return;
    }

    const errCode = res?.error ?? "";
    if (errCode.includes("email-not-verified") || errCode === "email-not-verified") {
      setAlert({ type: "unverified", message: "Your email address hasn't been verified yet. Please check your inbox for the verification link." });
    } else {
      setAlert({ type: "error", message: "Invalid email or password. Please try again." });
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setResent(true);
    } catch {
      // silently fail — user still sees the alert
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-ink-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-heading text-3xl font-black text-ink-950 dark:text-white">
              A<span className="text-brand-500">to</span>Z
              <span className="font-sans font-light text-ink-500 ml-1 text-2xl">Blogs</span>
            </span>
          </Link>
          <h1 className="font-heading text-2xl font-bold text-ink-900 dark:text-white mt-4">
            Welcome back
          </h1>
          <p className="font-sans text-ink-500 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white dark:bg-ink-900 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 p-8">
          {/* Inline Alert */}
          {alert && (
            <div
              className={`mb-6 rounded-xl p-4 flex gap-3 text-sm font-sans ${
                alert.type === "unverified"
                  ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300"
                  : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400"
              }`}
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{alert.message}</p>
                {alert.type === "unverified" && (
                  <button
                    onClick={handleResend}
                    disabled={resending || resent}
                    className="mt-2 inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium hover:underline disabled:opacity-60"
                  >
                    {resent ? (
                      <><CheckCircle2 className="w-3.5 h-3.5" /> Verification email resent!</>
                    ) : resending ? (
                      <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Resending...</>
                    ) : (
                      <><RefreshCw className="w-3.5 h-3.5" /> Resend verification email</>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setAlert(null); }}
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
                value={password}
                onChange={(e) => { setPassword(e.target.value); setAlert(null); }}
                placeholder="Password"
                className="input-field pl-10 pr-10"
                required
                autoComplete="current-password"
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

            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="font-sans text-sm text-brand-500 hover:text-brand-600"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center font-sans text-sm text-ink-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-brand-500 hover:text-brand-600 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
