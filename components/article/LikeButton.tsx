"use client";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function LikeButton({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const res = await fetch(`/api/articles/like?postId=${postId}`);
        const data = await res.json();
        setLiked(data.liked);
        setCount(data.likeCount);
      } catch (error) {
        console.error("Failed to fetch like status");
      } finally {
        setLoading(false);
      }
    };
    fetchLikeStatus();
  }, [postId]);

  const handleLike = async () => {
    if (!session) {
      return toast.error("Please sign in to like articles");
    }

    // Optimistic UI
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);

    try {
      const res = await fetch("/api/articles/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setLiked(data.liked);
    } catch (error) {
      setLiked(prevLiked);
      setCount(prevCount);
      toast.error("Failed to update like status");
    }
  };

  if (loading)
    return (
      <div className="w-16 h-10 bg-stone-100 dark:bg-stone-800 animate-pulse rounded-full" />
    );

  return (
    <button
      onClick={handleLike}
      className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-all duration-300 ${
        liked
          ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30"
          : "bg-stone-50 dark:bg-ink-900 text-ink-500 hover:text-red-600 dark:hover:text-red-400 border border-stone-100 dark:border-stone-800"
      }`}
    >
      <div className="relative">
        <Heart
          className={`w-5 h-5 transition-transform duration-300 ${liked ? "fill-current scale-110" : "scale-100"}`}
        />
        <AnimatePresence>
          {liked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 1.5, 0], opacity: [1, 0.5, 0] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Heart className="w-5 h-5 fill-current text-red-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <span className="font-sans font-bold text-sm tracking-tight">
        {count}
      </span>
    </button>
  );
}
