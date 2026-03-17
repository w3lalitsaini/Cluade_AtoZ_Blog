import { PostEditor } from "@/components/admin/PostEditor";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";
import Tag from "@/models/Tag";
import { notFound } from "next/navigation";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();

  const [post, categories, tags] = await Promise.all([
    Post.findById(id).lean(),
    Category.find({ isActive: true }).sort({ name: 1 }).lean(),
    Tag.find().sort({ name: 1 }).lean(),
  ]);

  if (!post) {
    notFound();
  }

  // Transform post to match expected structure
  const serializedPost = JSON.parse(JSON.stringify(post));

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900 dark:text-white mb-6">
        Edit Post
      </h1>
      <PostEditor
        categories={JSON.parse(JSON.stringify(categories))}
        tags={JSON.parse(JSON.stringify(tags))}
        post={serializedPost}
      />
    </div>
  );
}
