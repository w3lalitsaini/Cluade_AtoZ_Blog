import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Ad from "@/models/Ad";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    await connectDB();
    const ad = await Ad.findByIdAndUpdate(id, body, { new: true });
    if (!ad) return NextResponse.json({ message: "Ad not found" }, { status: 404 });
    return NextResponse.json(ad);
  } catch (error) {
    return NextResponse.json({ message: "Error updating ad" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const ad = await Ad.findByIdAndDelete(id);
    if (!ad) return NextResponse.json({ message: "Ad not found" }, { status: 404 });
    return NextResponse.json({ message: "Ad deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting ad" }, { status: 500 });
  }
}
