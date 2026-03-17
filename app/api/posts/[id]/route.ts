import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import { generateSlug, calculateReadingTime } from "@/lib/utils";
import { z } from "zod";

const PostSchema = z.object({
  title: z.string().min(5).max(300),
  slug: z.string().optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(10),
  featuredImage: z.string().optional(),
  featuredImageAlt: z.string().optional(),
  category: z.string().min(1),
  tags: z.array(z.string()).optional(),
  coAuthors: z.array(z.string()).optional(),
  status: z
    .enum(["draft", "pending", "published", "scheduled", "archived"])
    .default("draft"),
  scheduledAt: z.string().optional(),
  isBreaking: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isEditorsPick: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  sponsored: z.boolean().optional(),
  sponsoredBy: z.string().optional(),
  jsonLd: z.string().optional(),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      focusKeyword: z.string().optional(),
      canonicalUrl: z.string().optional(),
      noIndex: z.boolean().optional(),
      ogImage: z.string().optional(),
    })
    .optional(),
});

function generateExcerpt(html: string, length = 160): string {
  const text = html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > length ? text.slice(0, length) + "..." : text;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user || !["admin", "editor", "author"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const body = await req.json();
    const validated = PostSchema.parse(body);

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Only admin/editor or the author can edit
    if (
      role === "author" &&
      post.author.toString() !== (session.user as any).id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const slug = validated.slug || generateSlug(validated.title);
    const excerpt = validated.excerpt || generateExcerpt(validated.content);
    const readingTime = calculateReadingTime(validated.content);

    // Check slug collision
    if (slug !== post.slug) {
      const existing = await Post.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json(
          { error: "Slug already in use" },
          { status: 400 },
        );
      }
    }

    const updated = await Post.findByIdAndUpdate(
      id,
      {
        ...validated,
        slug,
        excerpt,
        readingTime,
        publishedAt:
          validated.status === "published" && !post.publishedAt
            ? new Date()
            : post.publishedAt,
        scheduledAt: validated.scheduledAt
          ? new Date(validated.scheduledAt)
          : post.scheduledAt,
      },
      { new: true },
    );

    return NextResponse.json({ post: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user || !["admin", "editor"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
