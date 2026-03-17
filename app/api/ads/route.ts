import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Ad from "@/models/Ad";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const ads = await Ad.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(ads);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching ads" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();
    const ad = await Ad.create(body);
    return NextResponse.json(ad);
  } catch (error) {
    return NextResponse.json({ message: "Error creating ad" }, { status: 500 });
  }
}
