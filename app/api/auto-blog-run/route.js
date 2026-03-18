import { NextResponse } from 'next/server';
import { generateDailyBlogs } from '@/lib/cron/autoBlog';
import { logInfo, logError } from '@/lib/services/logger';

/**
 * POST /api/auto-blog-run
 * Manual trigger for the daily automation cycle.
 * Protected: Should ideally require admin auth.
 */
export async function POST(req) {
  try {
    await logInfo('AutoBlogAPI', 'Manual trigger received.');
    
    // In background, don't wait for full completion to avoid timeout
    generateDailyBlogs().catch(err => {
      logError('AutoBlogAPI', `Background job failed: ${err.message}`);
    });

    return NextResponse.json({
      success: true,
      message: "Daily automation cycle triggered in background."
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
