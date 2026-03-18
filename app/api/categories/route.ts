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
    const { name, ...rest } = await req.json();
    await connectDB();
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // Find or create
    let cat = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (cat) return NextResponse.json(cat, { status: 200 });

    cat = await Category.create({ name, slug, ...rest });
    return NextResponse.json(cat, { status: 201 });
  } catch (e: any) {
    console.error("Category Error:", e);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
