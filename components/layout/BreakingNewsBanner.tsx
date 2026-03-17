"use client";
import Link from "next/link";

interface BreakingPost {
  title: string;
  slug: string;
}

interface Props {
  posts?: BreakingPost[];
  items?: BreakingPost[];
}

export default function BreakingNewsBanner({ posts, items }: Props) {
  const data = posts || items || [];
  if (data.length === 0) return null;

  return (
    <div className="bg-red-600 text-white py-2 overflow-hidden">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-red-800 px-4 py-0.5 mr-4 z-10">
          <span className="font-sans text-xs font-bold uppercase tracking-widest animate-pulse">
            BREAKING
          </span>
        </div>
        <div className="breaking-ticker flex-1 overflow-hidden">
          <div className="breaking-ticker-inner whitespace-nowrap">
            {data.map((post, i) => (
              <span key={i}>
                <Link
                  href={`/article/${post.slug}`}
                  className="font-sans text-sm hover:underline cursor-pointer"
                >
                  ⚡ {post.title}
                </Link>
                <span className="mx-8 opacity-50">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
