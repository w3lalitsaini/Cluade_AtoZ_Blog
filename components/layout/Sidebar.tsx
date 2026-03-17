import Link from "next/link";
import Image from "next/image";
import { TrendingUp, Clock } from "lucide-react";

interface SidebarPost {
  _id: string;
  title: string;
  slug: string;
  featuredImage?: string;
  viewCount: number;
  publishedAt?: string;
  category?: { name: string; slug: string };
}

interface SidebarProps {
  trendingPosts?: SidebarPost[];
  showAd?: boolean;
  adCode?: string;
}

export function Sidebar({ trendingPosts = [], showAd = true, adCode }: SidebarProps) {
  return (
    <aside className="space-y-8">
      {/* Sidebar Ad */}
      {showAd && (
        <div className="bg-stone-100 dark:bg-stone-800 rounded-xl p-4 min-h-[250px] flex items-center justify-center">
          {adCode ? (
            <div dangerouslySetInnerHTML={{ __html: adCode }} />
          ) : (
            <div className="text-center text-ink-400">
              <div className="text-xs uppercase tracking-widest mb-1">Advertisement</div>
              <div className="w-[300px] h-[250px] bg-stone-200 dark:bg-stone-700 rounded-lg flex items-center justify-center">
                <span className="text-ink-400 text-sm">Ad 300×250</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trending Posts */}
      {trendingPosts.length > 0 && (
        <div>
          <h3 className="section-heading mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-500" />
            Trending Now
          </h3>
          <div className="space-y-4">
            {trendingPosts.map((post, index) => (
              <Link key={post._id} href={`/article/${post.slug}`} className="flex gap-4 group">
                <span className="flex-shrink-0 font-heading text-3xl font-black text-stone-200 dark:text-stone-700 leading-none">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  {post.category && (
                    <span className="font-sans text-xs font-semibold text-brand-500 uppercase tracking-wide">
                      {post.category.name}
                    </span>
                  )}
                  <h4 className="font-heading text-sm font-semibold text-ink-800 dark:text-ink-100 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors leading-snug mt-0.5 line-clamp-2">
                    {post.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter CTA */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl p-6 text-white">
        <h3 className="font-heading text-xl font-bold mb-2">Stay Informed</h3>
        <p className="font-sans text-sm text-brand-100 mb-4">
          Get daily briefings and breaking news alerts.
        </p>
        <form action="/api/newsletter/subscribe" method="POST" className="space-y-2">
          <input
            type="email"
            name="email"
            placeholder="Your email address"
            className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2.5 text-sm text-white placeholder-brand-200 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <button type="submit" className="w-full bg-white text-brand-600 font-semibold text-sm py-2.5 rounded-lg hover:bg-brand-50 transition-colors">
            Subscribe Free
          </button>
        </form>
      </div>

      {/* Sponsored */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-ink-400">Sponsored</h3>
        </div>
        <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4 min-h-[120px] flex items-center justify-center">
          <span className="text-ink-400 text-xs">Sponsored Content</span>
        </div>
      </div>
    </aside>
  );
}
