"use client";
import { useState, useEffect } from "react";
import {
  Save,
  Search,
  Globe,
  Share2,
  Loader2,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSEOPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    defaultMetaTitle: "",
    defaultMetaDescription: "",
    googleAnalyticsId: "",
    adsenseClientId: "",
    socialLinks: { twitter: "", facebook: "", instagram: "", linkedin: "" },
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) toast.success("SEO settings updated!");
      else toast.error("Failed to update");
    } catch (e) {
      toast.error("Error saving");
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, val: any) =>
    setSettings((p: any) => ({ ...p, [key]: val }));

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-brand-500" />
      </div>
    );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink-900 dark:text-white">
            SEO Management
          </h1>
          <p className="font-sans text-ink-500 text-sm mt-1">
            Optimize your site for search engines and social media
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-brand flex items-center gap-2 px-6"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save size={18} />
          )}{" "}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-ink-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-brand-500 mb-2">
            <Globe size={18} />
            <h2 className="font-sans font-bold uppercase text-xs tracking-wider">
              Search Defaults
            </h2>
          </div>
          <div>
            <label className="label-sm">Default Meta Title</label>
            <input
              value={settings.defaultMetaTitle}
              onChange={(e) => set("defaultMetaTitle", e.target.value)}
              className="input-field"
              placeholder="AtoZ Blogs | News & Insights"
            />
          </div>
          <div>
            <label className="label-sm">Default Meta Description</label>
            <textarea
              value={settings.defaultMetaDescription}
              onChange={(e) => set("defaultMetaDescription", e.target.value)}
              rows={4}
              className="input-field resize-none"
              placeholder="Site description for search results..."
            />
          </div>
        </div>

        <div className="bg-white dark:bg-ink-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <Search size={18} />
            <h2 className="font-sans font-bold uppercase text-xs tracking-wider">
              Analytics & Verification
            </h2>
          </div>
          <div>
            <label className="label-sm">Google Analytics ID</label>
            <input
              value={settings.googleAnalyticsId}
              onChange={(e) => set("googleAnalyticsId", e.target.value)}
              className="input-field"
              placeholder="G-XXXXXXXXXX"
            />
          </div>
          <div>
            <label className="label-sm">Sitemap URL</label>
            <div className="flex items-center gap-2 p-3 bg-ink-50 dark:bg-ink-800 rounded-lg text-xs font-mono text-ink-500">
              {settings.siteUrl}/sitemap.xml
              <CheckCircle size={14} className="text-green-500 ml-auto" />
            </div>
            <p className="text-[10px] text-ink-400 mt-2 italic">
              Sitemap is automatically generated every 24 hours.
            </p>
          </div>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-ink-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-purple-500 mb-2">
            <Share2 size={18} />
            <h2 className="font-sans font-bold uppercase text-xs tracking-wider">
              Social Graph (OpenGraph)
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-sm">Twitter Handle</label>
              <input
                value={settings.socialLinks?.twitter}
                onChange={(e) =>
                  set("socialLinks", {
                    ...settings.socialLinks,
                    twitter: e.target.value,
                  })
                }
                className="input-field"
                placeholder="@username"
              />
            </div>
            <div>
              <label className="label-sm">Facebook Page URL</label>
              <input
                value={settings.socialLinks?.facebook}
                onChange={(e) =>
                  set("socialLinks", {
                    ...settings.socialLinks,
                    facebook: e.target.value,
                  })
                }
                className="input-field"
                placeholder="https://facebook.com/..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
