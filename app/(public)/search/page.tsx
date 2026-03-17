import type { Metadata } from "next";
import Link from "next/link";
import {
  Search as SearchIcon,
  ChevronRight,
  SlidersHorizontal,
  AlertCircle,
} from "lucide-react";
import ArticleCard from "@/components/article/ArticleCard";
import AdUnit from "@/components/ads/AdUnit";
import { generateMetadata as genMeta } from "@/lib/seo";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import "@/models/index"; // ensure Tag, Category etc. schemas are registered

type Props = {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
};

async function searchPosts(query?: string, category?: string, sort?: string) {
  await connectDB();

  const filter: any = { status: "published" };

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { excerpt: { $regex: query, $options: "i" } },
      { content: { $regex: query, $options: "i" } },
    ];
  }

  if (category) {
    filter.category = category;
  }

  let sortOption: any = { publishedAt: -1 };
  if (sort === "oldest") sortOption = { publishedAt: 1 };
  if (sort === "popular") sortOption = { viewCount: -1 };

  const posts = await Post.find(filter)
    .sort(sortOption)
    .limit(20)
    .populate("author", "name image")
    .populate("category", "name slug color")
    .lean();

  return posts as any[];
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q || "";
  return genMeta({
    title: query ? `Search results for "${query}"` : "Search Articles",
    description: `Search for news, articles, and stories on AtoZ Blogs.`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/search`,
  });
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, category, sort } = await searchParams;
  const query = q || "";
  const posts = await searchPosts(query, category, sort);

  return (
    <>
      <div className="bg-white dark:bg-ink-950 py-3">
        <div className="max-w-screen-xl mx-auto px-4">
          <AdUnit position="header" className="max-w-[728px] mx-auto" />
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-10">
        <nav className="flex items-center gap-2 text-xs font-sans text-ink-500 mb-6">
          <Link href="/" className="hover:text-brand-500 transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <span className="font-600 text-ink-950 dark:text-white">
            Search Results
          </span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <h1 className="font-headline text-3xl md:text-4xl font-black text-ink-950 dark:text-white mb-4">
              {query ? `Results for "${query}"` : "Search our stories"}
            </h1>
            <p className="text-ink-500 font-sans text-sm">
              We found {posts.length} articles matching your criteria
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative group">
              <SlidersHorizontal
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 group-hover:text-brand-500 transition-colors"
                size={14}
              />
              <select
                className="pl-9 pr-8 py-2.5 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-xl text-xs font-sans font-600 text-ink-700 dark:text-ink-300 focus:outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer"
                defaultValue={sort || "newest"}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Results */}
        <main className="lg:col-span-3">
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <ArticleCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-ink-50 dark:bg-ink-900 rounded-3xl border-2 border-dashed border-ink-200 dark:border-ink-800">
              <div className="w-16 h-16 bg-white dark:bg-ink-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <AlertCircle
                  className="text-ink-300 dark:text-ink-600"
                  size={32}
                />
              </div>
              <h2 className="font-headline text-xl font-800 text-ink-950 dark:text-white mb-2">
                No results found
              </h2>
              <p className="text-ink-500 font-sans text-sm max-w-xs mx-auto mb-6">
                Try adjusting your keywords or filters to find what you&apos;re
                looking for.
              </p>
              <Link
                href="/"
                className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-sans font-700 rounded-xl transition-all inline-block shadow-lg shadow-brand-500/20"
              >
                Back to Homepage
              </Link>
            </div>
          )}

          <div className="mt-12">
            <AdUnit position="in-article" />
          </div>

          <div className="mt-8 text-center">
            {posts.length > 0 && (
              <button className="px-8 py-3 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-300 text-sm font-sans font-700 rounded-xl hover:border-brand-500 hover:text-brand-500 transition-all">
                Load More Results
              </button>
            )}
          </div>

          <div className="mt-12">
            <AdUnit position="between-paragraphs" />
          </div>
        </main>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="sticky top-24 space-y-6">
            <AdUnit position="sidebar" />

            <div className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-2xl p-6">
              <h3 className="font-headline font-800 text-lg text-ink-950 dark:text-white mb-4">
                Search Tips
              </h3>
              <ul className="space-y-3">
                <li className="flex gap-2 text-xs text-ink-500 font-sans leading-relaxed">
                  <span className="text-brand-500 mt-1">•</span>
                  Use specific keywords for better results.
                </li>
                <li className="flex gap-2 text-xs text-ink-500 font-sans leading-relaxed">
                  <span className="text-brand-500 mt-1">•</span>
                  Check your spelling and try alternative terms.
                </li>
                <li className="flex gap-2 text-xs text-ink-500 font-sans leading-relaxed">
                  <span className="text-brand-500 mt-1">•</span>
                  Browse by category if you aren&apos;t sure what to search for.
                </li>
              </ul>
            </div>

            <AdUnit position="sidebar" />
          </div>
        </aside>
        </div>
      </div>

      {/* Footer Ad */}
      <div className="bg-ink-50 dark:bg-ink-900 py-6 border-t border-ink-200 dark:border-ink-800 mt-12">
        <div className="max-w-screen-xl mx-auto px-4">
          <AdUnit position="footer" className="max-w-[970px] mx-auto" />
        </div>
      </div>
    </>
  );
}
