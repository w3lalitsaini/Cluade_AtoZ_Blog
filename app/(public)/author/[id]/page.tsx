import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Twitter,
  Linkedin,
  Globe,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Users,
  Award,
} from "lucide-react";
import ArticleCard from "@/components/article/ArticleCard";
import AdUnit from "@/components/ads/AdUnit";
import { generateMetadata as genMeta } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import "@/models/index"; // ensure Tag, Category etc. schemas are registered

type Props = { params: Promise<{ id: string }> };

async function getAuthorData(id: string) {
  await connectDB();
  try {
    const author = await User.findById(id).lean();
    if (!author || author.role === "user") return null;

    const posts = await Post.find({
      author: id,
      status: "published",
    })
      .sort({ publishedAt: -1 })
      .populate("author", "name image")
      .populate("category", "name slug color")
      .lean();

    return {
      author: author as any,
      posts: posts as any[],
    };
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getAuthorData(id);
  if (!data) return {};

  const { author } = data;
  return genMeta({
    title: `${author.name} - Author Profile`,
    description: author.bio || `Read articles by ${author.name} on AtoZ Blogs.`,
    image: author.image,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/author/${author._id}`,
  });
}

export default async function AuthorPage({ params }: Props) {
  const { id } = await params;
  const data = await getAuthorData(id);
  if (!data) notFound();

  const { author, posts } = data;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Author Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-2xl p-6 text-center">
              <div className="relative w-32 h-32 mx-auto mb-4 border-4 border-brand-50 rounded-full overflow-hidden">
                <Image
                  src={
                    author.image ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"
                  }
                  alt={author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h1 className="font-headline text-2xl font-black text-ink-950 dark:text-white mb-1">
                {author.name}
              </h1>
              <p className="text-brand-600 font-sans font-700 text-xs uppercase tracking-widest mb-4">
                {author.role}
              </p>

              <div className="flex justify-center gap-3 mb-6">
                {author.socialLinks?.twitter && (
                  <Link
                    href={author.socialLinks.twitter}
                    className="w-8 h-8 rounded-full bg-ink-50 dark:bg-ink-800 flex items-center justify-center text-ink-600 dark:text-ink-400 hover:bg-brand-500 hover:text-white transition-all"
                  >
                    <Twitter size={14} />
                  </Link>
                )}
                {author.socialLinks?.linkedin && (
                  <Link
                    href={author.socialLinks.linkedin}
                    className="w-8 h-8 rounded-full bg-ink-50 dark:bg-ink-800 flex items-center justify-center text-ink-600 dark:text-ink-400 hover:bg-brand-500 hover:text-white transition-all"
                  >
                    <Linkedin size={14} />
                  </Link>
                )}
                {author.socialLinks?.website && (
                  <Link
                    href={author.socialLinks.website}
                    className="w-8 h-8 rounded-full bg-ink-50 dark:bg-ink-800 flex items-center justify-center text-ink-600 dark:text-ink-400 hover:bg-brand-500 hover:text-white transition-all"
                  >
                    <Globe size={14} />
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 py-6 border-t border-ink-100 dark:border-ink-800">
                <div className="text-center">
                  <p className="text-2xl font-headline font-900 text-ink-950 dark:text-white">
                    {posts.length}
                  </p>
                  <p className="text-[10px] font-sans font-700 uppercase tracking-wider text-ink-400">
                    Articles
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-headline font-900 text-ink-950 dark:text-white">
                    {author.followers?.length || 0}
                  </p>
                  <p className="text-[10px] font-sans font-700 uppercase tracking-wider text-ink-400">
                    Followers
                  </p>
                </div>
              </div>

              <button className="w-full bg-brand-500 hover:bg-brand-600 text-white font-sans font-700 py-3 rounded-xl transition-all shadow-lg shadow-brand-500/20">
                Follow Author
              </button>
            </div>

            <div className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-2xl p-6">
              <h3 className="font-sans font-800 text-xs uppercase tracking-widest text-ink-400 mb-4">
                Location & Activity
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-ink-600 dark:text-ink-400 font-sans">
                  <MapPin size={16} className="text-brand-500" />
                  Remote / Global
                </li>
                <li className="flex items-center gap-3 text-sm text-ink-600 dark:text-ink-400 font-sans">
                  <Calendar size={16} className="text-brand-500" />
                  Joined {formatDate(author.createdAt)}
                </li>
              </ul>
            </div>

            <AdUnit position="sidebar" />
          </div>
        </aside>

        {/* Author Content */}
        <main className="lg:col-span-3 space-y-8">
          {/* Bio Box */}
          <section className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-2xl p-8">
            <h2 className="font-headline text-2xl font-800 text-ink-950 dark:text-white mb-4 flex items-center gap-3">
              <Award className="text-brand-500" size={24} />
              About {author.name}
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-ink-600 dark:text-ink-400 leading-relaxed font-body text-lg">
                {author.bio ||
                  `${author.name} is a valued contributor to AtoZ Blogs, sharing insights and stories that matter.`}
              </p>
            </div>
          </section>

          {/* Posts list */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title flex items-center gap-3">
                <FileText className="text-brand-500" size={20} />
                Published Articles
              </h2>
            </div>

            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <ArticleCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-ink-50 dark:bg-ink-900 rounded-2xl">
                <p className="text-ink-500 font-sans">
                  No articles published yet.
                </p>
              </div>
            )}
          </section>

          <AdUnit position="in-article" />
        </main>
      </div>
    </div>
  );
}
