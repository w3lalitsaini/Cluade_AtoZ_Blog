import { runBlogAgent } from '@/lib/workflows/blogAgent';
import { saveBlog } from '@/lib/services/blogService';
import { isRateLimited } from '@/lib/services/rateLimiter';
import { logInfo, logError, logWarn } from '@/lib/services/logger';

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
    // 0. Rate Limiting Check
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (isRateLimited(ip)) {
      await logWarn('AgentBlogAPI', `Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 }
      );
    }

    const { keyword, save = false } = await req.json();
    await logInfo('AgentBlogAPI', `Received request: ${keyword}`, { save });

    // 1. Validation
    if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'A valid "keyword" is required.' },
        { status: 400 }
      );
    }

    // 2. Execute Workflow
    const result = await runBlogAgent(keyword, { useCache: true, autoSave: save });

    // 3. Standardized Response
    return NextResponse.json({
      success: true,
      data: result,
      saved: !!result.postId || result.cached
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await logError('AgentBlogAPI', `Request failed: ${message}`, error);
    
    const status = message.includes('429') ? 429 : 500;
    const userMessage = message.includes('429') 
      ? 'OpenAI Quota Exceeded. Please check your billing/limits.' 
      : 'Failed to generate blog content.';

    return NextResponse.json(
      { success: false, error: userMessage, details: message },
      { status }
    );
  }
}
