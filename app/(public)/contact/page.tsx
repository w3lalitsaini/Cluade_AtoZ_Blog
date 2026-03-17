"use client";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { config } from "@/lib/config";
import toast from "react-hot-toast";
import AdUnit from "@/components/ads/AdUnit";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          type: "contact",
        }),
      });
      if (res.ok) {
        toast.success("Message sent! We'll get back to you soon.");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          subject: "General Inquiry",
          message: "",
        });
      } else {
        toast.error("Failed to send message");
      }
    } catch {
      toast.error("Error sending message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <AdUnit position="header" className="mb-12" />
      <div className="text-center mb-16">
        <h1 className="font-heading text-4xl md:text-5xl font-black text-ink-950 dark:text-white mb-6">
          Get in Touch
        </h1>
        <p className="text-xl text-ink-600 dark:text-ink-400 font-body max-w-2xl mx-auto">
          We&apos;d love to hear from you. Whether you have a question, a news
          tip, or just want to say hello, our team is ready to respond.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Contact Information */}
        <div className="space-y-12">
          <div>
            <h2 className="font-heading text-2xl font-bold text-ink-900 dark:text-white mb-8">
              Contact Information
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-ink-900 dark:text-white">
                    Email Us
                  </h3>
                  <p className="text-ink-600 dark:text-ink-400 mt-1">
                    {config.contact.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-ink-900 dark:text-white">
                    Call Us
                  </h3>
                  <p className="text-ink-600 dark:text-ink-400 mt-1">
                    +1 (123) 456-7890
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-ink-900 dark:text-white">
                    Our Headquaters
                  </h3>
                  <p className="text-ink-600 dark:text-ink-400 mt-1">
                    {config.contact.address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-ink-900 text-white">
            <h3 className="font-heading text-2xl font-bold mb-4 text-brand-400">
              Join our Newsletter
            </h3>
            <p className="font-body text-ink-300 mb-6">
              Stay ahead of the curve with our weekly digest of the most
              important stories.
            </p>
            <form
              className="flex gap-2"
              action="/api/newsletter/subscribe"
              method="POST"
            >
              <input
                type="email"
                name="email"
                required
                placeholder="email@example.com"
                className="flex-1 bg-ink-800 border border-ink-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                className="bg-brand-600 hover:bg-brand-500 p-3 rounded-xl transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-ink-900 p-8 md:p-10 rounded-3xl shadow-xl border border-stone-100 dark:border-stone-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-ink-700 dark:text-ink-300">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="John"
                  className="w-full bg-stone-50 dark:bg-ink-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-ink-700 dark:text-ink-300">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Doe"
                  className="w-full bg-stone-50 dark:bg-ink-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-ink-700 dark:text-ink-300">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="john@example.com"
                className="w-full bg-stone-50 dark:bg-ink-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-ink-700 dark:text-ink-300">
                Subject
              </label>
              <select
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full bg-stone-50 dark:bg-ink-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option>General Inquiry</option>
                <option>Advertising</option>
                <option>News Tip</option>
                <option>Technical Support</option>
                <option>Feedback</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-ink-700 dark:text-ink-300">
                Message
              </label>
              <textarea
                rows={5}
                required
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="How can we help you?"
                className="w-full bg-stone-50 dark:bg-ink-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
      <div className="mt-16">
        <AdUnit position="in-article" />
      </div>
      <div className="mt-12">
        <AdUnit position="between-paragraphs" />
      </div>
      <AdUnit position="footer" className="mt-20" />
    </div>
  );
}
