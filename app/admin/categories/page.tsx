"use client";
import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Tag as TagIcon,
  Loader2,
  X,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  isActive: boolean;
  postCount: number;
  order: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#ef4444",
    isActive: true,
    order: 0,
  });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (cat: Category) => {
    setEditItem(cat);
    setForm({
      name: cat.name,
      description: cat.description || "",
      color: cat.color,
      isActive: cat.isActive,
      order: cat.order,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = editItem
      ? `/api/categories/${editItem._id}`
      : "/api/categories";
    const method = editItem ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(editItem ? "Category updated!" : "Category created!");
      setShowForm(false);
      setEditItem(null);
      setForm({
        name: "",
        description: "",
        color: "#ef4444",
        isActive: true,
        order: 0,
      });
      fetchCategories();
    } else {
      const d = await res.json();
      toast.error(d.error || "Failed to save");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Category deleted");
      fetchCategories();
    } else toast.error("Delete failed");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink-900 dark:text-white">
            Categories
          </h1>
          <p className="font-sans text-ink-500 text-sm mt-1">
            {categories.length} categories
          </p>
        </div>
        <button
          onClick={() => {
            setEditItem(null);
            setForm({
              name: "",
              description: "",
              color: "#ef4444",
              isActive: true,
              order: 0,
            });
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-ink-900 rounded-2xl p-6 border border-brand-200 dark:border-brand-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans font-700 text-ink-900 dark:text-white">
              {editItem ? "Edit Category" : "New Category"}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-ink-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-700 uppercase tracking-wider text-ink-500 mb-1">
                Name *
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-stone-50 dark:bg-ink-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-brand-400"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-700 uppercase tracking-wider text-ink-500 mb-1">
                Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer border border-stone-200 dark:border-stone-700"
                />
                <input
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="flex-1 bg-stone-50 dark:bg-ink-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-brand-400"
                />
              </div>
            </div>
            <div className="col-span-2">
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
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-ink-500 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: parseInt(e.target.value) || 0 })
                  }
                  className="w-24 bg-stone-50 dark:bg-ink-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-brand-400"
                />
              </div>
              <div className="flex items-center gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`relative w-10 h-6 rounded-full transition-colors ${form.isActive ? "bg-brand-500" : "bg-stone-300 dark:bg-stone-600"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-4" : "translate-x-0"}`}
                  />
                </button>
                <span className="text-sm font-sans text-ink-600 dark:text-ink-400">
                  Active
                </span>
              </div>
            </div>
            <div className="col-span-2 flex gap-3">
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
                className="px-5 py-2.5 rounded-lg text-sm font-sans font-600 text-ink-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : (
        <div className="bg-white dark:bg-ink-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 dark:border-stone-800">
                {[
                  "Category",
                  "Slug",
                  "Posts",
                  "Order",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-4 font-sans text-xs font-bold uppercase tracking-wider text-ink-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {categories.map((cat) => (
                <tr
                  key={cat._id}
                  className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-sans text-sm font-600 text-ink-800 dark:text-ink-200">
                        {cat.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs text-ink-400 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded">
                      {cat.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4 font-sans text-sm text-ink-500">
                    {cat.postCount}
                  </td>
                  <td className="px-6 py-4 font-sans text-sm text-ink-500">
                    {cat.order}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-700 px-2.5 py-1 rounded-full ${cat.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-stone-100 text-stone-500"}`}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id, cat.name)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && (
            <div className="text-center py-12 text-ink-400 font-sans text-sm">
              No categories yet. Create your first category!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
