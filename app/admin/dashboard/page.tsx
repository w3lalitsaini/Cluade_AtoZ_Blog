import connectDB from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";
import Comment from "@/models/Comment";
import Subscriber from "@/models/Subscriber";
import Category from "@/models/Category";
import "@/models/index";
import { auth } from "@/lib/auth";
import {
  BarChart2,
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  Eye,
  Mail,
  Zap,
} from "lucide-react";

async function getDashboardStats() {
  await connectDB();
  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    totalUsers,
    totalComments,
    totalSubscribers,
    recentPosts,
    topPosts,
  ] = await Promise.all([
    Post.countDocuments(),
    Post.countDocuments({ status: "published" }),
    Post.countDocuments({ status: "draft" }),
    User.countDocuments(),
    Comment.countDocuments(),
    Subscriber.countDocuments({ isActive: true }),
    Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("author", "name")
      .populate("category", "name")
      .select("title status viewCount publishedAt author category createdAt")
      .lean(),
    Post.find({ status: "published" })
      .sort({ viewCount: -1 })
      .limit(5)
      .populate("category", "name")
      .select("title viewCount likeCount category")
      .lean(),
  ]);

  const totalViews = await Post.aggregate([
    { $group: { _id: null, total: { $sum: "$viewCount" } } },
  ]);

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    totalUsers,
    totalComments,
    totalSubscribers,
    totalViews: totalViews[0]?.total || 0,
    recentPosts,
    topPosts,
  };
}

export default async function AdminDashboard() {
  const session = await auth();
  const stats = await getDashboardStats();
  const role = (session?.user as { role?: string })?.role;

  const statCards = [
    {
      label: "Total Posts",
      value: stats.totalPosts,
      sub: `${stats.publishedPosts} published`,
      icon: FileText,
      color: "bg-blue-500",
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      sub: "registered members",
      icon: Users,
      color: "bg-green-500",
    },
    {
      label: "Total Views",
      value: stats.totalViews.toLocaleString(),
      sub: "across all articles",
      icon: Eye,
      color: "bg-purple-500",
    },
    {
      label: "Comments",
      value: stats.totalComments,
      sub: "user interactions",
      icon: MessageSquare,
      color: "bg-orange-500",
    },
    {
      label: "Subscribers",
      value: stats.totalSubscribers,
      sub: "newsletter subscribers",
      icon: Mail,
      color: "bg-pink-500",
    },
    {
      label: "Drafts",
      value: stats.draftPosts,
      sub: "pending publish",
      icon: Zap,
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-ink-900 dark:text-white">
          Welcome back, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="font-sans text-ink-500 mt-1">
          Here&apos;s what&apos;s happening at AtoZ Blogs today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map(({ label, value, sub, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-ink-900 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-800"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-sans text-sm text-ink-500">{label}</p>
                <p className="font-heading text-3xl font-bold text-ink-900 dark:text-white mt-1">
                  {value}
                </p>
                <p className="font-sans text-xs text-ink-400 mt-1">{sub}</p>
              </div>
              <div
                className={`${color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="bg-white dark:bg-ink-900 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-800">
          <h2 className="font-heading text-lg font-bold text-ink-900 dark:text-white mb-4">
            Recent Posts
          </h2>
          <div className="space-y-3">
            {(stats.recentPosts as Record<string, unknown>[]).map((post) => (
              <div
                key={String(post._id)}
                className="flex items-center justify-between gap-3 py-2 border-b border-stone-100 dark:border-stone-800 last:border-0"
              >
                <div className="min-w-0">
                  <p className="font-sans text-sm font-medium text-ink-800 dark:text-ink-200 truncate">
                    {post.title as string}
                  </p>
                  <p className="font-sans text-xs text-ink-400">
                    {(post.author as { name: string })?.name} ·{" "}
                    {(post.category as { name: string })?.name}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 badge ${post.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                >
                  {post.status as string}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Posts */}
        <div className="bg-white dark:bg-ink-900 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-800">
          <h2 className="font-heading text-lg font-bold text-ink-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-500" /> Top Articles
          </h2>
          <div className="space-y-3">
            {(stats.topPosts as Record<string, unknown>[]).map((post, i) => (
              <div
                key={String(post._id)}
                className="flex items-center gap-3 py-2 border-b border-stone-100 dark:border-stone-800 last:border-0"
              >
                <span className="font-heading text-2xl font-black text-stone-200 dark:text-stone-700 leading-none flex-shrink-0 w-8">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-sm font-medium text-ink-800 dark:text-ink-200 truncate">
                    {post.title as string}
                  </p>
                  <p className="font-sans text-xs text-ink-400">
                    {(post.viewCount as number).toLocaleString()} views
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-ink-900 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-800">
        <h2 className="font-heading text-lg font-bold text-ink-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <a href="/admin/posts/new" className="btn-primary text-sm">
            + New Post
          </a>
          <a href="/admin/media" className="btn-secondary text-sm">
            Upload Media
          </a>
          <a href="/admin/ads" className="btn-secondary text-sm">
            Manage Ads
          </a>
          {role === "admin" && (
            <a href="/admin/settings" className="btn-secondary text-sm">
              Site Settings
            </a>
          )}
          <a
            href="/admin/ai-assistant"
            className="btn-secondary text-sm flex items-center gap-1"
          >
            🤖 AI Assistant
          </a>
        </div>
      </div>
    </div>
  );
}
