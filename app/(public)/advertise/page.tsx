"use client";
import { useState } from "react";
import {
  BarChart3,
  Target,
  MousePointer2,
  Megaphone,
  Loader2,
} from "lucide-react";
import { config } from "@/lib/config";
import toast from "react-hot-toast";
import AdUnit from "@/components/ads/AdUnit";

export default function AdvertisePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const stats = [
    { label: "Monthly Readers", value: "2.5M+", icon: MousePointer2 },
    { label: "Newsletter Subscribers", value: "50K+", icon: Megaphone },
    { label: "Avg. Time on Site", value: "3:45", icon: Target },
    { label: "Audience Growth", value: "15% MoM", icon: BarChart3 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          subject: "Advertising Inquiry",
          type: "advertising",
        }),
      });
      if (res.ok) {
        toast.success("Inquiry sent! Our team will contact you soon.");
        setFormData({ name: "", email: "", message: "" });
      } else {
        toast.error("Failed to send inquiry");
      }
    } catch {
      toast.error("Error sending inquiry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-24">
      <AdUnit position="header" className="mb-12" />
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="font-heading text-4xl md:text-6xl font-black text-ink-950 dark:text-white mb-6">
          Reach Your <span className="text-brand-500">Audience</span>.
        </h1>
        <p className="text-xl text-ink-600 dark:text-ink-400 font-body leading-relaxed">
          Partner with {config.siteName} to connect your brand with a highly
          engaged community of tech enthusiasts, professionals, and
          decision-makers.
        </p>
      </div>

      <div className="my-16">
        <AdUnit position="in-article" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-8 rounded-3xl bg-white dark:bg-ink-900 border border-stone-100 dark:border-stone-800 shadow-xl shadow-stone-200/50 dark:shadow-none text-center"
          >
            <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400 mx-auto mb-6">
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="font-heading text-3xl font-black text-ink-950 dark:text-white mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-ink-500 dark:text-ink-400 font-sans uppercase tracking-widest font-bold">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="my-16">
        <AdUnit position="between-paragraphs" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <h2 className="font-heading text-3xl font-bold text-ink-900 dark:text-white">
            Why Advertise With Us?
          </h2>
          <div className="space-y-6 prose prose-lg dark:prose-invert">
            <p className="text-ink-600 dark:text-ink-400">
              Our readers are early adopters, industry leaders, and tech-savvy
              individuals who actively seek out new products and services. By
              advertising with {config.siteName}, you&apos;re not just buying
              impressions; you&apos;re building authority in a trusted
              environment.
            </p>
            <ul className="space-y-4 font-body text-ink-700 dark:text-ink-300">
              <li>
                <strong>Native Advertising:</strong> Seamlessly integrated
                sponsored content that provides value.
              </li>
              <li>
                <strong>Display Ads:</strong> High-impact placements across our
                most-visited categories.
              </li>
              <li>
                <strong>Newsletter Sponsorship:</strong> Reach our most loyal
                readers directly in their inbox.
              </li>
              <li>
                <strong>Custom Solutions:</strong> Tailored partnerships built
                to meet your specific goals.
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-ink-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10">
            <h3 className="font-heading text-2xl font-bold mb-6">
              Request a Media Kit
            </h3>
            <p className="text-ink-300 mb-8 font-body leading-relaxed">
              Ready to grow your brand? Fill out the form below or email us
              directly at <strong>advertise@atozblog.com</strong> to receive our
              full media kit and rate card.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Full Name"
                className="w-full bg-ink-800 border border-ink-700 rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Work Email"
                className="w-full bg-ink-800 border border-ink-700 rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Tell us about your project"
                className="w-full bg-ink-800 border border-ink-700 rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              ></textarea>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? "Sending..." : "Submit Request"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <AdUnit position="footer" className="mt-20" />
    </div>
  );
}
