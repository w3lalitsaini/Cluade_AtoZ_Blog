import Link from "next/link";
import Image from "next/image";
import { Clock, Eye, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ArticleCardProps {
  post: {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage?: string;
    publishedAt?: string | Date;
    readingTime?: number;
    viewCount?: number;
    likeCount?: number;
    author?: { name: string; image?: string };
    category?: { name: string; slug: string; color?: string };
    isBreaking?: boolean;
    isFeatured?: boolean;
  };
  variant?: "default" | "horizontal" | "compact" | "featured" | "hero";
}

export function ArticleCard({ post, variant = "default" }: ArticleCardProps) {
  const timeAgo = post.publishedAt
    ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
    : "";

  if (variant === "hero") {
    return (
      <Link href={`/article/${post.slug}`} className="group block relative overflow-hidden rounded-2xl">
        <div className="relative aspect-[16/9] md:aspect-[21/9]">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            {post.isBreaking && (
              <span className="badge-breaking mb-3 inline-block">Breaking</span>
            )}
            {post.category && (
              <span className="badge badge-primary mb-3 inline-block">{post.category.name}</span>
            )}
            <h2 className="font-heading text-2xl md:text-4xl font-bold text-white leading-tight mb-3 group-hover:text-brand-300 transition-colors">
              {post.title}
            </h2>
            <p className="font-sans text-sm md:text-base text-white/80 line-clamp-2 mb-4 hidden md:block">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-4 text-white/60 text-sm font-sans">
              {post.author && <span>{post.author.name}</span>}
              {timeAgo && <span>{timeAgo}</span>}
              {post.readingTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {post.readingTime} min read
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link href={`/article/${post.slug}`} className="group flex gap-4 items-start">
        <div className="flex-shrink-0 relative w-32 h-24 rounded-xl overflow-hidden">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-700 dark:to-stone-800" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {post.category && (
            <span className="font-sans text-xs font-semibold text-brand-500 uppercase tracking-wide">
              {post.category.name}
            </span>
          )}
          <h3 className="font-heading text-sm font-bold text-ink-800 dark:text-ink-100 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors leading-snug mt-1 line-clamp-2">
            {post.title}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-ink-400 text-xs font-sans">
            {timeAgo && <span>{timeAgo}</span>}
            {post.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {post.readingTime}m
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/article/${post.slug}`} className="group block py-3 border-b border-stone-100 dark:border-stone-800 last:border-0">
        {post.category && (
          <span className="font-sans text-xs font-semibold text-brand-500 uppercase tracking-wide">
            {post.category.name}
          </span>
        )}
        <h3 className="font-heading text-sm font-semibold text-ink-800 dark:text-ink-100 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors mt-0.5 line-clamp-2">
          {post.title}
        </h3>
        <span className="font-sans text-xs text-ink-400 mt-1 block">{timeAgo}</span>
      </Link>
    );
  }

  // Default card
  return (
    <article className="group bg-white dark:bg-ink-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-stone-100 dark:border-stone-800">
      <Link href={`/article/${post.slug}`}>
        <div className="relative aspect-video overflow-hidden">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-950" />
          )}
          {post.isBreaking && (
            <div className="absolute top-3 left-3">
              <span className="badge-breaking">Breaking</span>
            </div>
          )}
          {post.category && (
            <div className="absolute bottom-3 left-3">
              <span className="badge badge-primary">{post.category.name}</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-5">
        <Link href={`/article/${post.slug}`}>
          <h2 className="font-heading text-lg font-bold text-ink-900 dark:text-ink-50 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors leading-snug mb-2 line-clamp-2">
            {post.title}
          </h2>
        </Link>
        <p className="font-sans text-sm text-ink-500 dark:text-ink-400 line-clamp-2 mb-4">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {post.author?.image ? (
              <Image
                src={post.author.image}
                alt={post.author.name}
                width={28}
                height={28}
                className="rounded-full"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 text-xs font-bold">
                {post.author?.name?.[0] || "A"}
              </div>
            )}
            <div>
              <p className="font-sans text-xs font-semibold text-ink-700 dark:text-ink-300">
                {post.author?.name || "Staff Writer"}
              </p>
              <p className="font-sans text-xs text-ink-400">{timeAgo}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-ink-400 text-xs font-sans">
            {post.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {post.readingTime}m
              </span>
            )}
            {post.viewCount !== undefined && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" /> {post.viewCount > 999 ? `${(post.viewCount / 1000).toFixed(1)}k` : post.viewCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
