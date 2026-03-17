import connectDB from "@/lib/db";
import Post from "@/models/Post";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Plus, Eye, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default async function AdminPostsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id;

  await connectDB();

  const query = role === "author" ? { author: userId } : {};
  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .populate("author", "name")
    .populate("category", "name")
    .select("title status viewCount publishedAt author category createdAt slug")
    .lean();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink-900 dark:text-white">
            Posts
          </h1>
          <p className="font-sans text-ink-500 text-sm mt-1">
            {posts.length} total posts
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Post
        </Link>
      </div>

      <div className="bg-white dark:bg-ink-900 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 dark:border-stone-800">
                <th className="text-left px-6 py-4 font-sans text-xs font-bold uppercase tracking-wider text-ink-400">
                  Title
                </th>
                <th className="text-left px-6 py-4 font-sans text-xs font-bold uppercase tracking-wider text-ink-400">
                  Author
                </th>
                <th className="text-left px-6 py-4 font-sans text-xs font-bold uppercase tracking-wider text-ink-400">
                  Category
                </th>
                <th className="text-left px-6 py-4 font-sans text-xs font-bold uppercase tracking-wider text-ink-400">
                  Status
                </th>
                <th className="text-left px-6 py-4 font-sans text-xs font-bold uppercase tracking-wider text-ink-400">
                  Views
                </th>
                <th className="text-left px-6 py-4 font-sans text-xs font-bold uppercase tracking-wider text-ink-400">
                  Date
                </th>
                <th className="text-left px-6 py-4 font-sans text-xs font-bold uppercase tracking-wider text-ink-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {(posts as Record<string, unknown>[]).map((post) => (
                <tr
                  key={String(post._id)}
                  className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-sans text-sm font-medium text-ink-800 dark:text-ink-200 max-w-[280px] truncate">
                      {post.title as string}
                    </p>
                  </td>
                  <td className="px-6 py-4 font-sans text-sm text-ink-500">
                    {(post.author as { name: string })?.name}
                  </td>
                  <td className="px-6 py-4 font-sans text-sm text-ink-500">
                    {(post.category as { name: string })?.name}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`badge text-xs ${
                        post.status === "published"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : post.status === "draft"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : post.status === "pending"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-stone-100 text-stone-700"
                      }`}
                    >
                      {post.status as string}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-sans text-sm text-ink-500">
                    {((post.viewCount as number) || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-sans text-sm text-ink-500">
                    {post.publishedAt
                      ? format(
                          new Date(post.publishedAt as string),
                          "MMM dd, yyyy",
                        )
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/article/${post.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-ink-400 hover:text-ink-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/posts/${post._id}/edit`}
                        className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="font-sans text-ink-400">
              No posts yet.{" "}
              <Link href="/admin/posts/new" className="text-brand-500">
                Create your first post
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
