import Link from "next/link";
import Image from "next/image";
import { TrendingUp } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/utils";

export default function TrendingSidebar({ articles }: { articles: any[] }) {
  return (
    <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-100 dark:border-ink-800 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-ink-100 dark:border-ink-800">
        <TrendingUp className="w-4 h-4 text-brand-500" />
        <h3 className="font-display text-base font-bold text-ink-900 dark:text-ink-100">Trending Now</h3>
      </div>
      <div className="divide-y divide-ink-50 dark:divide-ink-800">
        {articles.map((article, i) => (
          <Link key={article._id} href={`/article/${article.slug}`}
            className="flex gap-3 px-5 py-3.5 hover:bg-ink-50 dark:hover:bg-ink-800/50 transition-colors group">
            <span className="font-display text-2xl font-black text-ink-200 dark:text-ink-700 w-6 shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-brand-500 uppercase mb-0.5">{article.categories[0]?.name}</p>
              <h4 className="text-sm font-semibold text-ink-800 dark:text-ink-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 line-clamp-2 leading-snug">
                {article.title}
              </h4>
              <p className="text-xs text-ink-400 mt-1">👁 {formatNumber(article.viewCount)} · {article.readingTime}m</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
