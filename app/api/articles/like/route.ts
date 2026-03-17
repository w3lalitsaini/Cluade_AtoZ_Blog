import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Like from "@/models/Like";
import Post from "@/models/Post";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 },
      );
    }

    const { postId } = await req.json();
    if (!postId) {
      return NextResponse.json(
        { message: "Post ID is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const existingLike = await Like.findOne({
      user: (session.user as any).id,
      post: postId,
    });

    if (existingLike) {
      // Unlike
      await Like.deleteOne({ _id: existingLike._id });
      await Post.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } });
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await Like.create({
        user: (session.user as any).id,
        post: postId,
      });
      await Post.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } });
      return NextResponse.json({ liked: true });
    }
  } catch (error: any) {
    console.error("Like error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    const session = await auth();

    if (!postId) {
      return NextResponse.json(
        { message: "Post ID is required" },
        { status: 400 },
      );
    }

    await connectDB();

    let isLiked = false;
    if (session?.user) {
      const like = await Like.findOne({
        user: (session.user as any).id,
        post: postId,
      });
      isLiked = !!like;
    }

    const post = await Post.findById(postId).select("likeCount");

    return NextResponse.json({
      liked: isLiked,
      likeCount: post?.likeCount || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
