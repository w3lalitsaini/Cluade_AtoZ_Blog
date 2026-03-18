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

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const status = searchParams.get("status") || "published";
    const author = searchParams.get("author");
    const search = searchParams.get("search");
    const tag = searchParams.get("tag");
    const featured = searchParams.get("featured");
    const breaking = searchParams.get("breaking");
    const sort = searchParams.get("sort") || "-publishedAt";

    const query: Record<string, unknown> = {};
    if (status !== "all") query.status = status;
    if (category) query.category = category;
    if (author) query.author = author;
    if (featured === "true") query.isFeatured = true;
    if (breaking === "true") query.isBreaking = true;
    if (search) query.title = { $regex: search, $options: "i" };
    if (tag) query.tags = tag;

    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("author", "name image bio")
        .populate("category", "name slug color")
        .populate("tags", "name slug")
        .lean(),
      Post.countDocuments(query),
    ]);

    return NextResponse.json({
      posts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role?: string })?.role;
    if (!["admin", "editor", "author"].includes(role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const validated = PostSchema.parse(body);

    const slug = validated.slug || generateSlug(validated.title);
    const excerpt = validated.excerpt || generateExcerpt(validated.content);
    const readingTime = calculateReadingTime(validated.content);

    const existing = await Post.findOne({ slug });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const userId = (session.user as { id?: string })?.id;
    const post = await Post.create({
      ...validated,
      slug: finalSlug,
      excerpt,
      readingTime,
      author: userId,
      publishedAt: validated.status === "published" ? new Date() : undefined,
      scheduledAt: validated.scheduledAt
        ? new Date(validated.scheduledAt)
        : undefined,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      );
    }
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
}
