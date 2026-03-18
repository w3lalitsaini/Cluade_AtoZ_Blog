import { NextResponse } from 'next/server';
import { runBlogAgent } from '@/lib/workflows/blogAgent';
import { saveBlog } from '@/lib/services/blogService';
import { isRateLimited } from '@/lib/services/rateLimiter';

/**
 * POST /api/agent-blog
 * Triggers the Blog Agent workflow to research and generate a long-form blog post.
 * Optionally saves it to the database.
 * 
 * Request Body:
 * {
 *   "keyword": "string",
 *   "save": boolean
 * }
 */
export async function POST(req) {
  try {
    // 0. Rate Limiting Check (5 requests per min)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { keyword, save = false, useCache = true } = body;

    // 1. Validation
    if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'A valid "keyword" is required.' },
        { status: 400 }
      );
    }

    // 2. Execute Workflow (with cache support)
    const result = await runBlogAgent(keyword, useCache);

    let savedData = null;
    let saved = false;

    // 3. Optional Persistence (only if not already cached)
    if (save && !result.cached) {
      console.log(`[API] Saving new blog post for: "${result.topic}"`);
      try {
        savedData = await saveBlog(result);
        saved = true;
      } catch (dbError) {
        console.error('[API Database Error]:', dbError.message);
        return NextResponse.json({
          success: true,
          data: result,
          saved: false,
          cached: result.cached,
          persistenceError: dbError.message
        });
      }
    }

    // 4. Success Response
    return NextResponse.json({
      success: true,
      data: result,
      saved: result.cached || saved, // Report as saved if it was cached or newly saved
      cached: result.cached,
      postId: savedData?._id || result.postId, // result might contain postId if cached (impl detail)
      fallback_used: result.fallback_used
    });

  } catch (error) {
    console.error('[API Error] agent-blog:', error.message);
    
    const status = error.message.includes('429') ? 429 : 500;
    const message = error.message.includes('429') 
      ? 'OpenAI Quota Exceeded. Please check your billing/limits.' 
      : 'Failed to generate blog content.';

    return NextResponse.json(
      { success: false, error: message, details: error.message },
      { status }
    );
  }
}
