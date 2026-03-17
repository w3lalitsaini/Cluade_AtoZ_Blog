import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Subscriber from "@/models/Subscriber";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    await connectDB();
    const query: any = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    const subscribers = await Subscriber.find(query)
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(subscribers);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching subscribers" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();
    if (!email)
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );

    await connectDB();
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "Already subscribed" },
        { status: 400 },
      );
    }

    const subscriber = await Subscriber.create({
      email,
      name,
      isVerified: true,
    });
    return NextResponse.json(subscriber);
  } catch (error) {
    return NextResponse.json({ message: "Error subscribing" }, { status: 500 });
  }
}
