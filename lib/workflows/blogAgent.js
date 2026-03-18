import { researchAgent } from '@/lib/agents/researchAgent';
import { contentAgent } from '@/lib/agents/contentAgent';
import { seoAgent } from '@/lib/agents/seoAgent';
import { linkingAgent } from '@/lib/agents/linkingAgent';
import { getBlogByKeyword, saveBlog } from '@/lib/services/blogService';
import { getCachedBlog, setCachedBlog } from '@/lib/services/cacheService';
import { logInfo, logError } from '@/lib/services/logger';

/**
 * Blog Agent Workflow
 * Orchestrates the full process of researching a topic, generating long-form HTML content,
 * and creating SEO metadata. Supports caching to reduce API costs.
 * 
 * @param {string} keyword - The seed keyword or topic to start with.
 * @param {boolean} useCache - Whether to check for existing blogs first.
 * @returns {Promise<{ topic: string, keywords: string[], search_intent: string, title: string, meta_description: string, slug: string, tags: string[], content: string, fallback_used: boolean, cached: boolean, postId: string | null }>}
 */
export async function runBlogAgent(keyword, options = { useCache: true, autoSave: false }) {
  const { useCache = true, autoSave = false } = options;
  await logInfo('BlogAgent', `Workflow started for keyword: "${keyword}"`, { options });

  if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
    throw new Error('runBlogAgent: A valid keyword string is required.');
  }

  // 1. Cache Check (Redis/Memory)
  if (useCache) {
    const cachedResult = await getCachedBlog(keyword);
    if (cachedResult) {
      await logInfo('BlogAgent', `Redis Cache Hit: ${keyword}`);
      return { ...cachedResult, cached: true };
    }
  }

  // 1b. DB Check (Fallback)
  if (useCache) {
    console.log('[BlogAgent] Checking database cache for:', keyword);
    const cachedBlog = await getBlogByKeyword(keyword);
    if (cachedBlog) {
      console.log('[BlogAgent] DB Cache hit!');
      return {
        topic: cachedBlog.title,
        keywords: cachedBlog.tags?.map(t => typeof t === 'string' ? t : t.name) || [],
        search_intent: 'informational',
        title: cachedBlog.seo?.metaTitle || cachedBlog.title,
        meta_description: cachedBlog.seo?.metaDescription || cachedBlog.excerpt,
        slug: cachedBlog.slug,
        tags: cachedBlog.tags?.map(t => typeof t === 'string' ? t : t.name) || [],
        content: cachedBlog.content,
        fallback_used: false,
        cached: true,
        postId: cachedBlog._id,
      };
    }
    console.log('[BlogAgent] DB Cache miss.');
  }

  let fallback_used = false;

  try {
    // 2. Research Phase
    console.log('[BlogAgent] Research started for:', keyword);
    const research = await researchAgent(keyword);
    if (research.fallback_used) fallback_used = true;

    // 3. Content Generation Phase
    console.log('[BlogAgent] Content generation started for:', research.topic);
    const contentResult = await contentAgent({
      topic: research.topic,
      keywords: research.keywords,
    });
    if (contentResult.fallback_used) fallback_used = true;

    // 4. SEO Metadata Phase
    console.log('[BlogAgent] SEO generation started for:', research.topic);
    const seo = await seoAgent({
      topic: research.topic,
      content: contentResult.content,
    });
    if (seo.fallback_used) fallback_used = true;

    let finalContent = contentResult.content;

    // 5. Internal Linking Phase (only if not in fallback mode)
    if (!contentResult.fallback_used) {
      console.log('[BlogAgent] Internal linking started...');
      const linkingResult = await linkingAgent({
        content: contentResult.content,
        keywords: research.keywords,
      });
      finalContent = linkingResult.content;
      if (linkingResult.fallback_used) fallback_used = true;
      console.log('[BlogAgent] Internal linking completed');
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

    // 6. Optional Auto-Save
    if (autoSave && !fallback_used) {
      console.log('[BlogAgent] Auto-saving new post...');
      const savedPost = await saveBlog(result);
      result.postId = savedPost._id;
      console.log('[BlogAgent] Auto-save complete. ID:', result.postId);
    }

    // 7. Update Redis Cache
    if (useCache && !fallback_used) {
        await setCachedBlog(keyword, result);
    }

    await logInfo('BlogAgent', `Workflow completed successfully for: ${keyword}`, { postId: result.postId });
    return result;
  } catch (error) {
    await logError('BlogAgent', `Workflow failed for: ${keyword}`, error);
    const message = error instanceof Error ? error.message : String(error);
    console.error('[BlogAgent] Error in workflow:', message);
    throw new Error(`runBlogAgent failed: ${message}`);
  }
}
