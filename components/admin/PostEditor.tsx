"use client";
import { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import YouTube from "@tiptap/extension-youtube";
import NextImage from "next/image";
import toast from "react-hot-toast";
import {
  Loader2,
  Save,
  Eye,
  Sparkles,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
}
interface Tag {
  _id: string;
  name: string;
  slug: string;
}
interface Props {
  categories: Category[];
  tags: Tag[];
  post?: Record<string, unknown>;
}

export function PostEditor({ categories, tags, post }: Props) {
  const [title, setTitle] = useState((post?.title as string) || "");
  const [excerpt, setExcerpt] = useState((post?.excerpt as string) || "");
  const [slug, setSlug] = useState((post?.slug as string) || "");
  const [categoryId, setCategoryId] = useState(
    (post?.category as string) || "",
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    (post?.tags as string[]) || [],
  );
  const [status, setStatus] = useState((post?.status as string) || "draft");
  const [isBreaking, setIsBreaking] = useState(
    (post?.isBreaking as boolean) || false,
  );
  const [isFeatured, setIsFeatured] = useState(
    (post?.isFeatured as boolean) || false,
  );
  const [isEditorsPick, setIsEditorsPick] = useState(
    (post?.isEditorsPick as boolean) || false,
  );
  const [metaTitle, setMetaTitle] = useState(
    (post?.seo as Record<string, string>)?.metaTitle || "",
  );
  const [metaDesc, setMetaDesc] = useState(
    (post?.seo as Record<string, string>)?.metaDescription || "",
  );
  const [focusKeyword, setFocusKeyword] = useState(
    (post?.seo as Record<string, string>)?.focusKeyword || "",
  );
  const [featuredImage, setFeaturedImage] = useState(
    (post?.featuredImage as string) || "",
  );
  const [featuredImageAlt, setFeaturedImageAlt] = useState(
    (post?.featuredImageAlt as string) || "",
  );
  const [allowComments, setAllowComments] = useState(
    (post?.allowComments as boolean) ?? true,
  );
  const [sponsored, setSponsored] = useState(
    (post?.sponsored as boolean) || false,
  );
  const [sponsoredBy, setSponsoredBy] = useState(
    (post?.sponsoredBy as string) || "",
  );
  const [scheduledAt, setScheduledAt] = useState(
    (post?.scheduledAt as string) || "",
  );
  const [coAuthors, setCoAuthors] = useState<string[]>(
    (post?.coAuthors as string[]) || [],
  );
  const [jsonLd, setJsonLd] = useState((post?.jsonLd as string) || "");

  const [canonicalUrl, setCanonicalUrl] = useState(
    (post?.seo as any)?.canonicalUrl || "",
  );
  const [noIndex, setNoIndex] = useState((post?.seo as any)?.noIndex || false);
  const [ogImage, setOgImage] = useState((post?.seo as any)?.ogImage || "");

  const [uploadedMedia, setUploadedMedia] = useState<
    { url: string; name: string }[]
  >([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [seoOpen, setSeoOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [aiStatus, setAiStatus] = useState<{ isCached: boolean; isFallback: boolean } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Write your article here..." }),
      CharacterCount,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight,
      YouTube.configure({ controls: false }),
    ],
    content: (post?.content as string) || "",
    editorProps: { attributes: { class: "tiptap-editor" } },
  });

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!post) setSlug(generateSlug(value));
  };

  const handleSave = async (saveStatus = status) => {
    if (!title || !categoryId) {
      toast.error("Title and category are required");
      return;
    }
    setSaving(true);
    try {
      const body = {
        title,
        slug,
        excerpt,
        content: editor?.getHTML() || "",
        category: categoryId,
        tags: selectedTags,
        status: saveStatus,
        isBreaking,
        isFeatured,
        isEditorsPick,
        featuredImage,
        featuredImageAlt,
        allowComments,
        sponsored,
        sponsoredBy,
        scheduledAt,
        coAuthors,
        jsonLd,
        seo: {
          metaTitle,
          metaDescription: metaDesc,
          focusKeyword,
          canonicalUrl,
          noIndex,
          ogImage,
        },
      };
      const url = post ? `/api/posts/${post._id}` : "/api/posts";
      const method = post ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          saveStatus === "published" ? "Post published!" : "Draft saved!",
        );
      } else {
        toast.error(data.message || "Save failed");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setSaving(false);
  };

  const handleAI = async (action: string) => {
    if (!title) {
        toast.error("Please enter a topic in the title field first.");
        return;
    }

    setAiLoading(action);
    setAiStatus(null);

    const toastId = toast.loading(
      action === "full" ? "Agents are researching and writing your blog..." : "Thinking..."
    );

    try {
      // Use the new Agentic AI endpoint
      const res = await fetch("/api/agent-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: title,
          save: false, // We handle saving manually in the editor
        }),
      });

      const json = await res.json();
      
      if (!json.success) {
        throw new Error(json.error || "AI generation failed");
      }

      const data = json.data;

      if (action === "full" || action === "article") {
        // 1. Content
        editor?.commands.setContent(data.content);
        
        // 2. SEO & Meta
        setSlug(data.slug);
        setMetaDesc(data.meta_description);
        setMetaTitle(data.title);
        
        // 3. Tags Matching
        const matchedTagIds = data.tags
          .map((tagName: string) => tags.find(t => t.name.toLowerCase() === tagName.toLowerCase())?._id)
          .filter((id: string | undefined) => id !== undefined) as string[];
        setSelectedTags(matchedTagIds);

        setAiStatus({ isCached: data.cached, isFallback: data.fallback_used });
        toast.success("Full blog generated and auto-filled!", { id: toastId });
      } else if (action === "meta") {
        setMetaDesc(data.meta_description);
        toast.success("Meta description updated!", { id: toastId });
      } else if (action === "rewrite") {
        // For individual actions, we still use the agent output but more targeted
        editor?.commands.setContent(data.content);
        toast.success("Content improved!", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "AI generation failed", { id: toastId });
    }
    setAiLoading(null);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    const newMedia: { url: string; name: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fd = new FormData();
      fd.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (data.media?.secureUrl) {
          newMedia.push({ url: data.media.secureUrl, name: file.name });
        }
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploadedMedia((prev) => [...prev, ...newMedia]);
    setUploadingMedia(false);
    if (newMedia.length > 0) {
      toast.success(
        `Successfully uploaded ${newMedia.length} file${newMedia.length > 1 ? "s" : ""}`,
      );
    }
  };

  const insertMedia = (url: string, name: string) => {
    editor?.commands.setImage({ src: url, alt: name });
  };

  const toggleTag = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Editor - Main */}
      <div className="xl:col-span-2 space-y-4">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Article headline..."
          className="w-full bg-white dark:bg-ink-900 border border-stone-200 dark:border-stone-700 rounded-xl px-5 py-4 font-heading text-2xl font-bold text-ink-900 dark:text-white placeholder-ink-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        {/* Slug */}
        <div className="flex items-center gap-2 bg-white dark:bg-ink-900 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2.5">
          <span className="font-sans text-xs text-ink-400">Slug:</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="flex-1 bg-transparent font-sans text-sm text-ink-600 dark:text-ink-300 focus:outline-none"
          />
        </div>

        {/* Excerpt */}
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Brief excerpt / article summary..."
          rows={2}
          className="input-field resize-none font-sans"
        />

        {/* AI Toolbar */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-4">
          <p className="font-sans text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> AI Writing Assistant
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { action: "full", label: "Generate Full Blog", primary: true },
              { action: "rewrite", label: "Regenerate Content", primary: false },
              { action: "meta", label: "Update Meta Only", primary: false },
            ].map(({ action, label, primary }) => (
              <button
                key={action}
                disabled={!!aiLoading || !title}
                onClick={() => handleAI(action)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-sans text-xs font-bold transition-all disabled:opacity-50 ${
                  primary 
                  ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-200 dark:shadow-none" 
                  : "bg-white dark:bg-ink-900 border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50"
                }`}
              >
                {aiLoading === action ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {label}
              </button>
            ))}
          </div>
          
          {aiStatus && (
            <div className="mt-4 flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
              {aiStatus.isCached && (
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-green-200 dark:border-green-800">
                  Cached Result
                </span>
              )}
              {aiStatus.isFallback && (
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-amber-200 dark:border-amber-800">
                  Fallback Mode Active
                </span>
              )}
              {!aiStatus.isFallback && !aiStatus.isCached && (
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-blue-200 dark:border-blue-800">
                  Live Agentic Generation
                </span>
              )}
            </div>
          )}
          {!title && (
            <p className="font-sans text-xs text-purple-400 mt-2">
              Add a title first to use AI tools
            </p>
          )}
        </div>

        {/* TipTap Editor */}
        <div className="bg-white dark:bg-ink-900 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
          {/* Toolbar */}
          <div className="border-b border-stone-200 dark:border-stone-700 p-2 flex flex-wrap gap-1">
            {[
              {
                label: "B",
                cmd: () => editor?.chain().focus().toggleBold().run(),
                active: () => editor?.isActive("bold"),
              },
              {
                label: "I",
                cmd: () => editor?.chain().focus().toggleItalic().run(),
                active: () => editor?.isActive("italic"),
              },
              {
                label: "H2",
                cmd: () =>
                  editor?.chain().focus().toggleHeading({ level: 2 }).run(),
                active: () => editor?.isActive("heading", { level: 2 }),
              },
              {
                label: "H3",
                cmd: () =>
                  editor?.chain().focus().toggleHeading({ level: 3 }).run(),
                active: () => editor?.isActive("heading", { level: 3 }),
              },
              {
                label: "Quote",
                cmd: () => editor?.chain().focus().toggleBlockquote().run(),
                active: () => editor?.isActive("blockquote"),
              },
              {
                label: "• List",
                cmd: () => editor?.chain().focus().toggleBulletList().run(),
                active: () => editor?.isActive("bulletList"),
              },
              {
                label: "1. List",
                cmd: () => editor?.chain().focus().toggleOrderedList().run(),
                active: () => editor?.isActive("orderedList"),
              },
              {
                label: "Code",
                cmd: () => editor?.chain().focus().toggleCode().run(),
                active: () => editor?.isActive("code"),
              },
            ].map(({ label, cmd, active }) => (
              <button
                key={label}
                onMouseDown={(e) => {
                  e.preventDefault();
                  cmd();
                }}
                className={`px-2.5 py-1.5 rounded text-xs font-mono font-medium transition-colors ${
                  active?.()
                    ? "bg-brand-500 text-white"
                    : "hover:bg-stone-100 dark:hover:bg-stone-800 text-ink-600 dark:text-ink-300"
                }`}
              >
                {label}
              </button>
            ))}
            <div className="w-px bg-stone-200 dark:bg-stone-700 mx-1" />
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                const url = prompt("Enter URL:");
                if (url) editor?.chain().focus().setLink({ href: url }).run();
              }}
              className="px-2.5 py-1.5 rounded text-xs font-mono font-medium hover:bg-stone-100 dark:hover:bg-stone-800 text-ink-600 dark:text-ink-300"
            >
              Link
            </button>
            <label className="px-2.5 py-1.5 rounded text-xs font-mono font-medium hover:bg-stone-100 dark:hover:bg-stone-800 text-ink-600 dark:text-ink-300 cursor-pointer flex items-center gap-1">
              <Upload className="w-3 h-3" />
              Image
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append("file", file);
                  const toastId = toast.loading("Uploading image...");
                  try {
                    const res = await fetch("/api/upload", {
                      method: "POST",
                      body: fd,
                    });
                    const data = await res.json();
                    if (data.media?.secureUrl) {
                      editor?.commands.setImage({ src: data.media.secureUrl });
                      toast.success("Image uploaded & inserted!", {
                        id: toastId,
                      });
                    } else {
                      toast.error("Upload failed", { id: toastId });
                    }
                  } catch {
                    toast.error("Upload failed", { id: toastId });
                  }
                }}
              />
            </label>
          </div>
          <EditorContent
            editor={editor}
            className="min-h-[500px] p-6 article-body focus:outline-none"
          />
          {editor && (
            <div className="border-t border-stone-100 dark:border-stone-800 px-4 py-2 flex items-center justify-between text-xs text-ink-400 font-sans">
              <span>
                {editor.storage.characterCount?.characters() || 0} characters
              </span>
              <span>{editor.storage.characterCount?.words() || 0} words</span>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Panel */}
      <div className="space-y-4">
        {/* Publish Actions */}
        <div className="bg-white dark:bg-ink-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-5">
          <h3 className="font-sans text-sm font-bold text-ink-700 dark:text-ink-200 mb-4">
            Publish
          </h3>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-field text-sm mb-4"
          >
            <option value="draft">Draft</option>
            <option value="pending">Pending Review</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
          <div className="space-y-2">
            <button
              onClick={() => handleSave("draft")}
              disabled={saving}
              className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Draft
            </button>
            <button
              onClick={() => handleSave("published")}
              disabled={saving}
              className="btn-primary w-full text-sm flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              Publish Now
            </button>
          </div>
        </div>

        {/* Settings Toggle */}
        <div className="bg-white dark:bg-ink-900 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="w-full flex items-center justify-between px-5 py-4 font-sans text-sm font-bold text-ink-700 dark:text-ink-200"
          >
            Post Settings
            {settingsOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {settingsOpen && (
            <div className="px-5 pb-5 space-y-4 border-t border-stone-100 dark:border-stone-800">
              {/* Category */}
              <div>
                <label className="font-sans text-xs font-semibold text-ink-500 uppercase tracking-wide block mb-1.5">
                  Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="font-sans text-xs font-semibold text-ink-500 uppercase tracking-wide block mb-1.5">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-80 overflow-y-auto">
                  {tags.map((tag) => (
                    <button
                      key={tag._id}
                      type="button"
                      onClick={() => toggleTag(tag._id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-sans font-medium transition-colors ${
                        selectedTags.includes(tag._id)
                          ? "bg-brand-500 text-white"
                          : "bg-stone-100 dark:bg-stone-800 text-ink-600 dark:text-ink-300 hover:bg-stone-200"
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured Image */}
              <div>
                <label className="font-sans text-xs font-semibold text-ink-500 uppercase tracking-wide block mb-1.5">
                  Featured Image
                </label>
                {featuredImage ? (
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 group">
                      <NextImage
                        src={featuredImage}
                        alt="Featured"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFeaturedImage("")}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600 shadow-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={featuredImageAlt}
                      onChange={(e) => setFeaturedImageAlt(e.target.value)}
                      placeholder="Image alt text (SEO)"
                      className="input-field text-xs"
                    />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-6 h-6 text-stone-400 mb-2" />
                      <p className="mb-2 text-sm text-stone-500 dark:text-stone-400 font-sans font-medium">
                        Click to upload Cover
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append("file", file);
                        const loadingToast =
                          toast.loading("Uploading image...");
                        try {
                          const res = await fetch("/api/upload", {
                            method: "POST",
                            body: fd,
                          });
                          const data = await res.json();
                          if (data.media?.secureUrl) {
                            setFeaturedImage(data.media.secureUrl);
                            toast.success("Uploaded successfully", {
                              id: loadingToast,
                            });
                          } else {
                            toast.error("Upload failed", { id: loadingToast });
                          }
                        } catch {
                          toast.error("Upload failed", { id: loadingToast });
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Post flags */}
              <div className="space-y-3 pt-2">
                {[
                  {
                    label: "Breaking News",
                    value: isBreaking,
                    set: setIsBreaking,
                  },
                  {
                    label: "Featured Post",
                    value: isFeatured,
                    set: setIsFeatured,
                  },
                  {
                    label: "Editor's Pick",
                    value: isEditorsPick,
                    set: setIsEditorsPick,
                  },
                  {
                    label: "Allow Comments",
                    value: allowComments,
                    set: setAllowComments,
                  },
                  {
                    label: "Sponsored Content",
                    value: sponsored,
                    set: setSponsored,
                  },
                ].map(({ label, value, set }) => (
                  <label
                    key={label}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      onClick={() => set(!value)}
                      className={`w-9 h-5 rounded-full transition-colors relative ${value ? "bg-brand-500" : "bg-stone-300 dark:bg-stone-600"}`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? "translate-x-4.5" : "translate-x-0.5"}`}
                      />
                    </div>
                    <span className="font-sans text-xs font-medium text-ink-700 dark:text-ink-300">
                      {label}
                    </span>
                  </label>
                ))}
              </div>

              {sponsored && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-1">
                  <label className="font-sans text-xs font-semibold text-ink-500 uppercase tracking-wide block mb-1.5">
                    Sponsored By
                  </label>
                  <input
                    type="text"
                    value={sponsoredBy}
                    onChange={(e) => setSponsoredBy(e.target.value)}
                    placeholder="Brand name..."
                    className="input-field text-sm"
                  />
                </div>
              )}

              <div className="pt-2">
                <label className="font-sans text-xs font-semibold text-ink-500 uppercase tracking-wide block mb-1.5">
                  Schedule Post
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="input-field text-sm font-sans"
                />
                <p className="text-[10px] text-ink-400 mt-1">
                  Leave blank to publish immediately or save as draft.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* SEO */}
        <div className="bg-white dark:bg-ink-900 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
          <button
            onClick={() => setSeoOpen(!seoOpen)}
            className="w-full flex items-center justify-between px-5 py-4 font-sans text-sm font-bold text-ink-700 dark:text-ink-200"
          >
            SEO Settings
            {seoOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {seoOpen && (
            <div className="px-5 pb-5 space-y-4 border-t border-stone-100 dark:border-stone-800 pt-4">
              <div>
                <label className="font-sans text-xs font-semibold text-ink-500 uppercase tracking-wide block mb-1.5">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={title || "Meta title..."}
                  className="input-field text-sm"
                  maxLength={60}
                />
                <p className="text-[10px] text-ink-400 mt-1">
                  {metaTitle.length}/60 chars
                </p>
              </div>
              <div>
                <label className="font-sans text-xs font-semibold text-ink-500 uppercase tracking-wide block mb-1.5">
                  Meta Description
                </label>
                <textarea
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  placeholder="Meta description..."
                  rows={3}
                  className="input-field text-sm resize-none"
                  maxLength={160}
                />
                <p className="text-[10px] text-ink-400 mt-1">
                  {metaDesc.length}/160 chars
                </p>
              </div>
              <div>
                <label className="font-sans text-xs font-semibold text-ink-500 uppercase tracking-wide block mb-1.5">
                  Focus Keyword
                </label>
                <input
                  type="text"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="Main keyword..."
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="font-sans text-xs font-semibold text-ink-500 uppercase tracking-wide block mb-1.5">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://..."
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="font-sans text-xs font-semibold text-ink-500 uppercase tracking-wide block mb-1.5">
                  OG Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    placeholder="URL..."
                    className="flex-1 input-field text-sm"
                  />
                  <label className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg cursor-pointer hover:bg-stone-200">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append("file", file);
                        const res = await fetch("/api/upload", {
                          method: "POST",
                          body: fd,
                        });
                        const data = await res.json();
                        if (data.media?.secureUrl)
                          setOgImage(data.media.secureUrl);
                      }}
                    />
                  </label>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={noIndex}
                  onChange={(e) => setNoIndex(e.target.checked)}
                  className="accent-brand-500"
                />
                <span className="font-sans text-xs font-medium text-ink-700 dark:text-ink-300">
                  No Index (Ghost Post)
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Advanced / JSON-LD */}
        <div className="bg-white dark:bg-ink-900 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
          <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="w-full flex items-center justify-between px-5 py-4 font-sans text-sm font-bold text-ink-700 dark:text-ink-200"
          >
            Advanced Settings
            {advancedOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {advancedOpen && (
            <div className="px-5 pb-5 space-y-4 border-t border-stone-100 dark:border-stone-800 pt-4">
              <div>
                <label className="font-sans text-xs font-semibold text-ink-500 uppercase tracking-wide block mb-1.5">
                  Schema / JSON-LD
                </label>
                <textarea
                  value={jsonLd}
                  onChange={(e) => setJsonLd(e.target.value)}
                  placeholder='{"@context": "https://schema.org", ...}'
                  rows={4}
                  className="input-field text-xs font-mono resize-none bg-stone-50 dark:bg-ink-950"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
