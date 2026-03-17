import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import { SiteSettings } from "@/models/index";

export async function GET() {
  try {
    await connectDB();
    const existing = await SiteSettings.findOne().lean();
    if (existing) return NextResponse.json(existing);
    // Create default settings if none exist
    const created = await SiteSettings.create({ siteName: "AtoZ Blogs" });
    return NextResponse.json(created.toObject());
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    await connectDB();
    const settings = await SiteSettings.findOneAndUpdate(
      {},
      { ...body, updatedAt: new Date() },
      { upsert: true, new: true },
    );
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 },
    );
  }
}
