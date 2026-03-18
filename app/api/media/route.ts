import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Media } from "@/models/index";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    const type = searchParams.get("type");
    const folder = searchParams.get("folder") || "All Folders";

    // 1. Fetch Folders from Cloudinary (Source of Truth)
    const { folders: cloudFolders } = await cloudinary.api.root_folders();
    const folderList = cloudFolders.map((f: any) => ({ name: f.name, count: 0 }));

    // 2. Base Mongo Query
    const mongoQuery: any = {};
    if (search) mongoQuery.originalFilename = { $regex: search, $options: "i" };
    if (type && type !== "All Types") {
      if (type === "Images") mongoQuery.resourceType = "image";
      else if (type === "Videos") mongoQuery.resourceType = "video";
    }

    // 3. Fetch Media
    let media = [];
    if (folder !== "All Folders") {
      // Fetch specifically from Cloudinary folder
      const cloudRes = await cloudinary.api.resources({
        type: "upload",
        prefix: folder,
        max_results: 100,
      });

      const mongoMedia = await Media.find({ folder }).populate("uploadedBy", "name").lean();
      
      media = cloudRes.resources.map((resource: any) => {
        const local = mongoMedia.find((m: any) => m.publicId === resource.public_id);
        return {
          _id: local?._id || resource.public_id,
          publicId: resource.public_id,
          url: resource.url,
          secureUrl: resource.secure_url,
          originalFilename: local?.originalFilename || resource.public_id.split("/").pop(),
          format: resource.format,
          width: resource.width,
          height: resource.height,
          size: resource.bytes,
          uploadedBy: local?.uploadedBy || { name: "System" },
          createdAt: resource.created_at,
          folder: folder,
          synced: !!local
        };
      });
    } else {
      // Show all from Mongo (Standard view)
      media = await Media.find(mongoQuery)
        .populate("uploadedBy", "name")
        .sort({ createdAt: -1 })
        .lean();
    }

    // 4. Update counts for folders list
    const counts = await Media.aggregate([
      { $group: { _id: "$folder", count: { $sum: 1 } } }
    ]);
    
    const finalFolders = folderList.map(f => {
      const match = counts.find(c => c._id === f.name);
      return { ...f, count: match?.count || 0 };
    });

    return NextResponse.json({ media, folders: finalFolders });
  } catch (error) {
    console.error("GET /api/media error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 },
    );
  }
}
