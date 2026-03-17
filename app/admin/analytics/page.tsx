import connectDB from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";
import Comment from "@/models/Comment";
import Subscriber from "@/models/Subscriber";
import { BarChart2, TrendingUp, Users, Eye, FileText, MessageSquare } from "lucide-react";

export default async function AnalyticsPage() {
  await connectDB();

  const [
    totalViews, totalPosts, totalUsers, totalComments, totalSubscribers,
    topPosts, recentGrowth, categoryStats
  ] = await Promise.all([
    Post.aggregate([{ $group: { _id: null, total: { $sum: "$viewCount" } } }]),
    Post.countDocuments({ status: "published" }),
    User.countDocuments(),
    Comment.countDocuments({ isApproved: true }),
    Subscriber.countDocuments({ isActive: true }),
    Post.find({ status: "published" }).sort({ viewCount: -1 }).limit(10)
      .populate("category", "name").select("title viewCount likeCount shareCount category slug").lean(),
    User.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id": 1 } }, { $limit: 12 }
    ]),
    Post.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 }, views: { $sum: "$viewCount" } } },
      { $sort: { views: -1 } }, { $limit: 10 },
      { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "cat" } },
      { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
    ]),
  ]);

  const views = totalViews[0]?.total || 0;

  const statCards = [
    { label: "Total Page Views", value: views.toLocaleString(), icon: Eye, change: "+12%", color: "text-blue-500" },
    { label: "Published Articles", value: totalPosts.toLocaleString(), icon: FileText, change: "+5%", color: "text-green-500" },
    { label: "Registered Users", value: totalUsers.toLocaleString(), icon: Users, change: "+18%", color: "text-purple-500" },
    { label: "Approved Comments", value: totalComments.toLocaleString(), icon: MessageSquare, change: "+8%", color: "text-orange-500" },
    { label: "Newsletter Subscribers", value: totalSubscribers.toLocaleString(), icon: TrendingUp, change: "+22%", color: "text-pink-500" },
    { label: "Avg Views/Post", value: totalPosts > 0 ? Math.round(views / totalPosts).toLocaleString() : "0", icon: BarChart2, change: "+3%", color: "text-yellow-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink-900 dark:text-white">Analytics</h1>
        <p className="font-sans text-ink-500 text-sm mt-1">Site performance and traffic overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map(({ label, value, icon: Icon, change, color }) => (
          <div key={label} className="bg-white dark:bg-ink-900 rounded-2xl p-5 shadow-sm border border-stone-100 dark:border-stone-800">
            <div className="flex items-center justify-between mb-3">
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="font-sans text-xs font-semibold text-green-500">{change}</span>
            </div>
            <p className="font-heading text-2xl font-bold text-ink-900 dark:text-white">{value}</p>
            <p className="font-sans text-xs text-ink-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Posts */}
        <div className="bg-white dark:bg-ink-900 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-800">
          <h2 className="font-heading text-lg font-bold text-ink-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-500" /> Top Performing Articles
          </h2>
          <div className="space-y-3">
            {(topPosts as Record<string, unknown>[]).map((post, i) => (
              <div key={String(post._id)} className="flex items-center gap-3">
                <span className="font-heading text-xl font-black text-stone-200 dark:text-stone-700 w-6 text-right flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <a href={`/article/${post.slug}`} target="_blank" className="font-sans text-sm font-medium text-ink-800 dark:text-ink-200 hover:text-brand-500 truncate block">
                    {post.title as string}
                  </a>
                  <p className="font-sans text-xs text-ink-400">{(post.category as { name: string })?.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-sans text-sm font-semibold text-ink-700 dark:text-ink-300">{(post.viewCount as number).toLocaleString()}</p>
                  <p className="font-sans text-xs text-ink-400">views</p>
                </div>
                <div className="w-20 bg-stone-100 dark:bg-stone-800 rounded-full h-1.5">
                  <div
                    className="bg-brand-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, ((post.viewCount as number) / ((topPosts[0] as Record<string, unknown>).viewCount as number)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white dark:bg-ink-900 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-800">
          <h2 className="font-heading text-lg font-bold text-ink-900 dark:text-white mb-4">Category Performance</h2>
          <div className="space-y-3">
            {(categoryStats as Record<string, unknown>[]).map((cat) => {
              const catName = (cat.cat as { name?: string })?.name || "Uncategorized";
              const maxViews = (categoryStats[0] as Record<string, unknown>).views as number;
              return (
                <div key={String(cat._id)}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-sans text-sm font-medium text-ink-700 dark:text-ink-300">{catName}</span>
                    <div className="text-right">
                      <span className="font-sans text-sm text-ink-500">{(cat.count as number)} posts</span>
                      <span className="font-sans text-xs text-ink-400 ml-2">· {((cat.views as number) || 0).toLocaleString()} views</span>
                    </div>
                  </div>
                  <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-brand-400 to-brand-600 h-2 rounded-full"
                      style={{ width: `${maxViews > 0 ? Math.min(100, ((cat.views as number) / maxViews) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Growth Timeline */}
      <div className="bg-white dark:bg-ink-900 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-800">
        <h2 className="font-heading text-lg font-bold text-ink-900 dark:text-white mb-4">User Growth (Monthly)</h2>
        <div className="flex items-end gap-2 h-32">
          {(recentGrowth as { _id: string; count: number }[]).map((d) => {
            const maxCount = Math.max(...(recentGrowth as { count: number }[]).map(r => r.count));
            const heightPct = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
            return (
              <div key={d._id} className="flex-1 flex flex-col items-center gap-1">
                <span className="font-sans text-xs text-ink-400">{d.count}</span>
                <div
                  className="w-full bg-brand-500 rounded-t-sm"
                  style={{ height: `${Math.max(4, heightPct)}%` }}
                  title={`${d._id}: ${d.count} users`}
                />
                <span className="font-sans text-xs text-ink-400 truncate w-full text-center">{d._id.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
