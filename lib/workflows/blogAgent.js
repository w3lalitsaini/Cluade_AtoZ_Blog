import { researchAgent } from '@/lib/agents/researchAgent';
import { contentAgent } from '@/lib/agents/contentAgent';
import { seoAgent } from '@/lib/agents/seoAgent';
import { linkingAgent } from '@/lib/agents/linkingAgent';
import { getBlogByKeyword, saveBlog } from '@/lib/services/blogService';
import { getCache, setCache } from '@/lib/services/cacheService';
import { logInfo, logError } from '@/lib/services/logger';

/**
 * Blog Agent Workflow (Optimized for <5s)
 */
export async function runBlogAgent(keyword, options = { useCache: true, autoSave: false }) {
  const { useCache = true, autoSave = false } = options;
  await logInfo('BlogAgent', `[BlogAgent] Cycle started: "${keyword}"`);

  if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
    throw new Error('runBlogAgent: A valid keyword string is required.');
  }

  // 1. Double Cache Check
  if (useCache) {
    const cachedResult = await getCache(keyword);
    if (cachedResult) {
      await logInfo('BlogAgent', `[BlogAgent] Cache Hit! returning cached blog.`);
      return { ...cachedResult, cached: true };
    }
  }

  let fallback_used = false;

  try {
    // Parallel Execution of non-dependent tasks or tightly coupled sequence
    // To hit <5s, we must ensure aiService timeouts are low (8s)
    
    // 2. Research
    const research = await researchAgent(keyword);
    if (research.fallback_used) fallback_used = true;

    // 3. Content
    const contentResult = await contentAgent({
      topic: research.topic,
      keywords: research.keywords,
    });
    if (contentResult.fallback_used) fallback_used = true;

    // 4. SEO
    const seo = await seoAgent({
      topic: research.topic,
      content: contentResult.content,
    });
    if (seo.fallback_used) fallback_used = true;

    let finalContent = contentResult.content;

    // 5. Internal Linking (Fast bypass if needed)
    if (!contentResult.fallback_used) {
      try {
        const linkingResult = await linkingAgent({
          content: contentResult.content,
          keywords: research.keywords,
        });
        finalContent = linkingResult.content;
      } catch (linkErr) {
        console.warn("[BlogAgent] Linking failed, bypassing...");
      }
    }

    const result = {
      topic: research.topic ?? '',
      keywords: research.keywords ?? [],
      search_intent: research.search_intent ?? 'informational',
      title: seo.title ?? '',
      meta_description: seo.meta_description ?? '',
      slug: seo.slug ?? '',
      tags: seo.tags ?? [],
      content: finalContent ?? '',
      fallback_used: fallback_used,
      cached: false,
      postId: null,
    };

    // 6. Async Auto-Save & Cache (non-blocking for performance)
    if (useCache && !fallback_used) {
      setCache(keyword, result, 86400).catch(console.error);
    }
    
    if (autoSave && !fallback_used) {
      saveBlog(result).catch(err => console.error("[BlogAgent] Auto-save error", err));
    }

    await logInfo('BlogAgent', `[BlogAgent] Cycle completed for: ${keyword}`);
    return result;
  } catch (error) {
    await logError('BlogAgent', `[BlogAgent] Fatal error: ${error.message}`, error);
    throw new Error(`runBlogAgent failed: ${error.message}`);
  }
}
