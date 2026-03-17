"use client";
import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function NewsletterSidebar() {
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
        toast.success("Thanks for subscribing! 🎉");
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
    <div className="bg-gradient-to-br from-ink-900 to-ink-800 dark:from-ink-950 dark:to-ink-900 rounded-xl p-5 text-white">
      <h3 className="font-headline text-lg font-700 mb-2">
        Don&apos;t Miss a Story
      </h3>
      <p className="text-xs text-ink-400 mb-4 font-sans">
        Subscribe to our newsletter for daily updates.
      </p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full bg-ink-700 border border-ink-600 rounded px-3 py-2 pl-9 text-sm font-sans text-white placeholder-ink-400 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded text-sm font-sans font-600 transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
    </div>
  );
}
