import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Media } from "@/models/index";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user || !["admin", "editor", "author"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const type = searchParams.get("type"); // image, video, all

    // Base query
    const query: any = {};
    if (search) {
      query.originalFilename = { $regex: search, $options: "i" };
    }
    if (type && type !== "All Types") {
      if (type === "Images") query.resourceType = "image";
      else if (type === "Videos") query.resourceType = "video";
      else if (type === "Documents") query.resourceType = "raw";
    }

    // Only authors see their own media, admins/editors see all
    if (role === "author") {
      query.uploadedBy = (session.user as any).id;
    }

    const media = await Media.find(query)
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ media });
  } catch (error) {
    console.error("GET /api/media error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 },
    );
  }
}
