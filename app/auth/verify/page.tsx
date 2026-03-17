"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token was provided. Please use the link from your email.");
      return;
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Your email has been verified.");
        } else {
          setStatus("error");
          setMessage(data.message || "This verification link is invalid or has expired.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-ink-950 px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-block mb-8">
          <span className="font-heading text-3xl font-black text-ink-950 dark:text-white">
            A<span className="text-brand-500">to</span>Z
            <span className="font-sans font-light text-ink-500 ml-1 text-2xl">Blogs</span>
          </span>
        </Link>

        <div className="bg-white dark:bg-ink-900 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 p-8">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-ink-900 dark:text-white mb-2">
                Verifying your email…
              </h1>
              <p className="text-ink-500 font-sans text-sm">Please wait a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-ink-900 dark:text-white mb-2">
                Email Verified!
              </h1>
              <p className="text-ink-500 font-sans text-sm mb-6">{message}</p>
              <Link href="/auth/login" className="btn-primary w-full flex items-center justify-center">
                Sign In Now
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
                <XCircle className="w-9 h-9 text-red-500" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-ink-900 dark:text-white mb-2">
                Verification Failed
              </h1>
              <p className="text-ink-500 font-sans text-sm mb-6">{message}</p>
              <div className="space-y-3">
                <Link href="/auth/register" className="btn-primary w-full flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" /> Register Again
                </Link>
                <Link href="/auth/login" className="btn-secondary w-full flex items-center justify-center">
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
