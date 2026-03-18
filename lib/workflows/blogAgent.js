import { researchAgent } from '@/lib/agents/researchAgent';
import { contentAgent } from '@/lib/agents/contentAgent';
import { seoAgent } from '@/lib/agents/seoAgent';
import { linkingAgent } from '@/lib/agents/linkingAgent';
import { getBlogByKeyword } from '@/lib/services/blogService';

/**
 * Blog Agent Workflow
 * Orchestrates the full process of researching a topic, generating long-form HTML content,
 * and creating SEO metadata. Supports caching to reduce API costs.
 * 
 * @param {string} keyword - The seed keyword or topic to start with.
 * @param {boolean} useCache - Whether to check for existing blogs first.
 * @returns {Promise<{ topic: string, keywords: string[], search_intent: string, title: string, meta_description: string, slug: string, tags: string[], content: string, fallback_used: boolean, cached: boolean }>}
 */
export async function runBlogAgent(keyword, useCache = true) {
  if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
    throw new Error('runBlogAgent: A valid keyword string is required.');
  }

  // 1. Cache Check
  if (useCache) {
    console.log('[BlogAgent] Checking cache for:', keyword);
    const cachedBlog = await getBlogByKeyword(keyword);
    if (cachedBlog) {
      console.log('[BlogAgent] Cache hit!');
      return {
        topic: cachedBlog.title,
        keywords: cachedBlog.tags?.map(t => t.name) || [],
        search_intent: 'informational', // Assuming informational for cached
        title: cachedBlog.seo?.metaTitle || cachedBlog.title,
        meta_description: cachedBlog.seo?.metaDescription || cachedBlog.excerpt,
        slug: cachedBlog.slug,
        tags: cachedBlog.tags?.map(t => t.name) || [],
        content: cachedBlog.content,
        fallback_used: false,
        cached: true,
      };
    }
    console.log('[BlogAgent] Cache miss.');
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

    // 6. Return structured output
    return {
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
    };
  } catch (error) {
    console.error('[BlogAgent] Error in workflow:', error.message);
    throw new Error(`runBlogAgent failed: ${error.message}`);
  }
}
