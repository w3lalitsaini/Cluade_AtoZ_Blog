"use client";
import { useState } from "react";
import {
  Mail,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { config } from "@/lib/config";
import toast from "react-hot-toast";

export default function SubscribePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const benefits = [
    "Weekly digest of the most important stories.",
    "Exclusive insights and expert analysis.",
    "Early access to special reports and features.",
    "Curated topics tailored to your interests.",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success("Welcome to the community! 🎉");
        setEmail("");
      } else {
        const data = await res.json();
        toast.error(data.error || data.message || "Something went wrong");
      }
    } catch {
      toast.error("Failed to subscribe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <div>
          <span className="inline-block bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            Join the community
          </span>
          <h1 className="font-heading text-4xl md:text-6xl font-black text-ink-950 dark:text-white leading-tight mb-8">
            Stay Ahead of the <span className="text-brand-500">Curve</span>.
          </h1>
          <p className="text-xl text-ink-600 dark:text-ink-400 font-body mb-10 leading-relaxed">
            Get the most important news, deep dives, and analysis delivered
            straight to your inbox every week. Join 50,000+ professionals who
            trust {config.siteName}.
          </p>

          <div className="space-y-4 mb-10">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-brand-500 shrink-0" />
                <span className="text-ink-700 dark:text-ink-300 font-sans">
                  {benefit}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 text-sm text-ink-500 font-sans border-t border-stone-100 dark:border-stone-800 pt-8">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <span>
              We respect your privacy. No spam, ever. Unsubscribe anytime.
            </span>
          </div>
        </div>

        {/* Right Content - Form Card */}
        <div className="relative">
          <div className="absolute -inset-4 bg-brand-500/10 rounded-[2.5rem] blur-2xl"></div>
          <div className="relative bg-white dark:bg-ink-900 p-8 md:p-12 rounded-[2rem] shadow-2xl border border-stone-100 dark:border-stone-800">
            <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-brand-500/30">
              <Mail className="w-8 h-8" />
            </div>

            <h2 className="font-heading text-2xl font-bold text-ink-950 dark:text-white mb-4">
              Get Started for Free
            </h2>
            <p className="text-ink-500 dark:text-ink-400 font-body mb-8">
              Enter your email address below to join our weekly newsletter.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-ink-400">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-stone-50 dark:bg-ink-800 border border-stone-200 dark:border-stone-700 rounded-xl px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? "Subscribing..." : "Subscribe Now"}
                {!loading && (
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-ink-400">
                By subscribing, you agree to our{" "}
                <a href="/terms" className="underline hover:text-brand-500">
                  Terms
                </a>{" "}
                and{" "}
                <a href="/privacy" className="underline hover:text-brand-500">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
