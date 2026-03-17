import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message, type } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    await connectDB();
    const newMessage = await Message.create({
      name,
      email,
      subject,
      message,
      type: type || "contact",
    });

    return NextResponse.json({
      message: "Message sent successfully",
      id: newMessage._id,
    });
  } catch (error) {
    console.error("Message API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
