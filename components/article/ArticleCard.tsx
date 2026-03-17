import Link from "next/link";
import Image from "next/image";
import { Clock, Eye, Heart, Bookmark } from "lucide-react";
import { formatRelativeDate, formatNumber } from "@/lib/utils";

interface ArticleCardProps {
  post: {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage?: string;
    author?: { name?: string; image?: string };
    category?: { name: string; slug: string; color?: string };
    publishedAt?: string;
    readingTime?: number;
    viewCount?: number;
    likeCount?: number;
    isBreaking?: boolean;
    isFeatured?: boolean;
  };
  variant?: "default" | "horizontal" | "featured" | "compact" | "large";
}

export default function ArticleCard({
  post,
  variant = "default",
}: ArticleCardProps) {
  if (variant === "compact") {
    return (
      <article className="flex gap-3 group">
        {post.featuredImage && (
          <div className="relative flex-shrink-0 w-20 h-16 rounded overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span
            className="text-xs font-sans font-600 uppercase tracking-wide"
            style={{ color: post.category?.color || "#ef4444" }}
          >
            {post.category?.name || "Uncategorized"}
          </span>
          <Link href={`/article/${post.slug}`}>
            <h3 className="font-headline text-sm font-700 text-ink-900 dark:text-ink-100 leading-snug mt-0.5 group-hover:text-brand-500 transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>
          <p className="text-xs text-ink-500 font-sans mt-1">
            {post.publishedAt && formatRelativeDate(post.publishedAt)}
          </p>
        </div>
      </article>
    );
  }

  if (variant === "horizontal") {
    return (
      <article className="article-card flex">
        {post.featuredImage && (
          <div className="relative flex-shrink-0 w-40 sm:w-56 overflow-hidden rounded-l-lg">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="card-image object-cover transition-transform duration-500"
            />
          </div>
        )}
        <div className="flex-1 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs font-sans font-700 uppercase tracking-wider"
              style={{ color: post.category?.color || "#ef4444" }}
            >
              {post.category?.name || "Uncategorized"}
            </span>
            {post.isBreaking && (
              <span className="text-xs font-sans font-700 uppercase tracking-wider bg-brand-500 text-white px-2 py-0.5 rounded-sm">
                Breaking
              </span>
            )}
          </div>
          <Link href={`/article/${post.slug}`}>
            <h2 className="font-headline text-lg font-700 text-ink-900 dark:text-ink-100 leading-snug hover:text-brand-500 transition-colors line-clamp-2 mb-2">
              {post.title}
            </h2>
          </Link>
          <p className="text-sm text-ink-600 dark:text-ink-400 line-clamp-2 font-body mb-3">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-3 text-xs text-ink-500 font-sans">
            <span>{post.author?.name || "Unknown Author"}</span>
            <span>·</span>
            {post.publishedAt && (
              <span>{formatRelativeDate(post.publishedAt)}</span>
            )}
            {post.readingTime && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {post.readingTime} min
                </span>
              </>
            )}
          </div>
        </div>
      </article>
    );
  }

  if (variant === "large") {
    return (
      <article className="article-card group relative overflow-hidden rounded-xl">
        <Link href={`/article/${post.slug}`} className="block">
          <div className="relative h-72 sm:h-96 overflow-hidden">
            {post.featuredImage ? (
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                priority
                className="card-image object-cover transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-ink-800 to-ink-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-xs font-sans font-700 uppercase tracking-widest px-2.5 py-1 rounded-sm"
                  style={{
                    backgroundColor: post.category?.color || "#ef4444",
                    color: "white",
                  }}
                >
                  {post.category?.name || "Uncategorized"}
                </span>
                {post.isBreaking && (
                  <span className="text-xs font-sans font-700 uppercase tracking-widest bg-white text-brand-600 px-2.5 py-1 rounded-sm animate-pulse">
                    Breaking
                  </span>
                )}
              </div>
              <h2 className="font-headline text-2xl sm:text-3xl font-800 text-white leading-tight mb-3 group-hover:text-brand-200 transition-colors">
                {post.title}
              </h2>
              <p className="text-ink-300 text-sm line-clamp-2 mb-4 font-body">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {post.author?.image && (
                    <div className="relative w-7 h-7">
                      <Image
                        src={post.author.image}
                        alt={post.author.name || "Author"}
                        fill
                        className="rounded-full border border-white/30 object-cover"
                      />
                    </div>
                  )}
                  <span className="text-sm text-ink-300 font-sans">
                    {post.author?.name || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-400 font-sans">
                  {post.viewCount !== undefined && (
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {formatNumber(post.viewCount)}
                    </span>
                  )}
                  {post.readingTime && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {post.readingTime} min read
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  // Default card
  return (
    <article className="article-card group">
      {post.featuredImage && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="card-image object-cover transition-transform duration-500"
          />
          {post.isBreaking && (
            <div className="absolute top-3 left-3 bg-brand-500 text-white text-xs font-sans font-700 uppercase tracking-wider px-2.5 py-1 rounded-sm z-10">
              Breaking
            </div>
          )}
          {post.isFeatured && !post.isBreaking && (
            <div className="absolute top-3 left-3 bg-gold-500 text-white text-xs font-sans font-700 uppercase tracking-wider px-2.5 py-1 rounded-sm z-10">
              Featured
            </div>
          )}
        </div>
      )}
      <div className="p-4">
        <Link href={`/category/${post.category?.slug || 'uncategorized'}`}>
          <span
            className="text-xs font-sans font-700 uppercase tracking-widest hover:underline"
            style={{ color: post.category?.color || "#ef4444" }}
          >
            {post.category?.name || "Uncategorized"}
          </span>
        </Link>
        <Link href={`/article/${post.slug}`}>
          <h2 className="font-headline text-lg font-700 text-ink-900 dark:text-ink-100 leading-snug hover:text-brand-500 dark:hover:text-brand-400 transition-colors mt-1.5 mb-2 line-clamp-2">
            {post.title}
          </h2>
        </Link>
        <p className="text-sm text-ink-600 dark:text-ink-400 line-clamp-2 font-body mb-3">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-ink-100 dark:border-ink-800">
          <div className="flex items-center gap-2">
            {post.author?.image ? (
              <div className="relative w-6 h-6">
                <Image
                  src={post.author.image}
                  alt={post.author.name || "Author"}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 text-xs font-bold">
                {post.author?.name?.[0] || "?"}
              </div>
            )}
            <span className="text-xs text-ink-600 dark:text-ink-400 font-sans">
              {post.author?.name || "Unknown"}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-ink-400 font-sans">
            {post.readingTime && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {post.readingTime}m
              </span>
            )}
            {post.viewCount !== undefined && (
              <span className="flex items-center gap-1">
                <Eye size={11} />
                {formatNumber(post.viewCount)}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
