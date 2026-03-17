import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { sendEmail, verificationEmailTemplate } from "@/lib/email";
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = RegisterSchema.parse(body);

    await connectDB();
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 },
      );
    }

    // Generate verification token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Pass raw password — User model pre-save hook hashes it automatically
    await User.create({
      name,
      email,
      password,
      role: "user",
      isVerified: false,
      verifyToken: hashedToken,
    });

    // Send verification email (non-blocking)
    try {
      const html = verificationEmailTemplate(rawToken, name);
      await sendEmail({
        to: email,
        subject: "Verify Your Email — AtoZ Blogs",
        html,
      });
    } catch (emailErr) {
      console.error("Verification email failed to send:", emailErr);
    }

    return NextResponse.json(
      {
        message:
          "Account created! Please check your email and verify your address before signing in.",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation failed", details: error.errors },
        { status: 400 },
      );
    }
    console.error("Register error:", error);
    return NextResponse.json({ message: "Registration failed" }, { status: 500 });
  }
}
