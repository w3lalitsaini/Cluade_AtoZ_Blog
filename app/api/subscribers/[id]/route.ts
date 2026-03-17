import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Subscriber from "@/models/Subscriber";

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

    const sub = await Subscriber.findByIdAndDelete(id);
    if (!sub) {
      return NextResponse.json(
        { message: "Subscriber not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Subscriber deleted" });
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting subscriber" },
      { status: 500 },
    );
  }
}
