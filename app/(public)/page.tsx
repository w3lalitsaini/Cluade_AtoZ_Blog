import Link from "next/link";
import Image from "next/image";
import BreakingNewsBanner from "@/components/layout/BreakingNewsBanner";
import ArticleCard from "@/components/article/ArticleCard";
import AdUnit from "@/components/ads/AdUnit";
import { generateMetadata as genMeta } from "@/lib/seo";
import { Metadata } from "next";
import { TrendingUp, Flame, Star, Clock, ChevronRight } from "lucide-react";
import { CATEGORIES } from "@/lib/utils";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import "@/models/index"; // ensure Tag, Category etc. schemas are registered

import Category from "@/models/Category";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://atozblogs.com";

export const metadata: Metadata = genMeta({
  title: "AtoZ Blogs - News & Stories That Matter",
  description:
    "Breaking news, in-depth analysis, and stories across technology, business, politics, health, and more.",
  url: siteUrl,
  image: "/images/favicon.svg",
});

async function getHomePageData() {
  await connectDB();

  const [
    breakingPosts,
    featuredPosts,
    latestPosts,
    trendingPosts,
    editorsPicks,
    allCategories,
  ] = await Promise.all([
    Post.find({ status: "published", isBreaking: true })
      .sort({ publishedAt: -1 })
      .limit(5)
      .select("title slug")
      .lean(),
    Post.find({ status: "published", isFeatured: true })
      .sort({ publishedAt: -1 })
      .limit(5)
      .populate("author", "name image")
      .populate("category", "name slug color")
      .select(
        "title slug excerpt featuredImage publishedAt readingTime viewCount likeCount author category isBreaking isFeatured",
      )
      .lean(),
    Post.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .limit(8)
      .populate("author", "name image")
      .populate("category", "name slug color")
      .select(
        "title slug excerpt featuredImage publishedAt readingTime viewCount likeCount author category",
      )
      .lean(),
    Post.find({ status: "published" })
      .sort({ viewCount: -1 })
      .limit(5)
      .populate("category", "name slug")
      .select("title slug viewCount category publishedAt readingTime")
      .lean(),
    Post.find({ status: "published", isEditorsPick: true })
      .sort({ publishedAt: -1 })
      .limit(4)
      .populate("author", "name image")
      .populate("category", "name slug color")
      .select(
        "title slug excerpt featuredImage publishedAt readingTime author category",
      )
      .lean(),
    Category.find({ isActive: true }).sort({ order: 1 }).lean(),
  ]);

  return JSON.parse(
    JSON.stringify({
      breakingNews: breakingPosts.length > 0 ? breakingPosts : [],
      featuredPosts: featuredPosts,
      latestPosts: latestPosts,
      trendingPosts: trendingPosts,
      editorsPicks: editorsPicks,
      categoriesList: allCategories.length > 0 ? allCategories : CATEGORIES,
    }),
  );
}

export default async function HomePage() {
  const {
    breakingNews,
    featuredPosts,
    latestPosts,
    trendingPosts,
    editorsPicks,
    categoriesList,
  } = await getHomePageData();

  const featuredPost = (featuredPosts[0] as any) || (latestPosts[0] as any) || {};
  const topStories = featuredPosts.slice(1, 4) as any[];
  const trendingNews = trendingPosts as any[];

  return (
    <>
      {/* Breaking News */}
      <BreakingNewsBanner items={breakingNews} />

      {/* Header Ad */}
      <div className="bg-white dark:bg-ink-950 py-3">
        <div className="max-w-screen-xl mx-auto px-4">
          <AdUnit position="header" className="max-w-[728px] mx-auto" />
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Featured Stories Grid */}
        <section className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hero */}
            <div className="lg:col-span-2">
              <ArticleCard post={featuredPost} variant="large" />
            </div>
            {/* Side Stories */}
            <div className="flex flex-col gap-4">
              {topStories.map((post) => (
                <ArticleCard key={post._id} post={post} variant="horizontal" />
              ))}
            </div>
          </div>
        </section>

        {/* Category Quick Nav */}
        <section className="mb-10 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {categoriesList.map((cat: any) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-sans font-600 text-white transition-all hover:opacity-90 hover:shadow-md"
                style={{ backgroundColor: cat.color }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Main Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Latest Articles */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title flex items-center gap-2">
                  <Clock size={22} className="text-brand-500" />
                  Latest Articles
                </h2>
                <Link
                  href="/latest"
                  className="text-sm font-sans font-600 text-brand-500 hover:text-brand-600 flex items-center gap-1"
                >
                  View All <ChevronRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {(latestPosts as any[]).slice(0, 6).map((post) => (
                  <ArticleCard key={post._id} post={post} />
                ))}
              </div>
            </section>

            {/* In-article Ad */}
            <AdUnit position="in-article" />

            {/* Editor's Picks */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title flex items-center gap-2">
                  <Star size={22} className="text-gold-500" />
                  Editor&apos;s Picks
                </h2>
              </div>
              <div className="space-y-4">
                {(editorsPicks as any[]).map((post) => (
                  <ArticleCard
                    key={post._id}
                    post={post}
                    variant="horizontal"
                  />
                ))}
              </div>
            </section>

            {/* Popular Articles */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title flex items-center gap-2">
                  <Flame size={22} className="text-orange-500" />
                  Most Popular
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {(trendingPosts.length > 0
                  ? trendingPosts
                  : latestPosts.slice(0, 4)
                ).map((post: any) => (
                  <ArticleCard key={post._id} post={post} />
                ))}
              </div>
            </section>

            {/* Between paragraphs Ad */}
            <AdUnit position="between-paragraphs" />
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Sidebar Ad */}
            <AdUnit position="sidebar" />

            {/* Trending */}
            <div className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-xl p-5">
              <h3 className="section-title flex items-center gap-2 text-xl mb-5">
                <TrendingUp size={20} className="text-brand-500" />
                Trending Now
              </h3>
              <ol className="space-y-4">
                {trendingNews.map((post, i) => (
                  <li key={post._id} className="flex gap-3 group">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-ink-100 dark:bg-ink-800 flex items-center justify-center text-sm font-sans font-700 text-ink-400 group-hover:bg-brand-500 group-hover:text-white transition-all">
                      {i + 1}
                    </span>
                    <div>
                      <Link
                        href={`/article/${post.slug}`}
                        className="text-sm font-headline font-700 text-ink-800 dark:text-ink-200 group-hover:text-brand-500 transition-colors leading-snug line-clamp-2"
                      >
                        {post.title}
                      </Link>
                      <p className="text-xs text-ink-500 font-sans mt-1">
                        {post.viewCount.toLocaleString()} views
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Categories Widget */}
            <div className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-xl p-5">
              <h3 className="section-title text-xl mb-5">Browse Topics</h3>
              <div className="grid grid-cols-2 gap-2">
                {categoriesList.map((cat: any) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-sans text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors border border-ink-100 dark:border-ink-800"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter Signup (Replaced with a client component for interaction or just link to subscribe) */}
            <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl p-5 text-white">
              <h3 className="font-headline text-xl font-700 mb-2">
                Daily Newsletter
              </h3>
              <p className="text-sm text-brand-100 mb-4 font-sans">
                Get the top stories of the day delivered to your inbox.
              </p>
              <Link
                href="/subscribe"
                className="block w-full text-center bg-white text-brand-600 hover:bg-brand-50 rounded px-4 py-2 text-sm font-sans font-700 transition-colors"
              >
                Subscribe Free
              </Link>
              <p className="text-xs text-brand-200 mt-2 font-sans text-center">
                No spam. Unsubscribe anytime.
              </p>
            </div>

            {/* Second Sidebar Ad */}
            <AdUnit position="sidebar" />
          </aside>
        </div>

        {/* Video Section */}
        <section className="mt-12 mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title text-2xl">Video Stories</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(latestPosts as any[]).slice(0, 4).map((post) => (
              <article key={post._id} className="group cursor-pointer">
                <div className="relative rounded-lg overflow-hidden h-44 mb-3">
                  {post.featuredImage ? (
                    <Image
                      src={post.featuredImage}
                      alt={post.title || "Story"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-ink-200 dark:bg-ink-800" />
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:bg-white transition-colors">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5 fill-brand-500 ml-1"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-sans px-2 py-0.5 rounded">
                    {2 + post.readingTime}:30
                  </span>
                </div>
                <span
                  className="text-xs font-sans font-700 uppercase tracking-widest"
                  style={{ color: post.category?.color || "#ef4444" }}
                >
                  {post.category?.name || "Uncategorized"}
                </span>
                <h3 className="font-headline text-base font-700 text-ink-900 dark:text-ink-100 mt-1 group-hover:text-brand-500 transition-colors line-clamp-2">
                  {post.title}
                </h3>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* Footer Ad */}
      <div className="bg-ink-50 dark:bg-ink-900 py-6 border-t border-ink-200 dark:border-ink-800">
        <div className="max-w-screen-xl mx-auto px-4">
          <AdUnit position="footer" className="max-w-[970px] mx-auto" />
        </div>
      </div>
    </>
  );
}
