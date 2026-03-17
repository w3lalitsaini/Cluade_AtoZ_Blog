import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Clock, Eye, TrendingUp } from "lucide-react";
import ArticleCard from "@/components/article/ArticleCard";
import AdUnit from "@/components/ads/AdUnit";
import { generateMetadata as genMeta } from "@/lib/seo";
import { formatDate, formatNumber } from "@/lib/utils";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import Post from "@/models/Post";
import "@/models/index"; // ensure Tag, Category etc. schemas are registered

type Props = { params: Promise<{ slug: string }> };

async function getCategoryData(slug: string) {
  await connectDB();
  const category = await Category.findOne({ slug, isActive: true }).lean();
  if (!category) return null;

  const posts = await Post.find({
    category: category._id,
    status: "published",
  })
    .sort({ publishedAt: -1 })
    .limit(20)
    .populate("author", "name image")
    .populate("category", "name slug color")
    .lean();

  const trending = await Post.find({
    category: category._id,
    status: "published",
    publishedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
  })
    .sort({ viewCount: -1 })
    .limit(5)
    .lean();

  const otherCategories = await Category.find({
    slug: { $ne: slug },
    isActive: true,
  })
    .limit(6)
    .lean();

  return JSON.parse(
    JSON.stringify({
      category: category as any,
      posts: posts as any[],
      trending: trending as any[],
      otherCategories: otherCategories as any[],
    }),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryData(slug);
  if (!data) return {};

  const { category } = data;
  return genMeta({
    title: `${category.name} News & Articles`,
    description: `Read the latest ${category.name} news, analysis, and stories on AtoZ Blogs.`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/category/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const data = await getCategoryData(slug);
  if (!data) notFound();

  const { category, posts, trending, otherCategories } = data;

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <>
      {/* Category Header */}
      <div
        className="py-10 border-b border-ink-200 dark:border-ink-800"
        style={{ borderLeftColor: category.color, borderLeftWidth: 4 }}
      >
        <div className="max-w-screen-xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-sans text-ink-500 mb-4">
            <Link href="/" className="hover:text-brand-500 transition-colors">
              Home
            </Link>
            <ChevronRight size={12} />
            <span className="font-600" style={{ color: category.color }}>
              {category.name}
            </span>
          </nav>

          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="w-1 h-8 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <h1 className="font-headline text-4xl md:text-5xl font-black text-ink-950 dark:text-white">
                  {category.name}
                </h1>
              </div>
              <p className="text-ink-500 font-sans text-sm ml-5">
                Real-time updates · {posts.length} stories available
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <AdUnit position="header" className="max-w-[728px] mx-auto mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {featured && (
              <section>
                <ArticleCard post={featured} variant="large" />
              </section>
            )}

            {rest.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="section-title">Latest in {category.name}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {rest.slice(0, 8).map((post: any) => (
                    <ArticleCard key={post._id} post={post} />
                  ))}
                </div>
              </section>
            )}

            <AdUnit position="in-article" />

            {rest.length > 8 && (
              <section>
                <div className="space-y-4">
                  {rest.slice(8).map((post: any) => (
                    <ArticleCard
                      key={post._id}
                      post={post}
                      variant="horizontal"
                    />
                  ))}
                </div>
              </section>
            )}

            {posts.length === 0 && (
              <div className="text-center py-20 bg-ink-50 dark:bg-ink-900 rounded-2xl">
                <p className="text-ink-500 font-sans">
                  No stories yet in this category.
                </p>
                <Link
                  href="/"
                  className="text-brand-500 font-600 mt-2 inline-block"
                >
                  Explore other topics →
                </Link>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="lg:sticky lg:top-20 space-y-6">
              <AdUnit position="sidebar" />

              {trending.length > 0 && (
                <div className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-xl p-5">
                  <h3 className="section-title flex items-center gap-2 text-lg mb-5">
                    <TrendingUp size={18} style={{ color: category.color }} />
                    Trending
                  </h3>
                  <ol className="space-y-4">
                    {trending.map((post: any, i: number) => (
                      <li key={post._id} className="flex gap-3 group">
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-sans font-700 text-white flex-shrink-0 transition-transform group-hover:scale-110"
                          style={{ backgroundColor: category.color }}
                        >
                          {i + 1}
                        </span>
                        <div>
                          <Link
                            href={`/article/${post.slug}`}
                            className="text-sm font-headline font-700 text-ink-800 dark:text-ink-200 group-hover:text-brand-500 transition-colors line-clamp-2"
                          >
                            {post.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1 text-xs font-sans text-ink-400">
                            <Eye size={10} /> {formatNumber(post.viewCount)}
                            <Clock size={10} /> {post.readingTime}m
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-xl p-5">
                <h3 className="section-title text-lg mb-4">More Topics</h3>
                <div className="space-y-2">
                  {otherCategories.map((cat: any) => (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}`}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors group"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="flex-1 text-sm font-sans text-ink-700 dark:text-ink-300 group-hover:text-brand-500 transition-colors">
                        {cat.name}
                      </span>
                      <span className="text-xs font-sans text-ink-400">→</span>
                    </Link>
                  ))}
                </div>
              </div>

              <AdUnit position="sidebar" />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
