import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const userRole = searchParams.get("role");

    await connectDB();
    const query: any = {};
    if (userRole && userRole !== "all") {
      query.role = userRole;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching users" },
      { status: 500 },
    );
  }
}
