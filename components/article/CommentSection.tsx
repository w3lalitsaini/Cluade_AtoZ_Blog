"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  MessageSquare,
  Send,
  Reply,
  CornerDownRight,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

interface CommentType {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    image?: string;
    role: string;
  };
  replies?: CommentType[];
  createdAt: string;
}

export default function CommentSection({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(
    null,
  );

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/comments?postId=${postId}`);
        const data = await res.json();
        setComments(data);
      } catch (error) {
        console.error("Failed to fetch comments");
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return toast.error("Please sign in to comment");
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          content,
          parentId: replyTo?.id || null,
        }),
      });

      if (!res.ok) throw new Error();
      const newComment = await res.json();

      if (replyTo) {
        setComments(
          comments.map((c) =>
            c._id === replyTo.id
              ? { ...c, replies: [...(c.replies || []), newComment] }
              : c,
          ),
        );
      } else {
        setComments([newComment, ...comments]);
      }

      setContent("");
      setReplyTo(null);
      toast.success("Comment posted!");
    } catch (error) {
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const CommentItem = ({
    comment,
    isReply = false,
  }: {
    comment: CommentType;
    isReply?: boolean;
  }) => (
    <div className={`group relative ${isReply ? "mt-4 ml-12" : "mt-8"}`}>
      <div className="flex gap-4">
        <div className="shrink-0">
          <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden border border-stone-200 dark:border-stone-700">
            {comment.author.image ? (
              <Image
                src={comment.author.image}
                alt={comment.author.name}
                width={40}
                height={40}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-ink-400">
                {comment.author.name[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans font-bold text-sm text-ink-950 dark:text-white">
              {comment.author.name}
            </span>
            {comment.author.role === "admin" && (
              <span className="text-[10px] bg-brand-500 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
                Staff
              </span>
            )}
            <span className="text-xs text-ink-400">·</span>
            <span className="text-xs text-ink-400 font-sans">
              {formatDate(comment.createdAt, "relative")}
            </span>
          </div>
          <p className="text-ink-700 dark:text-ink-300 font-body text-sm leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
          {!isReply && session && (
            <button
              onClick={() => {
                setReplyTo({ id: comment._id, name: comment.author.name });
                document
                  .getElementById("comment-form")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-2 text-xs font-bold text-ink-400 hover:text-brand-500 flex items-center gap-1 transition-colors"
            >
              <Reply className="w-3 h-3" />
              Reply
            </button>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-stone-100 dark:bg-stone-800" />
          {comment.replies.map((reply) => (
            <CommentItem key={reply._id} comment={reply} isReply />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section className="mt-16 pt-16 border-t border-stone-100 dark:border-stone-800">
      <div className="flex items-center gap-3 mb-10">
        <MessageSquare className="w-6 h-6 text-brand-500" />
        <h2 className="font-heading text-2xl font-bold text-ink-950 dark:text-white">
          Community Thoughts
        </h2>
        <span className="text-ink-400 font-sans text-sm ml-auto">
          {comments.length} comments
        </span>
      </div>

      {session ? (
        <form id="comment-form" onSubmit={handleSubmit} className="mb-12">
          {replyTo && (
            <div className="flex items-center justify-between bg-stone-50 dark:bg-ink-900 px-4 py-2 rounded-t-xl border-x border-t border-stone-100 dark:border-stone-800">
              <span className="text-xs font-sans text-ink-500">
                Replying to <span className="font-bold">{replyTo.name}</span>
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-xs text-red-500 font-bold hover:underline"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="relative">
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                replyTo ? "Write your reply..." : "What are your thoughts?"
              }
              rows={4}
              className={`w-full bg-stone-50 dark:bg-ink-900 border border-stone-200 dark:border-stone-800 rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${replyTo ? "rounded-t-none" : ""}`}
            ></textarea>
            <div className="absolute bottom-4 right-4 flex items-center gap-4">
              <span className="text-xs text-ink-400 font-sans hidden sm:block">
                {content.length}/2000
              </span>
              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="bg-brand-600 hover:bg-brand-500 disabled:bg-stone-200 dark:disabled:bg-stone-800 text-white p-2.5 rounded-lg transition-all shadow-lg shadow-brand-600/20"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-8 rounded-2xl bg-stone-50 dark:bg-ink-900 border border-stone-100 dark:border-stone-800 text-center mb-12">
          <p className="text-ink-600 dark:text-ink-400 font-body mb-4">
            You must be signed in to join the conversation.
          </p>
          <button
            onClick={() => (window.location.href = "/auth/login")}
            className="btn-primary"
          >
            Sign In to Comment
          </button>
        </div>
      )}

      <div className="space-y-2">
        {loading ? (
          <div className="flex flex-col gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-32 bg-stone-100 dark:bg-stone-800 rounded" />
                  <div className="h-20 w-full bg-stone-100 dark:bg-stone-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-stone-100 dark:border-stone-800 rounded-3xl">
            <p className="text-ink-400 font-body italic">
              No comments yet. Be the first to share your perspective!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
