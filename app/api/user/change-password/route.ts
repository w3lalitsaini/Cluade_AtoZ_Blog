import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { oldPassword, newPassword } = await req.json();
    if (!oldPassword || !newPassword)
      return NextResponse.json(
        { error: "Both passwords required" },
        { status: 400 },
      );
    if (newPassword.length < 8)
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );

    await connectDB();
    const userId = (session.user as { id?: string })?.id;
    const user = await User.findById(userId).select("+password");
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (!user.password)
      return NextResponse.json(
        { error: "Cannot change password for OAuth accounts" },
        { status: 400 },
      );

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid)
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );

    // Let the pre-save hook hash the new password
    user.password = newPassword;
    await user.save();

    return NextResponse.json({ message: "Password changed successfully" });
  } catch {
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 },
    );
  }
}
