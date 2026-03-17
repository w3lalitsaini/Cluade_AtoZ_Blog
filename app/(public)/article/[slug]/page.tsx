import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  Clock,
  Eye,
  Heart,
  Share2,
  Bookmark,
  Twitter,
  Facebook,
  Link2,
  Calendar,
} from "lucide-react";
import AdUnit from "@/components/ads/AdUnit";
import ArticleCard from "@/components/article/ArticleCard";
import {
  generateMetadata as genMeta,
  generateArticleSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
// Import to ensure Tag and Category schemas are registered before Post.populate()
import "@/models/index";
import LikeButton from "@/components/article/LikeButton";
import CommentSection from "@/components/article/CommentSection";
import NewsletterSidebar from "@/components/article/NewsletterSidebar";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  await connectDB();
  const post = await Post.findOneAndUpdate(
    { slug, status: "published" },
    { $inc: { viewCount: 1 } },
    { new: true },
  )
    .populate("author", "name image bio")
    .populate("category", "name slug color")
    .populate("tags", "name slug")
    .lean();
  return JSON.parse(JSON.stringify(post));
}

async function getRelatedPosts(categoryId: string, postId: string) {
  await connectDB();
  const related = await Post.find({
    category: categoryId,
    _id: { $ne: postId },
    status: "published",
  })
    .sort({ publishedAt: -1 })
    .limit(3)
    .populate("author", "name image")
    .populate("category", "name slug color")
    .lean();
  return JSON.parse(JSON.stringify(related));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getPost(slug)) as any;
  if (!post) return {};

  return genMeta({
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    image: post.featuredImage,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/article/${post.slug}`,
    type: "article",
    author: post.author?.name,
    publishedAt: post.publishedAt,
    tags: post.tags?.map((t: any) => t.name),
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = (await getPost(slug)) as any;
  if (!post) notFound();

  const relatedPosts = (await getRelatedPosts(
    post.category._id.toString(),
    post._id.toString(),
  )) as any[];

  const breadcrumbs = [
    { name: "Home", url: `/` },
    { name: post.category.name, url: `/category/${post.category.slug}` },
    { name: post.title, url: `/article/${post.slug}` },
  ];

  return (
    <>
      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateArticleSchema(post)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs)),
        }}
      />

      <div className="bg-white dark:bg-ink-950 py-3">
        <div className="max-w-screen-xl mx-auto px-4">
          <AdUnit position="header" className="max-w-[728px] mx-auto" />
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm font-sans text-ink-500 mb-6">
          <Link href="/" className="hover:text-brand-500 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href={`/category/${post.category.slug}`}
            className="hover:text-brand-500 transition-colors"
            style={{ color: post.category.color }}
          >
            {post.category.name}
          </Link>
          <span>/</span>
          <span className="text-ink-700 dark:text-ink-300 line-clamp-1">
            {post.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article Main */}
          <article className="lg:col-span-2">
            {/* Category + Breaking */}
            <div className="flex items-center gap-2 mb-4">
              <Link href={`/category/${post.category.slug}`}>
                <span
                  className="text-xs font-sans font-800 uppercase tracking-widest px-3 py-1.5 rounded-sm text-white"
                  style={{ backgroundColor: post.category.color }}
                >
                  {post.category.name}
                </span>
              </Link>
              {post.isBreaking && (
                <span className="text-xs font-sans font-800 uppercase tracking-widest px-3 py-1.5 rounded-sm bg-brand-500 text-white animate-pulse">
                  Breaking
                </span>
              )}
            </div>

            {/* Headline */}
            <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-900 text-ink-950 dark:text-white leading-tight mb-4">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-lg text-ink-600 dark:text-ink-400 font-body leading-relaxed mb-6 border-l-4 border-brand-500 pl-4">
              {post.excerpt}
            </p>

            {/* Author + Meta */}
            <div className="flex items-center justify-between flex-wrap gap-4 py-4 border-y border-ink-200 dark:border-ink-700 mb-6">
              <div className="flex items-center gap-3">
                {post.author ? (
                  <Link href={`/author/${post.author._id}`}>
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-brand-100 shadow-sm">
                      {post.author.image ? (
                        <Image
                          src={post.author.image}
                          alt={post.author.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-brand-500 flex items-center justify-center text-white font-bold text-lg">
                          {post.author.name?.[0]?.toUpperCase() || "A"}
                        </div>
                      )}
                    </div>
                  </Link>
                ) : (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-brand-100 shadow-sm">
                    <div className="w-full h-full bg-stone-300 dark:bg-stone-700 flex items-center justify-center text-white font-bold text-lg">
                      ?
                    </div>
                  </div>
                )}
                <div>
                  {post.author ? (
                    <Link
                      href={`/author/${post.author._id}`}
                      className="font-sans font-700 text-ink-900 dark:text-ink-100 hover:text-brand-500 transition-colors"
                    >
                      {post.author.name}
                    </Link>
                  ) : (
                    <span className="font-sans font-700 text-ink-900 dark:text-ink-100">
                      Unknown Author
                    </span>
                  )}
                  <div className="flex items-center gap-3 text-xs text-ink-500 font-sans mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {formatDate(post.publishedAt)}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {post.readingTime} min read
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Eye size={11} />
                      {post.viewCount.toLocaleString()} views
                    </span>
                  </div>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center gap-2">
                <LikeButton postId={post._id.toString()} />
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1DA1F2] text-white text-xs font-sans font-600 hover:opacity-90 transition-opacity">
                  <Twitter size={13} />
                  Tweet
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1877F2] text-white text-xs font-sans font-600 hover:opacity-90 transition-opacity">
                  <Facebook size={13} />
                  Share
                </button>
              </div>
            </div>

            {/* Featured Image */}
            {post.featuredImage && (
              <figure className="mb-8 rounded-xl overflow-hidden shadow-lg relative aspect-video w-full bg-ink-100 dark:bg-ink-800">
                <Image
                  src={post.featuredImage}
                  alt={post.featuredImageAlt || post.title}
                  fill
                  priority
                  className="object-cover"
                />
                {post.featuredImageAlt && (
                  <figcaption className="text-xs text-ink-500 text-center mt-2 font-sans italic">
                    {post.featuredImageAlt}
                  </figcaption>
                )}
              </figure>
            )}

            {/* In-article Ad (top) */}
            <AdUnit position="in-article" className="mb-8" />

            {/* Article Body */}
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* In-article Ad (mid) */}
            <AdUnit position="between-paragraphs" className="my-8" />

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-ink-100 dark:border-ink-800">
              <span className="text-sm font-sans font-600 text-ink-600 dark:text-ink-400">
                Tags:
              </span>
              {post.tags.map((tag: any) => (
                <Link
                  key={tag.slug}
                  href={`/tag/${tag.slug}`}
                  className="px-3 py-1 bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 text-xs font-sans hover:bg-brand-100 dark:hover:bg-brand-900 hover:text-brand-700 dark:hover:text-brand-300 rounded-full transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>

            {/* Reactions */}
            <div className="flex items-center gap-4 mt-8 p-4 bg-ink-50 dark:bg-ink-900 rounded-xl">
              <LikeButton postId={post._id.toString()} />
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-300 hover:bg-stone-50 transition-all text-sm font-sans font-600">
                <Share2 size={16} />
                Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-300 hover:bg-stone-50 transition-all text-sm font-sans font-600 ml-auto">
                <Bookmark size={16} />
                Bookmark
              </button>
            </div>

            {/* Author Box */}
            <div className="mt-8 p-6 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-xl">
              <h3 className="font-sans text-xs font-700 uppercase tracking-wider text-ink-500 mb-4">
                About the Author
              </h3>
              <div className="flex gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-brand-100">
                  {post.author.image ? (
                    <Image
                      src={post.author.image}
                      alt={post.author.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-brand-500 flex items-center justify-center text-white font-bold text-2xl">
                      {post.author.name?.[0]?.toUpperCase() || "A"}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-headline text-xl font-700 text-ink-900 dark:text-ink-100 mb-1">
                    {post.author.name}
                  </h4>
                  <p className="text-sm text-ink-600 dark:text-ink-400 font-body leading-relaxed mb-3">
                    {post.author.bio}
                  </p>
                  <Link
                    href={`/author/${post.author._id}`}
                    className="text-sm font-sans font-600 text-brand-500 hover:text-brand-600 transition-colors"
                  >
                    View all {post.author.postsCount} articles →
                  </Link>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            {post.allowComments && (
              <CommentSection postId={post._id.toString()} />
            )}
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Sticky Sidebar Content */}
            <div className="sticky top-24 space-y-6">
              <AdUnit position="sidebar" />

              {/* Newsletter */}
              <NewsletterSidebar />

              <AdUnit position="sidebar" />
            </div>
          </aside>
        </div>

        {/* Related Articles */}
        <section className="mt-12">
          <h2 className="section-title text-2xl mb-6">Related Stories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedPosts && relatedPosts.length > 0 ? (
              relatedPosts.map((post) => (
                <ArticleCard key={post._id} post={post} />
              ))
            ) : (
              <p className="col-span-full text-center text-ink-500 font-sans py-12">
                No related stories found.
              </p>
            )}
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
