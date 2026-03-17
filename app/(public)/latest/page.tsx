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

export default async function LatestArticlesPage() {
  const posts = (await getLatestPosts()) as any[];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
