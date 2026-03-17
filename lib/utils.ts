// clsx is not installed, provide inline implementation
type ClassValue = string | boolean | null | undefined | Record<string, boolean>;

export function cn(...inputs: (string | boolean | null | undefined)[]): string {
  return inputs.filter(Boolean).join(" ");
}

export function formatRelativeDate(date: string | Date): string {
  return formatDate(date, "relative");
}

export function formatDate(date: string | Date, format: "short" | "long" | "relative" = "short"): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (format === "relative") {
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
  }

  if (format === "long") {
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export const CATEGORIES = [
  { name: "News", slug: "news", icon: "📰", color: "#ef4444" },
  { name: "Technology", slug: "technology", icon: "💻", color: "#3b82f6" },
  { name: "Business", slug: "business", icon: "💼", color: "#8b5cf6" },
  { name: "AI", slug: "ai", icon: "🤖", color: "#06b6d4" },
  { name: "World", slug: "world", icon: "🌍", color: "#10b981" },
  { name: "Politics", slug: "politics", icon: "🏛️", color: "#f59e0b" },
  { name: "Health", slug: "health", icon: "🏥", color: "#ec4899" },
  { name: "Science", slug: "science", icon: "🔬", color: "#14b8a6" },
  { name: "Sports", slug: "sports", icon: "⚽", color: "#f97316" },
  { name: "Entertainment", slug: "entertainment", icon: "🎬", color: "#a855f7" },
];
