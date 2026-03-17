import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "Verification token is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({ verifyToken: hashedToken });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired verification link" },
        { status: 400 },
      );
    }

    // Mark as verified and clear token
    user.isVerified = true;
    user.verifyToken = undefined;
    await user.save();

    return NextResponse.json(
      { message: "Email verified successfully! You can now sign in." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { message: "Verification failed. Please try again." },
      { status: 500 },
    );
  }
}
