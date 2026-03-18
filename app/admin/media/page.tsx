"use client";

import { useState, useEffect, useCallback } from "react";
import NextImage from "next/image";
import {
  Upload,
  Search,
  Grid,
  List,
  Trash2,
  Copy,
  Download,
  Check,
  X,
  Image as ImageIcon,
  Filter,
  Folder,
  FolderOpen,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
interface MediaItem {
  _id: string;
  publicId: string;
  url: string;
  secureUrl: string;
  originalFilename: string;
  format: string;
  width: number;
  height: number;
  size: number;
  uploadedBy: { _id: string; name: string };
  createdAt: string;
  alt: string;
  folder?: string;
  synced?: boolean;
}

export default function AdminMediaPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [selected, setSelected] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [folders, setFolders] = useState<{ name: string; count: number }[]>([]);
  const [selectedFolder, setSelectedFolder] = useState("All Folders");

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/media?search=${search}&type=${typeFilter}&folder=${selectedFolder}`,
      );
      const data = await res.json();
      if (data.media) setMedia(data.media);
      if (data.folders) setFolders(data.folders);
    } catch {
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, selectedFolder]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fd = new FormData();
      fd.append("file", file);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (res.ok) successCount++;
        else toast.error(`Failed to upload ${file.name}`);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    if (successCount > 0) {
      toast.success(`Uploaded ${successCount} file(s)`);
      fetchMedia();
    }
  };

  const handleDelete = async (publicIds: string[]) => {
    if (!confirm(`Delete ${publicIds.length} file(s)? This cannot be undone.`))
      return;

    let deletedCount = 0;
    for (const id of publicIds) {
      try {
        const res = await fetch(`/api/upload?publicId=${id}`, {
          method: "DELETE",
        });
        if (res.ok) deletedCount++;
      } catch {
        // ignore individual fails
      }
    }

    if (deletedCount > 0) {
      toast.success(`Deleted ${deletedCount} file(s)`);
      setSelected([]);
      fetchMedia();
    }
  };

  const filtered = media;

  const toggleSelect = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const copyUrl = async (id: string, url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("URL copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1000000) return (bytes / 1000000).toFixed(1) + " MB";
    return (bytes / 1000).toFixed(0) + " KB";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-ink-900 dark:text-ink-50">
            Media Library
          </h1>
          <p className="text-sm text-ink-500 font-sans mt-0.5">
            {filtered.length} files · Powered by Cloudinary
          </p>
        </div>
        <label className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-sans font-600 transition-colors cursor-pointer disabled:opacity-70">
          <Upload size={16} />
          {uploading ? "Uploading..." : "Upload Files"}
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/*,video/*"
            disabled={uploading}
            onChange={(e) => handleUpload(e.target.files as any)}
          />
        </label>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) handleUpload(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? "border-brand-400 bg-brand-50 dark:bg-brand-950"
            : "border-ink-300 dark:border-ink-700 bg-ink-50 dark:bg-ink-900/50"
        }`}
      >
        <ImageIcon
          size={32}
          className="mx-auto text-ink-300 dark:text-ink-600 mb-2"
        />
        <p className="text-sm font-sans font-600 text-ink-600 dark:text-ink-400">
          Drag & drop files here, or{" "}
          <span className="text-brand-500">browse</span>
        </p>
        <p className="text-xs font-sans text-ink-400 mt-1">
          PNG, JPG, GIF, WebP, MP4 up to 20MB
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Folder Navigation */}
        <div className="w-full lg:w-64 space-y-4">
          <div className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-ink-100 dark:border-ink-800 bg-ink-50 dark:bg-ink-950">
              <h3 className="text-sm font-sans font-bold text-ink-900 dark:text-white flex items-center gap-2">
                <Folder size={16} className="text-brand-500" />
                Folders
              </h3>
            </div>
            <div className="p-2 space-y-1">
              <button
                onClick={() => setSelectedFolder("All Folders")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-sans transition-colors ${
                  selectedFolder === "All Folders"
                    ? "bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400"
                    : "text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  {selectedFolder === "All Folders" ? (
                    <FolderOpen size={16} />
                  ) : (
                    <Folder size={16} />
                  )}
                  <span>All Media</span>
                </div>
                <span className="text-xs opacity-60">
                  {folders.reduce((acc, f) => acc + f.count, 0)}
                </span>
              </button>

              {folders.map((folder) => (
                <button
                  key={folder.name}
                  onClick={() => setSelectedFolder(folder.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-sans transition-colors ${
                    selectedFolder === folder.name
                      ? "bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400"
                      : "text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {selectedFolder === folder.name ? (
                      <FolderOpen size={16} />
                    ) : (
                      <Folder size={16} />
                    )}
                    <span className="truncate">{folder.name}</span>
                  </div>
                  <span className="text-xs opacity-60">{folder.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-lg text-sm font-sans focus:outline-none focus:border-brand-400"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-lg px-3 py-2 text-sm font-sans text-ink-700 dark:text-ink-300 focus:outline-none"
        >
          <option>All Types</option>
          <option>Images</option>
          <option>Videos</option>
          <option>Documents</option>
        </select>

        <div className="ml-auto flex items-center gap-1 bg-ink-100 dark:bg-ink-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-white dark:bg-ink-900 shadow-sm" : "text-ink-500"}`}
          >
            <Grid size={14} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-white dark:bg-ink-900 shadow-sm" : "text-ink-500"}`}
          >
            <List size={14} />
          </button>
        </div>

        {selected.length > 0 && (
          <button
            onClick={() =>
              handleDelete(
                media
                  .filter((m) => selected.includes(m._id))
                  .map((m) => m.publicId),
              )
            }
            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-950 text-red-600 text-sm font-sans font-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 size={14} /> Delete ({selected.length})
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800">
          <ImageIcon
            size={48}
            className="mx-auto text-ink-300 dark:text-ink-700 mb-4"
          />
          <h3 className="text-lg font-headline font-bold text-ink-900 dark:text-white mb-1">
            No media found
          </h3>
          <p className="text-sm font-sans text-ink-500">
            Upload your first files to get started.
          </p>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {filtered.map((media) => (
                <div
                  key={media._id}
                  className={`group relative bg-white dark:bg-ink-900 border rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selected.includes(media._id)
                      ? "border-brand-400 ring-2 ring-brand-300"
                      : "border-ink-200 dark:border-ink-800 hover:border-ink-300 dark:hover:border-ink-700"
                  }`}
                  onClick={() => toggleSelect(media._id)}
                >
                  {/* Sync Status Badge */}
                  {media.synced && (
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-green-500/80 rounded text-[10px] font-sans font-bold text-white uppercase tracking-wider">
                      Synced
                    </div>
                  )}

                  <div className="aspect-square bg-ink-100 dark:bg-ink-800">
                    <NextImage
                      src={media.secureUrl || media.url}
                      alt={media.alt || media.originalFilename}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Selected Check */}
                  {selected.includes(media._id) && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                      <Check size={11} className="text-white" />
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyUrl(media._id, media.url);
                      }}
                      className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      title="Copy URL"
                    >
                      {copiedId === media._id ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <Copy size={14} className="text-ink-700" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete([media.publicId]);
                      }}
                      className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>

                  <div className="p-2">
                    <p className="text-xs font-sans text-ink-600 dark:text-ink-400 truncate">
                      {media.originalFilename}
                    </p>
                    <p className="text-xs font-sans text-ink-400">
                      {formatSize(media.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-950">
                    <th className="w-10 px-4 py-3" />
                    {[
                      "File",
                      "Folder",
                      "Format",
                      "Dimensions",
                      "Size",
                      "Uploaded By",
                      "Date",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-sans font-600 text-ink-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                    <th className="w-24 px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                  {filtered.map((media) => (
                    <tr
                      key={media._id}
                      className="hover:bg-ink-50 dark:hover:bg-ink-800/30"
                    >
                      <td className="px-4 py-2">
                        <NextImage
                          src={media.secureUrl || media.url}
                          alt={media.originalFilename}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-sm font-sans text-ink-800 dark:text-ink-200">
                          {media.originalFilename}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-xs font-sans px-2 py-0.5 bg-ink-100 dark:bg-ink-800 rounded text-ink-500">
                          {media.folder || "uploads"}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-xs font-sans text-ink-500 uppercase">
                          {media.format}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-xs font-sans text-ink-500">
                          {media.width}×{media.height}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-xs font-sans text-ink-500">
                          {formatSize(media.size)}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-xs font-sans text-ink-500">
                          {media.uploadedBy.name}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-xs font-sans text-ink-500">
                          {new Date(media.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              copyUrl(media._id, media.secureUrl || media.url)
                            }
                            className="p-1.5 text-ink-400 hover:text-ink-600 dark:hover:text-ink-300 transition-colors"
                          >
                            {copiedId === media._id ? (
                              <Check size={14} className="text-green-500" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete([media.publicId])}
                            className="p-1.5 text-ink-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      </div>
      </div>
    </div>
  );
}
