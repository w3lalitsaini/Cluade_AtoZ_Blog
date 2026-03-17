"use client";
import { useState } from "react";
import { Mail, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success("You're subscribed! Welcome aboard 🎉");
        setEmail("");
      } else {
        const data = await res.json();
        toast.error(data.error || data.message || "Something went wrong");
      }
    } catch {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="my-12 rounded-2xl overflow-hidden bg-gradient-to-r from-ink-950 via-ink-900 to-brand-950 relative">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-brand-500 blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-brand-700 blur-3xl translate-y-1/2 -translate-x-1/4" />
      </div>
      <div className="relative px-8 py-12 md:px-16 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-brand-400" />
          <span className="text-brand-400 text-sm font-bold uppercase tracking-widest">
            Newsletter
          </span>
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
          The World&apos;s Stories,
          <br />
          In Your Inbox
        </h2>
        <p className="text-ink-400 text-base mb-8 max-w-md mx-auto">
          Join over 50,000 readers who get our curated daily digest of the most
          important stories.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <div className="flex-1 relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="w-full pl-10 pr-4 py-3.5 bg-white/10 border border-white/20 text-white placeholder-ink-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 bg-brand-500 hover:bg-brand-400 text-white font-bold rounded-xl transition-colors text-sm whitespace-nowrap disabled:opacity-60"
          >
            {loading ? "Subscribing..." : "Subscribe Free →"}
          </button>
        </form>
        <p className="text-ink-500 text-xs mt-4">
          No spam. Unsubscribe anytime. Privacy guaranteed.
        </p>
      </div>
    </section>
  );
}
