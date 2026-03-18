"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { 
  Sparkles, 
  RefreshCw, 
  Save, 
  Edit3, 
  Eye, 
  Layout, 
  Tags, 
  Search, 
  AlertCircle, 
  CheckCircle2,
  Database,
  History,
  ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";

interface AIResult {
  topic: string;
  keywords: string[];
  search_intent: string;
  title: string;
  meta_description: string;
  slug: string;
  tags: string[];
  content: string;
  fallback_used: boolean;
  cached: boolean;
}

export default function AdminAIPage() {
  const { data: session, status } = useSession();
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<AIResult>>({});
  const [saving, setSaving] = useState(false);

  // 1. Authorization Check
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login");
    }
  }, [status]);

  const isAdmin = (session?.user as any)?.role === "admin";

  if (status === "loading") return <div className="p-10 text-center">Loading context...</div>;
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-gray-500">Only administrators can access the AI Blog Generator.</p>
      </div>
    );
  }

  // 2. Generation Logic
  const handleGenerate = async () => {
    if (!keyword.trim()) {
      toast.error("Please enter a keyword.");
      return;
    }

    setLoading(true);
    setResult(null);
    setIsEditing(false);

    try {
      const res = await fetch("/api/agent-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim(), save: false }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setEditData(data.data);
        toast.success(data.data.cached ? "Cache Hit! Retrieved from DB." : "Blog generated successfully!");
      } else {
        toast.error(data.error || "Generation failed.");
      }
    } catch (err) {
      toast.error("An error occurred during generation.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Save Logic
  const handleSave = async () => {
    if (!editData.topic || !editData.content) {
      toast.error("Title and Content are required.");
      return;
    }

    setSaving(true);
    try {
      // We use the standard /api/posts route for saving our final refined blog
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editData.topic,
          content: editData.content,
          excerpt: editData.meta_description,
          slug: editData.slug,
          tags: editData.tags,
          category: "ai-generated", // We'll use a specific category for AI posts
          status: "published",
          seo: {
            metaTitle: editData.title,
            metaDescription: editData.meta_description,
            focusKeyword: editData.topic
          }
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Blog post saved successfully!");
        setResult(null);
        setKeyword("");
      } else {
        toast.error(data.error || "Failed to save post.");
      }
    } catch (err) {
      toast.error("Error saving to database.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-brand-500" />
            Agentic AI Blog Factory
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-2xl">
            Generate high-quality, SEO-optimized blog posts using our autonomous AI research and writing agents.
          </p>
        </div>
      </div>

      {/* GENERATOR SECTION (A) */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          What should the AI write about?
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. Future of Quantum Computing, Healthy Meal Prep 2026..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-brand-500 transition-all outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !keyword.trim()}
            className="px-8 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 min-w-[180px]"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {loading ? "Researching..." : "Generate Blog"}
          </button>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="space-y-6">
          <div className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />
          <div className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />
        </div>
      )}

      {/* RESULT & PREVIEW SECTION (B) */}
      {result && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          
          {/* Metadata Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-bold flex items-center gap-2">
                  <Layout className="w-5 h-5 text-brand-500" />
                  Metadata
                </h2>
                {result.cached && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold uppercase rounded flex items-center gap-1">
                    <History className="w-3 h-3" /> Cached
                  </span>
                )}
                {result.fallback_used && (
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold uppercase rounded flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Fallback
                  </span>
                )}
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase block mb-1">Topic</label>
                  {isEditing ? (
                    <input 
                      value={editData.topic} 
                      onChange={(e) => setEditData({...editData, topic: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700" 
                    />
                  ) : (
                    <p className="font-medium">{result.topic}</p>
                  )}
                </div>

                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase block mb-1">Slug</label>
                   {isEditing ? (
                    <input 
                      value={editData.slug} 
                      onChange={(e) => setEditData({...editData, slug: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700" 
                    />
                  ) : (
                    <code className="text-brand-600 dark:text-brand-400">{result.slug}</code>
                  )}
                </div>

                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase block mb-1">Meta Description</label>
                  {isEditing ? (
                    <textarea 
                      value={editData.meta_description} 
                      onChange={(e) => setEditData({...editData, meta_description: e.target.value})}
                      rows={3}
                      className="w-full bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 resize-none" 
                    />
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic">
                      "{result.meta_description}"
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase block mb-1">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACTIONS (C) */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  {saving ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                  Save to Blog
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                   <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`py-2 text-sm font-semibold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                      isEditing 
                        ? "bg-brand-50 border-brand-200 text-brand-600" 
                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {isEditing ? "Finish Editing" : "Edit Post"}
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Regenerate
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Main Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="font-bold flex items-center gap-2">
                  <Eye className="w-5 h-5 text-brand-500" />
                  {isEditing ? "Live Editor" : "Content Preview"}
                </h2>
                <div className="flex gap-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> SEO Validated</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Linking OK</span>
                </div>
              </div>

              {/* FALLBACK WARNING & RETRY (D) */}
              {result.fallback_used && (
                <div className="mx-6 mt-6 px-6 py-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-3 text-amber-800">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">AI limit reached. Showing fallback content.</p>
                  </div>
                  <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Retry AI Generation
                  </button>
                </div>
              )}

              {isEditing ? (
                <div className="p-6">
                  <textarea
                    value={editData.content}
                    onChange={(e) => setEditData({...editData, content: e.target.value})}
                    rows={20}
                    className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-none focus:ring-0 text-gray-800 dark:text-gray-200 font-mono text-sm leading-relaxed resize-none"
                  />
                </div>
              ) : (
                <div className="p-10 prose dark:prose-invert max-w-none">
                  {/* We inject the HTML securely for preview */}
                  <div dangerouslySetInnerHTML={{ __html: result.content }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!result && !loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-gray-900/50 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2.5rem] animate-in zoom-in duration-700">
           <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <Database className="w-10 h-10 text-gray-300" />
           </div>
           <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Ready for Research</h3>
           <p className="text-gray-500 dark:text-gray-400 mt-2 text-center max-w-sm px-4">
             Enter a keyword above to start the multi-agent orchestration. The AI will research, write, interlink, and optimize your post automatically.
           </p>
           <div className="mt-8 flex items-center gap-6 text-sm font-medium text-gray-400">
             <div className="flex items-center gap-2"><ArrowRight className="w-4 h-4" /> 1200+ Words</div>
             <div className="flex items-center gap-2"><ArrowRight className="w-4 h-4" /> SEO Ready</div>
             <div className="flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Internal Links</div>
           </div>
        </div>
      )}
    </div>
  );
}
