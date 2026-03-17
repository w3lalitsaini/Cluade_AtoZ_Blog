import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Subscriber from "@/models/Subscriber";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    await connectDB();

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: "Already subscribed" });
    }

    await Subscriber.create({ email });

    return NextResponse.json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error("Newsletter API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
