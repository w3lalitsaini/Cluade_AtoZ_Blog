import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Hash, Clock, Eye } from "lucide-react";
import ArticleCard from "@/components/article/ArticleCard";
import AdUnit from "@/components/ads/AdUnit";
import { generateMetadata as genMeta } from "@/lib/seo";
import { formatNumber } from "@/lib/utils";
import connectDB from "@/lib/db";
import Tag from "@/models/Tag";
import Post from "@/models/Post";
import "@/models/index"; // ensure Tag, Category etc. schemas are registered

type Props = { params: Promise<{ slug: string }> };

async function getTagData(slug: string) {
  await connectDB();
  const tag = await Tag.findOne({ slug }).lean();
  if (!tag) return null;

  const posts = await Post.find({
    tags: tag._id,
    status: "published",
  })
    .sort({ publishedAt: -1 })
    .limit(20)
    .populate("author", "name image")
    .populate("category", "name slug color")
    .lean();

  return {
    tag: tag as any,
    posts: posts as any[],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTagData(slug);
  if (!data) return {};

  const { tag } = data;
  return genMeta({
    title: `#${tag.name} - Explore Topics`,
    description: `Browse all articles tagged with #${tag.name} on AtoZ Blogs.`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/tag/${tag.slug}`,
  });
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const data = await getTagData(slug);
  if (!data) notFound();

  const { tag, posts } = data;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      {/* Tag Header */}
      <div className="mb-10 text-center">
        <nav className="flex justify-center items-center gap-2 text-xs font-sans text-ink-500 mb-6">
          <Link href="/" className="hover:text-brand-500 transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <span className="text-ink-400">Tag</span>
          <ChevronRight size={12} />
          <span className="font-600 text-brand-500">#{tag.name}</span>
        </nav>

        <div className="inline-flex items-center gap-3 px-6 py-3 bg-brand-50 dark:bg-brand-900/20 rounded-full border border-brand-100 dark:border-brand-800 mb-4">
          <Hash className="text-brand-500" size={24} />
          <h1 className="font-headline text-3xl md:text-4xl font-black text-ink-950 dark:text-white">
            {tag.name}
          </h1>
        </div>
        <p className="text-ink-500 font-sans text-sm">
          {posts.length} articles found with this tag
        </p>
      </div>

      <AdUnit position="header" className="max-w-[728px] mx-auto mb-12" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <main className="lg:col-span-3">
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <ArticleCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-ink-50 dark:bg-ink-900 rounded-2xl">
              <p className="text-ink-500 font-sans">
                No articles found with this tag.
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

            <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-6 text-white text-center shadow-xl shadow-brand-500/20">
              <h3 className="font-headline text-xl font-800 mb-2">
                Join the Community
              </h3>
              <p className="text-white/80 text-sm font-sans mb-6">
                Get the latest stories on #{tag.name} and more delivered to your
                inbox.
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm font-sans text-white placeholder-white/50 focus:outline-none focus:border-white transition-all"
                />
                <button className="w-full bg-white text-brand-600 font-sans font-700 py-2.5 rounded-xl hover:bg-white/90 transition-all">
                  Subscribe Now
                </button>
              </form>
            </div>

            <AdUnit position="sidebar" />
          </div>
        </aside>
      </div>
    </div>
  );
}
