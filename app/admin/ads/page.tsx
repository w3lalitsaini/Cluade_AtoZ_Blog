"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Ad {
  _id: string;
  title: string;
  type: "image" | "script" | "html";
  position: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
  content: string;
  link?: string;
}

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "image",
    position: "sidebar",
    content: "",
    link: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ads");
      const data = await res.json();
      if (res.ok) setAds(data);
    } catch (e) {
      toast.error("Failed to fetch ads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const handleSave = async () => {
    if (!form.title || !form.content)
      return toast.error("Title and content are required");
    setSaving(true);
    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setAds((prev) => [data, ...prev]);
        setShowForm(false);
        setForm({
          title: "",
          type: "image",
          position: "sidebar",
          content: "",
          link: "",
          isActive: true,
        });
        toast.success("Ad created!");
      } else {
        toast.error(data.message || "Failed");
      }
    } catch (e) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleAd = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/ads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        setAds((prev) =>
          prev.map((a) =>
            a._id === id ? { ...a, isActive: !currentStatus } : a,
          ),
        );
        toast.success(`Ad ${!currentStatus ? "activated" : "paused"}`);
      }
    } catch (e) {
      toast.error("Action failed");
    }
  };

  const deleteAd = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;
    try {
      const res = await fetch(`/api/ads/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAds((prev) => prev.filter((a) => a._id !== id));
        toast.success("Ad deleted");
      }
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink-900 dark:text-white">
            Ad Management
          </h1>
          <p className="font-sans text-ink-500 text-sm mt-1">
            Manage Google AdSense and custom ad placements
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Ad
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-ink-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="font-heading text-lg font-bold text-ink-900 dark:text-white mb-4">
            Create New Ad
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-sm">Ad Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="input-field"
                placeholder="Sidebar Banner Ad"
              />
            </div>
            <div>
              <label className="label-sm">Ad Type</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value as any }))
                }
                className="input-field"
              >
                <option value="image">Custom Image</option>
                <option value="script">Script (AdSense/Affiliate)</option>
                <option value="html">Custom HTML</option>
              </select>
            </div>
            <div>
              <label className="label-sm">Position</label>
              <select
                value={form.position}
                onChange={(e) =>
                  setForm((f) => ({ ...f, position: e.target.value }))
                }
                className="input-field"
              >
                <option value="header">Header Banner</option>
                <option value="sidebar">Sidebar</option>
                <option value="in-post">In-Post</option>
                <option value="footer">Footer</option>
              </select>
            </div>
            <div>
              <label className="label-sm">Link URL (Optional)</label>
              <input
                type="url"
                value={form.link}
                onChange={(e) =>
                  setForm((f) => ({ ...f, link: e.target.value }))
                }
                className="input-field"
                placeholder="https://..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="label-sm">
                {form.type === "image" ? "Image URL" : "Ad Code / Script"}
              </label>
              <textarea
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                rows={4}
                className="input-field font-mono text-sm resize-none"
                placeholder={
                  form.type === "image"
                    ? "https://example.com/ad.jpg"
                    : "Paste your code here..."
                }
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary min-w-[100px] flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Ad"
              )}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-ink-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
                {[
                  "Title",
                  "Type",
                  "Position",
                  "Status",
                  "Impressions",
                  "Clicks",
                  "CTR",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3.5 font-sans text-xs font-bold uppercase tracking-wider text-ink-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-500" />
                  </td>
                </tr>
              ) : ads.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-20 font-sans text-ink-400"
                  >
                    No ads found. Create your first ad!
                  </td>
                </tr>
              ) : (
                ads.map((ad) => (
                  <tr
                    key={ad._id}
                    className="hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-sans text-sm font-semibold text-ink-900 dark:text-ink-100">
                        {ad.title}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium px-2 py-1 bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400 rounded-md capitalize">
                        {ad.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-sans text-sm text-ink-500 capitalize">
                      {ad.position}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleAd(ad._id, ad.isActive)}
                        className={`text-xs px-2.5 py-1 rounded-full font-sans font-semibold transition-colors ${ad.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}
                      >
                        {ad.isActive ? "Active" : "Paused"}
                      </button>
                    </td>
                    <td className="px-5 py-4 font-sans text-sm text-ink-500">
                      {(ad.impressions || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 font-sans text-sm text-ink-500">
                      {(ad.clicks || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 font-sans text-sm text-ink-500">
                      {ad.impressions > 0
                        ? ((ad.clicks / ad.impressions) * 100).toFixed(2) + "%"
                        : "0%"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => deleteAd(ad._id)}
                          className="p-2 text-ink-300 hover:text-red-500 transition-colors"
                          title="Delete Ad"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
