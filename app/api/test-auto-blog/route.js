import { NextResponse } from 'next/server';
import { runBlogAgent } from '@/lib/workflows/blogAgent';
import { generateDailyBlogs } from '@/lib/cron/autoBlog';
import { logInfo, logError } from '@/lib/services/logger';
import connectDB from '@/lib/db';
import Post from '@/models/Post';

/**
 * GET /api/test-auto-blog
 * Diagnostic endpoint to verify the AI auto-blogging system.
 */
export async function GET(req) {
  const startTime = Date.now();
  const { searchParams } = new URL(req.url);
  const isCronTest = searchParams.get('cron') === 'true';
  const testKeyword = searchParams.get('keyword') || "test automation blog " + Date.now();

  await logInfo('TestAutoBlog', `Starting validation cycle (Cron Mode: ${isCronTest})...`);

  try {
    await connectDB();

    let result;
    if (isCronTest) {
      // 1. Trigger Full Cron Cycle
      result = await generateDailyBlogs();
      const executionTime = ((Date.now() - startTime) / 1000).toFixed(1);
      
      await logInfo('TestAutoBlog', `Cron simulation complete in ${executionTime}s.`);
      return NextResponse.json({
        success: true,
        mode: 'cron',
        summary: result,
        executionTime: `${executionTime}s`
      });
    }

    // 2. Trigger Single Blog Agent Test
    await logInfo('TestAutoBlog', `Triggering single blog test for: "${testKeyword}"`);
    const agentResult = await runBlogAgent(testKeyword, { autoSave: true });

    // 3. Deep Validation
    const postCreated = !!agentResult.postId;
    let postDetails = null;
    let validation = {
      hasTitle: false,
      hasContent: false,
      hasImage: false,
      isPublished: false
    };

    if (postCreated) {
      // Query DB for confirmation
      const post = await Post.findById(agentResult.postId).lean();
      if (post) {
        postDetails = post;
        validation = {
          hasTitle: !!post.title && post.title.length > 10,
          hasContent: !!post.content && post.content.length > 100,
          hasImage: !!post.featuredImage,
          isPublished: post.status === 'published'
        };
      }
    }

    const executionTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const success = postCreated && validation.hasTitle && validation.hasContent && validation.isPublished;

    if (success) {
      await logInfo('TestAutoBlog', `Validation Successful for "${testKeyword}" in ${executionTime}s.`);
    } else {
      await logError('TestAutoBlog', `Validation Failed for "${testKeyword}". Check DB status.`);
    }

    return NextResponse.json({
      success,
      postCreated,
      postData: postCreated ? {
        id: postDetails?._id,
        title: postDetails?.title,
        status: postDetails?.status,
        image: postDetails?.featuredImage
      } : null,
      validation,
      executionTime: `${executionTime}s`
    });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await logError('TestAutoBlog', `Diagnostic Failure: ${errorMsg}`, error);
    
    return NextResponse.json({
      success: false,
      error: errorMsg,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
