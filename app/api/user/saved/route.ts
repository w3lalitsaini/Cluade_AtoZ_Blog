import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Bookmark } from "@/models/index";
import Post from "@/models/Post";
import "@/models/index";

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    const userId = (session.user as { id?: string })?.id;
    const bookmarks = await Bookmark.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "post",
        model: Post,
        select:
          "title slug featuredImage excerpt publishedAt category author readingTime viewCount",
        populate: [
          { path: "category", select: "name slug color" },
          { path: "author", select: "name image" },
        ],
      })
      .lean();
    const posts = bookmarks.map((b: any) => b.post).filter(Boolean);
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch saved posts" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { postId } = await req.json();
    await connectDB();
    const userId = (session.user as { id?: string })?.id;
    const existing = await Bookmark.findOne({ user: userId, post: postId });
    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      return NextResponse.json({ saved: false });
    }
    await Bookmark.create({ user: userId, post: postId });
    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to toggle bookmark" },
      { status: 500 },
    );
  }
}
