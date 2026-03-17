import type { Metadata } from "next";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import ArticleCard from "@/components/article/ArticleCard";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Latest Articles",
  description: `Stay updated with the newest articles and insights from ${config.siteName}.`,
};

async function getLatestPosts() {
  await connectDB();
  return Post.find({ status: "published" })
    .sort({ publishedAt: -1 })
    .limit(20)
    .populate("author", "name image")
    .populate("category", "name slug color")
    .lean();
}

import Link from "next/link";
import { Clock, TrendingUp, ChevronRight } from "lucide-react";
import AdUnit from "@/components/ads/AdUnit";

export default async function LatestArticlesPage() {
  const posts = (await getLatestPosts()) as any[];

  return (
    <>
      {/* Header Ad */}
      <div className="bg-white dark:bg-ink-950 py-3">
        <div className="max-w-screen-xl mx-auto px-4">
          <AdUnit position="header" className="max-w-[728px] mx-auto" />
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-12 md:py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="max-w-2xl">
          <span className="inline-block bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-sm mb-4">
            Freshly Published
          </span>
          <h1 className="font-heading text-4xl md:text-5xl font-black text-ink-950 dark:text-white leading-tight">
            Latest <span className="text-brand-500">Insights</span>
          </h1>
          <p className="text-lg text-ink-500 dark:text-ink-400 font-body mt-4">
            The most recent stories, analysis, and reports from our dedicated
            team of journalists and experts.
          </p>
        </div>

        <div className="font-sans text-sm text-ink-400">
          Showing {posts.length} latest articles
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
        <main className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post) => (
          <ArticleCard key={post._id.toString()} post={post} />
        ))}
      </div>

          {posts.length === 0 && (
            <div className="text-center py-20 bg-stone-50 dark:bg-ink-900/50 rounded-3xl border-2 border-dashed border-stone-200 dark:border-stone-800">
              <p className="text-ink-500 dark:text-ink-400 font-body">
                No articles found. Check back later!
              </p>
            </div>
          )}

          <div className="mt-12">
            <AdUnit position="in-article" />
          </div>
        </main>

        <aside className="lg:col-span-1 space-y-6">
          <div className="sticky top-24 space-y-6">
            <AdUnit position="sidebar" />
            <div className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-2xl p-6">
              <h3 className="font-headline font-800 text-lg text-ink-950 dark:text-white mb-4">
                Latest Updates
              </h3>
              <p className="text-sm text-ink-500 font-sans leading-relaxed">
                Stay tuned for real-time news and in-depth analysis from our global reporters.
              </p>
            </div>
            <AdUnit position="sidebar" />
          </div>
        </aside>
      </div>

      {posts.length > 0 && (
        <div className="mt-20 p-12 rounded-3xl bg-ink-950 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="font-heading text-3xl font-bold mb-4">
              Don&apos;t Miss a Story
            </h2>
            <p className="text-ink-400 max-w-xl mx-auto mb-8 font-body">
              Join our weekly newsletter to get the most important insights
              delivered directly to your inbox.
            </p>
            <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="your.email@example.com"
                className="flex-1 bg-ink-900 border border-ink-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-8 py-3 rounded-xl transition-all whitespace-nowrap">
                Subscribe Free
              </button>
          </div>
        </div>
      )}
    </div>

      {/* Footer Ad */}
      <div className="bg-ink-50 dark:bg-ink-900 py-6 border-t border-ink-200 dark:border-ink-800 mt-12 -mx-4">
        <div className="max-w-screen-xl mx-auto px-4">
          <AdUnit position="footer" className="max-w-[970px] mx-auto" />
        </div>
      </div>
    </>
  );
}
