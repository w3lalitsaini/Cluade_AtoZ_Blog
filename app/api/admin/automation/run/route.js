import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runAutoBlogEngine } from "@/lib/workflows/autoBlogEngine";

/**
 * POST /api/admin/automation/run
 * Manually triggers the automated blog generation engine.
 */
export async function POST() {
  try {
    const session = await auth();
    const role = session?.user?.role;

    if (!session || !["admin"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Trigger the engine in the background or wait for it?
    // Given it's a dashboard action, we'll wait for it to return the summary.
    const summary = await runAutoBlogEngine();

    return NextResponse.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error("[API Automation Run] Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ 
      success: false, 
      error: message 
    }, { status: 500 });
  }
}
