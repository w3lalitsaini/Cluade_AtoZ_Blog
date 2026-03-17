import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    const userId = (session.user as { id?: string })?.id;
    const user = await User.findById(userId)
      .select(
        "+password name email image bio role isVerified socialLinks savedPosts createdAt",
      )
      .lean();
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { password, ...userData } = user as any;
    return NextResponse.json({
      ...userData,
      isOAuth: !password,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { name, bio, image, socialLinks } = await req.json();
    await connectDB();
    const userId = (session.user as { id?: string })?.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { name, bio, image, socialLinks },
      { new: true },
    ).select("name email image bio socialLinks");
    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
