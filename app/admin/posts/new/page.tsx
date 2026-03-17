import { PostEditor } from "@/components/admin/PostEditor";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import Tag from "@/models/Tag";

export default async function NewPostPage() {
  await connectDB();
  const [categories, tags] = await Promise.all([
    Category.find({ isActive: true }).sort({ name: 1 }).lean(),
    Tag.find().sort({ name: 1 }).lean(),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900 dark:text-white mb-6">Create New Post</h1>
      <PostEditor
        categories={JSON.parse(JSON.stringify(categories))}
        tags={JSON.parse(JSON.stringify(tags))}
      />
    </div>
  );
}
