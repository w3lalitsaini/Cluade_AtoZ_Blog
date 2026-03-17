import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Category from "@/models/Category";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") === "true";
    await connectDB();
    const query = activeOnly ? { isActive: true } : {};
    const categories = await Category.find(query).sort({ order: 1, name: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || !["admin", "editor"].includes(role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    await connectDB();
    const slug = body.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const cat = await Category.create({ ...body, slug });
    return NextResponse.json(cat, { status: 201 });
  } catch (e: any) {
    if (e.code === 11000)
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 409 },
      );
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
