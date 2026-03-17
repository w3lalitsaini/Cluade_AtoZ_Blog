"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  CheckCircle,
  Trash2,
  AlertTriangle,
  MessageSquare,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface CommentAuthor {
  name: string;
  email: string;
  image?: string;
}

interface CommentPost {
  _id: string;
  title: string;
  slug: string;
}

interface IComment {
  _id: string;
  content: string;
  author: CommentAuthor;
  post: CommentPost;
  isApproved: boolean;
  isSpam: boolean;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending:
    "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400",
  approved: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400",
  spam: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
};

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<IComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comments?status=${statusFilter}`);
      const data = await res.json();
      if (res.ok) {
        setComments(data);
      } else {
        toast.error("Failed to fetch comments");
      }
    } catch (error) {
      toast.error("Error fetching comments");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const filtered = comments.filter((c) => {
    const matchSearch =
      c.content.toLowerCase().includes(search.toLowerCase()) ||
      c.author.name.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const getStatus = (c: IComment) => {
    if (c.isSpam) return "spam";
    if (c.isApproved) return "approved";
    return "pending";
  };

  const updateStatus = async (
    id: string,
    isApproved: boolean,
    isSpam: boolean,
  ) => {
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved, isSpam }),
      });
      if (res.ok) {
        toast.success("Comment updated");
        fetchComments();
      } else {
        toast.error("Update failed");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Comment deleted");
        fetchComments();
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const bulkApprove = async () => {
    toast
      .promise(
        Promise.all(
          selected.map((id) =>
            fetch(`/api/comments/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ isApproved: true, isSpam: false }),
            }),
          ),
        ),
        {
          loading: "Approving...",
          success: "Comments approved",
          error: "Some updates failed",
        },
      )
      .then(() => {
        setSelected([]);
        fetchComments();
      });
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} comments?`)) return;
    toast
      .promise(
        Promise.all(
          selected.map((id) =>
            fetch(`/api/comments/${id}`, { method: "DELETE" }),
          ),
        ),
        {
          loading: "Deleting...",
          success: "Comments deleted",
          error: "Some deletions failed",
        },
      )
      .then(() => {
        setSelected([]);
        fetchComments();
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-ink-900 dark:text-ink-50">
            Comments
          </h1>
          <p className="text-sm text-ink-500 font-sans mt-0.5">
            {comments.length} total comments
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-ink-100 dark:bg-ink-800 p-1 rounded-lg w-fit flex-wrap">
        {["all", "pending", "approved", "spam"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-1.5 rounded-md text-sm font-sans font-500 capitalize transition-all ${
              statusFilter === status
                ? "bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 shadow-sm"
                : "text-ink-500 hover:text-ink-700 dark:hover:text-ink-300"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Filters + Bulk */}
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
            placeholder="Search comments..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-lg text-sm font-sans focus:outline-none focus:border-brand-400"
          />
        </div>

        {selected.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm font-sans text-ink-500">
              {selected.length} selected
            </span>
            <button
              onClick={bulkApprove}
              className="px-3 py-1.5 text-xs font-sans font-600 text-green-700 bg-green-50 dark:bg-green-950 rounded-lg hover:bg-green-100 transition-colors"
            >
              Approve All
            </button>
            <button
              onClick={bulkDelete}
              className="px-3 py-1.5 text-xs font-sans font-600 text-red-600 bg-red-50 dark:bg-red-950 rounded-lg hover:bg-red-100 transition-colors"
            >
              Delete All
            </button>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center text-ink-400 animate-pulse">
            Loading comments...
          </div>
        ) : (
          filtered.map((comment) => {
            const status = getStatus(comment);
            return (
              <div
                key={comment._id}
                className={`bg-white dark:bg-ink-900 border rounded-xl p-4 transition-all ${
                  selected.includes(comment._id)
                    ? "border-brand-300 dark:border-brand-700"
                    : "border-ink-200 dark:border-ink-800"
                } ${status === "pending" ? "border-l-4 border-l-yellow-400" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(comment._id)}
                    onChange={() =>
                      setSelected((prev) =>
                        prev.includes(comment._id)
                          ? prev.filter((x) => x !== comment._id)
                          : [...prev, comment._id],
                      )
                    }
                    className="mt-1 rounded border-ink-300"
                  />

                  <div className="w-9 h-9 rounded-full bg-ink-200 dark:bg-ink-700 flex items-center justify-center text-sm font-sans font-700 text-ink-600 dark:text-ink-400 flex-shrink-0">
                    {comment.author?.name?.[0] || "?"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-sans font-600 text-ink-900 dark:text-ink-100">
                        {comment.author?.name || "Deleted User"}
                      </span>
                      <span className="text-xs font-sans text-ink-400">
                        {comment.author?.email || "No email"}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-sans font-500 rounded-full ${statusColors[status]}`}
                      >
                        {status}
                      </span>
                      <span className="text-xs font-sans text-ink-400 flex items-center gap-1">
                        <Clock size={10} />{" "}
                        {formatDate(comment.createdAt, "short")}
                      </span>
                    </div>

                    <p className="text-sm font-sans text-ink-700 dark:text-ink-300 leading-relaxed mb-2">
                      {comment.content}
                    </p>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-sans text-ink-400 flex items-center gap-1">
                        <MessageSquare size={10} /> On:{" "}
                        {comment.post ? (
                          <a
                            href={`/article/${comment.post.slug}`}
                            target="_blank"
                            className="text-brand-500 hover:underline"
                          >
                            {comment.post.title.slice(0, 50)}
                            {comment.post.title.length > 50 ? "..." : ""}
                          </a>
                        ) : (
                          <span className="text-red-500 font-500 italic">
                            Deleted Post
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {status !== "approved" && (
                      <button
                        onClick={() => updateStatus(comment._id, true, false)}
                        className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-950 rounded transition-colors"
                        title="Approve"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    {status !== "spam" && (
                      <button
                        onClick={() => updateStatus(comment._id, false, true)}
                        className="p-1.5 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950 rounded transition-colors"
                        title="Mark as spam"
                      >
                        <AlertTriangle size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => del(comment._id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!loading && filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl">
          <MessageSquare
            size={40}
            className="mx-auto text-ink-300 dark:text-ink-600 mb-3"
          />
          <p className="font-sans text-sm text-ink-400">No comments found</p>
        </div>
      ) : (
        <div className="flex items-center justify-between pt-4 border-t border-ink-100 dark:border-ink-800">
          <button
            className="btn-secondary text-xs px-3 py-1 flex items-center gap-1 disabled:opacity-50"
            disabled
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <button
            className="btn-secondary text-xs px-3 py-1 flex items-center gap-1 disabled:opacity-50"
            disabled
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
