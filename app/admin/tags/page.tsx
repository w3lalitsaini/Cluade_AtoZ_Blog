"use client";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Hash, Loader2, X, Check } from "lucide-react";
import toast from "react-hot-toast";

interface Tag {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Tag | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const fetchTags = async () => {
    setLoading(true);
    const res = await fetch("/api/tags");
    const data = await res.json();
    setTags(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleEdit = (tag: Tag) => {
    setEditItem(tag);
    setForm({ name: tag.name, description: tag.description || "" });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = editItem ? `/api/tags/${editItem._id}` : "/api/tags";
    const method = editItem ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(editItem ? "Tag updated!" : "Tag created!");
      setShowForm(false);
      setEditItem(null);
      setForm({ name: "", description: "" });
      fetchTags();
    } else {
      const d = await res.json();
      toast.error(d.error || "Failed to save");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete tag "#${name}"?`)) return;
    const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Tag deleted");
      fetchTags();
    } else toast.error("Delete failed");
  };

  const filtered = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink-900 dark:text-white">
            Tags
          </h1>
          <p className="font-sans text-ink-500 text-sm mt-1">
            {tags.length} tags
          </p>
        </div>
        <button
          onClick={() => {
            setEditItem(null);
            setForm({ name: "", description: "" });
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Tag
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-ink-900 rounded-2xl p-6 border border-brand-200 dark:border-brand-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans font-700 text-ink-900 dark:text-white">
              {editItem ? "Edit Tag" : "New Tag"}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-ink-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-700 uppercase tracking-wider text-ink-500 mb-1">
                Name *
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Artificial Intelligence"
                className="w-full bg-stone-50 dark:bg-ink-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-brand-400"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-700 uppercase tracking-wider text-ink-500 mb-1">
                Description
              </label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full bg-stone-50 dark:bg-ink-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-brand-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-sans font-600 transition-colors disabled:opacity-70"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {saving ? "Saving..." : editItem ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-sans font-600 text-ink-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-ink-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 dark:border-stone-800">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags..."
            className="w-full max-w-xs bg-stone-50 dark:bg-ink-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2 text-sm font-sans focus:outline-none focus:border-brand-400"
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4">
            {filtered.map((tag) => (
              <div
                key={tag._id}
                className="flex items-center justify-between p-3 bg-stone-50 dark:bg-ink-800 rounded-xl border border-stone-100 dark:border-stone-700 group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Hash className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                  <span className="font-sans text-sm font-600 text-ink-800 dark:text-ink-200 truncate">
                    {tag.name}
                  </span>
                  <span className="text-xs text-ink-400 flex-shrink-0">
                    ({tag.postCount})
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(tag)}
                    className="p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(tag._id, tag.name)}
                    className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full text-center py-8 text-ink-400 font-sans text-sm">
                No tags found
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
