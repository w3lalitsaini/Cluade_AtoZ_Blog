import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/models/Post";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json([]);
    }

    await connectDB();

    const posts = await Post.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { excerpt: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
      status: "published",
    })
      .populate("author", "name image")
      .populate("category", "name slug")
      .sort({ publishedAt: -1 })
      .limit(20);

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
