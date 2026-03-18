import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * GET /api/me
 * Returns the current authenticated user session.
 * Used for reactive UI updates and client-side auth state synchronization.
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: (session.user as any).id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: (session.user as any).role,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("[API Me] Error fetching session:", error);
    return NextResponse.json({ user: null, error: "Internal Server Error" }, { status: 500 });
  }
}
