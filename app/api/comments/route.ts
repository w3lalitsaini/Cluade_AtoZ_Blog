import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import "@/models/index";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    await connectDB();
    const query: any = {};
    if (postId) {
      query.post = postId;
      query.parentComment = null;
    }

    // If not admin, only show approved non-spam
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== "admin") {
      query.isApproved = true;
      query.isSpam = false;
    } else {
      // If admin and status filter
      const status = searchParams.get("status");
      if (status === "pending") query.isApproved = false;
      if (status === "spam") query.isSpam = true;
      if (status === "approved") {
        query.isApproved = true;
        query.isSpam = false;
      }
    }

    const comments = await Comment.find(query)
      .populate("author", "name image role email")
      .populate("post", "title slug")
      .populate({
        path: "replies",
        populate: { path: "author", select: "name image role" },
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 },
      );
    }

    const { postId, content, parentId } = await req.json();

    if (!postId || !content) {
      return NextResponse.json(
        { message: "Post ID and content are required" },
        { status: 400 },
      );
    }

    await connectDB();

    const comment = await Comment.create({
      post: postId,
      author: (session.user as any).id,
      content,
      parentComment: parentId || null,
      isApproved: true, // Auto-approve for now, can be changed to false for moderation
    });

    if (parentId) {
      await Comment.findByIdAndUpdate(parentId, {
        $push: { replies: comment._id },
      });
    }

    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    const populatedComment = await Comment.findById(comment._id)
      .populate("author", "name image role")
      .lean();

    return NextResponse.json(populatedComment);
  } catch (error) {
    console.error("Comment error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
