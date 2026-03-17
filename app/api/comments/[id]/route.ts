import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Comment from "@/models/Comment";
import Post from "@/models/Post";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { isApproved, isSpam } = await req.json();

    await connectDB();
    const comment = await Comment.findByIdAndUpdate(
      id,
      { isApproved, isSpam },
      { new: true },
    );

    if (!comment) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating comment" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const comment = await Comment.findById(id);
    if (!comment) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 },
      );
    }

    await Comment.findByIdAndDelete(id);
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });

    return NextResponse.json({ message: "Comment deleted" });
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting comment" },
      { status: 500 },
    );
  }
}
