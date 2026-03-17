import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { sendEmail, verificationEmailTemplate } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email }).select("+verifyToken");

    // Always return 200 so we don't reveal if the email exists
    if (!user) {
      return NextResponse.json({ message: "If an account with that email exists and is unverified, a new verification email has been sent." });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: "This account is already verified. Please sign in." });
    }

    // Generate a fresh token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.verifyToken = hashedToken;
    await user.save();

    try {
      const html = verificationEmailTemplate(rawToken, user.name);
      await sendEmail({
        to: user.email,
        subject: "Verify Your Email — AtoZ Blogs",
        html,
      });
    } catch (emailErr) {
      console.error("Resend verification email failed:", emailErr);
    }

    return NextResponse.json({ message: "Verification email resent successfully." });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
