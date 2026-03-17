"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Loader2,
} from "lucide-react";
import { config } from "@/lib/config";
import toast from "react-hot-toast";

const footerLinks = {
  categories: [
    { name: "News", href: "/category/news" },
    { name: "Technology", href: "/category/technology" },
    { name: "Business", href: "/category/business" },
    { name: "AI", href: "/category/ai" },
    { name: "Health", href: "/category/health" },
    { name: "Science", href: "/category/science" },
    { name: "Sports", href: "/category/sports" },
    { name: "Entertainment", href: "/category/entertainment" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Advertise", href: "/advertise" },
    { name: "Careers", href: "/careers" },
    { name: "Press Kit", href: "/press" },
    { name: "Latest Insights", href: "/latest" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookie-policy" },
    { name: "DMCA Notice", href: "/dmca" },
    { name: "Sitemap", href: "/sitemap.xml" },
  ],
};

const socials = [
  { icon: Twitter, href: config.socialLinks.twitter, label: "Twitter" },
  { icon: Facebook, href: config.socialLinks.facebook, label: "Facebook" },
  { icon: Instagram, href: config.socialLinks.instagram, label: "Instagram" },
  { icon: Youtube, href: config.socialLinks.youtube, label: "YouTube" },
  { icon: Linkedin, href: config.socialLinks.linkedin, label: "LinkedIn" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
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
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-ink-950 text-white mt-16">
      {/* Newsletter */}
      <div className="border-b border-ink-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="max-w-2xl">
            <h3 className="font-heading text-2xl font-bold text-white mb-2">
              Stay Informed. Subscribe Free.
            </h3>
            <p className="font-sans text-ink-400 mb-6">
              Get the latest news and insights delivered straight to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 bg-ink-900 border border-ink-700 rounded-lg px-4 py-3 text-sm text-white placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary whitespace-nowrap flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                {loading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Links Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-heading text-2xl font-black">
                A<span className="text-brand-500">to</span>Z
                <span className="font-sans font-light text-ink-400 ml-1">
                  Blogs
                </span>
              </span>
            </Link>
            <p className="font-sans text-ink-400 text-sm leading-relaxed mb-6">
              Your trusted source for breaking news, in-depth analysis, and
              expert insights across every topic that matters.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-ink-800 hover:bg-brand-500 flex items-center justify-center transition-colors duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-ink-400 mb-4">
              Categories
            </h4>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-ink-400 hover:text-brand-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-ink-400 mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-ink-400 hover:text-brand-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-ink-400 mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-ink-400 hover:text-brand-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-ink-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-ink-500 text-sm">
            © {new Date().getFullYear()} AtoZ Blogs. All rights reserved.
          </p>
          <p className="font-sans text-ink-600 text-xs">
            Powered by Next.js · MongoDB · AI-driven insights
          </p>
        </div>
      </div>
    </footer>
  );
}
