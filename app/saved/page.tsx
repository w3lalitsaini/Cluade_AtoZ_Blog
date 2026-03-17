"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, Clock, Eye, Loader2, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function SavedPostsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/saved")
        .then((r) => r.json())
        .then((data) => {
          setPosts(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status]);

  const handleUnsave = async (postId: string) => {
    const res = await fetch("/api/user/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    if (res.ok) {
      setPosts(posts.filter((p) => p._id !== postId));
      toast.success("Post removed from saved");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-ink-950 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="w-6 h-6 text-brand-500" />
          <h1 className="font-heading text-3xl font-bold text-ink-900 dark:text-white">
            Saved Posts
          </h1>
          <span className="ml-2 text-sm font-sans text-ink-500">
            {posts.length} saved
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white dark:bg-ink-900 rounded-2xl p-12 text-center border border-stone-200 dark:border-stone-700">
            <Bookmark className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h2 className="font-heading text-xl font-bold text-ink-600 dark:text-ink-400 mb-2">
              No saved posts yet
            </h2>
            <p className="font-sans text-ink-400 text-sm mb-6">
              Start saving articles you want to read later.
            </p>
            <Link href="/" className="btn-primary text-sm">
              Browse Articles
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white dark:bg-ink-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-700 shadow-sm flex gap-4 items-start group"
              >
                {post.featuredImage && (
                  <div className="relative w-24 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={post.featuredImage}
                      alt={post.title || ""}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {post.category && (
                      <span
                        className="text-xs font-sans font-700 uppercase tracking-wider px-2 py-0.5 rounded text-white"
                        style={{
                          backgroundColor: post.category.color || "#ef4444",
                        }}
                      >
                        {post.category.name}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/article/${post.slug}`}
                    className="font-heading text-base font-bold text-ink-900 dark:text-ink-100 hover:text-brand-500 transition-colors line-clamp-2"
                  >
                    {post.title}
                  </Link>
                  <p className="font-sans text-xs text-ink-400 mt-1 flex items-center gap-3">
                    {post.author?.name && <span>{post.author.name}</span>}
                    {post.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(post.publishedAt)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.viewCount?.toLocaleString() || 0}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => handleUnsave(post._id)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600 transition-all flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
