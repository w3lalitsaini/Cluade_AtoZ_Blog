import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Tag } from "@/models/index";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const tags = await Tag.find()
      .sort({ postCount: -1, name: 1 })
      .limit(limit)
      .lean();
    return NextResponse.json(tags);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || !["admin", "editor", "author"].includes(role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { name, description } = await req.json();
    await connectDB();
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // Find or create
    let tag = await Tag.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (tag) return NextResponse.json(tag, { status: 200 });

    tag = await Tag.create({ name, slug, description });
    return NextResponse.json(tag, { status: 201 });
  } catch (e: any) {
    console.error("Tag Error:", e);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
