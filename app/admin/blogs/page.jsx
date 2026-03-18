"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  FileText,
  CheckCircle,
  Clock,
  ExternalLink,
  Plus
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function BlogManagementPage() {
  const [blogs, setBlogs] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  
  // 1. Fetch Blogs with filters
  const fetchBlogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        status: "all",
        search: searchTerm,
        tag: selectedTag
      });
      
      const res = await fetch(`/api/posts?${params.toString()}`);
      const data = await res.json();
      
      if (res.ok) {
        setBlogs(data.posts);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || "Failed to fetch blogs");
      }
    } catch (err) {
      toast.error("Error loading blogs");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedTag]);

  // 2. Initial Data Fetching
  useEffect(() => {
    // Fetch tags for filter
    fetch("/api/tags").then(res => res.json()).then(data => {
      if (Array.isArray(data)) setTags(data);
      else if (data.tags) setTags(data.tags);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBlogs(1);
    }, 400); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchBlogs]);

  // 3. Actions
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        toast.success(`Post ${newStatus === 'published' ? 'published' : 'moved to drafts'}`);
        setBlogs(blogs.map(b => b._id === id ? { ...b, status: newStatus } : b));
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const deleteBlog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Blog deleted successfully");
        fetchBlogs(pagination.page);
      } else {
        toast.error("Delete failed");
      }
    } catch (err) {
      toast.error("Error deleting blog");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-6 animate-in fade-in duration-500">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 dark:text-white">Blog Management</h1>
          <p className="text-ink-500 dark:text-ink-400 mt-1">Manage, edit, and monitor your content performance.</p>
        </div>
        <Link href="/admin/posts/new" className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition-all w-full md:w-auto justify-center">
          <Plus className="w-5 h-5" /> New Article
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-ink-900 p-4 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-300" />
          <input 
            type="text" 
            placeholder="Search by title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800 border-none rounded-xl focus:ring-2 focus:ring-brand-500 outline-none placeholder-ink-400"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative min-w-[160px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
            <select 
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800 border-none rounded-xl focus:ring-2 focus:ring-brand-500 outline-none appearance-none text-sm text-ink-700 dark:text-ink-300"
            >
              <option value="">All Tags</option>
              {tags.map(tag => (
                <option key={tag._id || tag.id || tag} value={tag.slug || tag}>{tag.name || tag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-ink-900 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50/50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-ink-400">Article Info</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-ink-400">Category & Status</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-ink-400">Date Created</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-ink-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-6"><div className="h-10 bg-stone-100 dark:bg-stone-800 rounded-lg w-full" /></td>
                  </tr>
                ))
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-ink-400">No blogs found matching your criteria.</td>
                </tr>
              ) : blogs.map(blog => (
                <tr key={blog._id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-ink-900 dark:text-white line-clamp-1">{blog.title}</span>
                      <span className="text-xs text-ink-400 font-mono mt-0.5">/{blog.slug}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-ink-500 rounded text-xs">
                        {blog.category?.name || "Uncategorized"}
                      </span>
                      <button 
                        onClick={() => toggleStatus(blog._id, blog.status)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                          blog.status === 'published' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-200 dark:border-green-800' 
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {blog.status}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-ink-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(blog.createdAt), "MMM d, yyyy")}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/article/${blog.slug}`} target="_blank" className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-ink-400 transition-colors" title="View Article">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/admin/posts/${blog._id}/edit`} className="p-2 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg text-brand-500 transition-colors" title="Edit Article">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => deleteBlog(blog._id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors" title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/30 dark:bg-stone-800/20 flex items-center justify-between">
            <p className="text-xs text-ink-400 font-medium">Page {pagination.page} of {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button 
                disabled={pagination.page <= 1}
                onClick={() => fetchBlogs(pagination.page - 1)}
                className="p-2 border border-stone-200 dark:border-stone-700 rounded-lg disabled:opacity-30 hover:bg-white dark:hover:bg-ink-900 transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchBlogs(pagination.page + 1)}
                className="p-2 border border-stone-200 dark:border-stone-700 rounded-lg disabled:opacity-30 hover:bg-white dark:hover:bg-ink-900 transition-all shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mini Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Content', value: pagination.total, icon: FileText, color: 'text-brand-500' },
          { label: 'Live Blogs', value: blogs.filter(b => b.status === 'published').length, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Drafts', value: blogs.filter(b => b.status === 'draft').length, icon: Edit, color: 'text-amber-500' },
          { label: 'Engagement', value: blogs.reduce((a,b) => a + (b.viewCount||0), 0), icon: TrendingUp, color: 'text-blue-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-ink-900 p-4 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm">
             <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-stone-50 dark:bg-stone-800 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-ink-900 dark:text-white leading-none">{stat.value}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 mt-1">{stat.label}</span>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
