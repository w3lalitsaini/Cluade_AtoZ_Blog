import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Subscriber } from "@/models/index";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

const SubscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().max(100).optional(),
  source: z.string().optional(),
  categories: z.array(z.string()).optional(),
  frequency: z.enum(["daily", "weekly"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const validated = SubscribeSchema.parse(body);

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email: validated.email.toLowerCase() });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { error: "This email is already subscribed" },
          { status: 409 }
        );
      } else {
        // Reactivate
        existing.isActive = true;
        existing.subscribedAt = new Date();
        existing.unsubscribedAt = undefined;
        await existing.save();
        return NextResponse.json({ message: "Welcome back! Your subscription has been reactivated." });
      }
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const subscriber = await Subscriber.create({
      email: validated.email.toLowerCase(),
      name: validated.name,
      isActive: true,
      isVerified: false, // requires email verification
      verificationToken,
      preferences: {
        categories: validated.categories || [],
        frequency: validated.frequency || "weekly",
      },
      source: validated.source || "website",
      subscribedAt: new Date(),
    });

    // Send verification email (non-blocking)
    const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/newsletter/verify?token=${verificationToken}`;

    sendEmail({
      to: subscriber.email,
      subject: "Confirm your AtoZ Blogs subscription",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ef4444;">AtoZ Blogs</h1>
          <h2>Confirm your subscription</h2>
          <p>Hi${validated.name ? ` ${validated.name}` : ""}!</p>
          <p>Thanks for subscribing to AtoZ Blogs. Click the button below to confirm your email address.</p>
          <a href="${verifyUrl}" style="display:inline-block;background:#ef4444;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
            Confirm Subscription
          </a>
          <p style="color:#666;font-size:12px;">If you didn't subscribe, you can ignore this email.</p>
        </div>
      `,
    }).catch(console.error);

    return NextResponse.json(
      { message: "Subscribed successfully! Please check your email to confirm your subscription." },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("POST /api/newsletter error:", error);
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("verify");

    if (token) {
      await connectDB();
      const subscriber = await Subscriber.findOne({ verificationToken: token });

      if (!subscriber) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
      }

      subscriber.isVerified = true;
      subscriber.verificationToken = undefined;
      await subscriber.save();

      return NextResponse.json({ message: "Email verified successfully!" });
    }

    return NextResponse.json({ error: "Token required" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    await connectDB();
    const subscriber = await Subscriber.findOne({ email: email.toLowerCase() });

    if (!subscriber) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    return NextResponse.json({ message: "Successfully unsubscribed" });
  } catch (error) {
    return NextResponse.json({ error: "Unsubscribe failed" }, { status: 500 });
  }
}
