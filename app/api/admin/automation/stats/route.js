import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Log from "@/models/Log";
import { startOfDay } from "date-fns";

/**
 * GET /api/admin/automation/stats
 * Fetches today's automation stats and recent logs.
 */
export async function GET() {
  try {
    const session = await auth();
    const role = session?.user?.role;

    if (!session || !["admin"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const today = startOfDay(new Date());

    // 1. Calculate Stats for today
    const stats = await Log.aggregate([
      {
        $match: {
          timestamp: { $gte: today },
          source: { $in: ["AutoBlogEngine", "BlogAgent"] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          success: { 
            $sum: { $cond: [{ $eq: ["$level", "info"] }, 1, 0] } 
          },
          failed: { 
            $sum: { $cond: [{ $eq: ["$level", "error"] }, 1, 0] } 
          },
          warn: { 
            $sum: { $cond: [{ $eq: ["$level", "warn"] }, 1, 0] } 
          }
        }
      }
    ]);

    const resultStats = stats[0] || { total: 0, success: 0, failed: 0, warn: 0 };

    // 2. Fetch recent detailed logs
    const recentLogs = await Log.find({
      source: { $in: ["AutoBlogEngine", "BlogAgent"] }
    })
    .sort({ timestamp: -1 })
    .limit(50);

    return NextResponse.json({
      success: true,
      stats: resultStats,
      logs: recentLogs
    });
  } catch (error) {
    console.error("[API Automation Stats] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
