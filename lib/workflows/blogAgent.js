import { researchAgent } from '@/lib/agents/researchAgent';
import { contentAgent } from '@/lib/agents/contentAgent';
import { seoAgent } from '@/lib/agents/seoAgent';
import { linkingAgent } from '@/lib/agents/linkingAgent';
import { generateAIImage } from '@/lib/services/imageService';
import { getBlogByKeyword, saveBlog } from '@/lib/services/blogService';
import { getCache, setCache } from '@/lib/services/cacheService';
import { logInfo, logError } from '@/lib/services/logger';
import Category from '@/models/Category';
import Tag from '@/models/Tag';
import connectDB from '@/lib/db';

/**
 * Blog Agent Workflow (Optimized for <5s)
 */
export async function runBlogAgent(keyword, options = { useCache: true, autoSave: false, userId: null }) {
  const { useCache = true, autoSave = false, userId = null } = options;
  await logInfo('BlogAgent', `[BlogAgent] Cycle started: "${keyword}"`);

  if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
    throw new Error('runBlogAgent: A valid keyword string is required.');
  }

  // 1. Double Cache Check (blog:{keyword})
  if (useCache) {
    const cacheKey = `blog:${keyword.toLowerCase().trim()}`;
    const cachedResult = await getCache(cacheKey);
    if (cachedResult) {
      await logInfo('BlogAgent', `[BlogAgent] Cache Hit: ${cacheKey}`);
      return { ...cachedResult, cached: true };
    }
  }

  let fallback_used = false;

  try {
    // 2. Parallel Research & Image Generation (Saves time)
    const [research, image] = await Promise.all([
      researchAgent(keyword),
      generateAIImage(keyword, userId).catch(err => {
        console.error("[BlogAgent] Image gen failed", err);
        return null;
      })
    ]);
    if (research.fallback_used) fallback_used = true;

    // 3. Content
    const contentResult = await contentAgent({
      topic: research.topic,
      keywords: research.keywords,
    });
    if (contentResult.fallback_used) fallback_used = true;

    // 4. SEO & Metadata (Expanded)
    await connectDB();
    const [existingCats, existingTags] = await Promise.all([
      Category.find({}, 'name').lean(),
      Tag.find({}, 'name').lean()
    ]);

    const seo = await seoAgent({
      topic: research.topic,
      content: contentResult.content,
      existingCategories: existingCats.map(c => c.name),
      existingTags: existingTags.map(t => t.name)
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
      title: seo.title || research.topic || keyword,
      slug: seo.slug || '',
      excerpt: seo.excerpt || '',
      content: finalContent || '',
      category: seo.category || 'Technology',
      tags: seo.tags || [],
      meta_title: seo.title || '',
      meta_description: seo.meta_description || '',
      focus_keyword: keyword,
      featured_image: image?.url || '',
      topic: research.topic || '',
      keywords: research.keywords || [],
      search_intent: research.search_intent || 'informational',
      fallback_used: fallback_used,
      cached: false,
      status: "published", // Default to published for "Full Auto"
    };

    // 6. Async Auto-Save & Cache (key: blog:{keyword})
    const cacheKey = `blog:${keyword.toLowerCase().trim()}`;
    if (useCache && !fallback_used) {
      setCache(cacheKey, result, 86400).catch(err => console.error("[BlogAgent] Cache Error:", err));
    }
    
    if (autoSave && !fallback_used) {
      try {
        const savedPost = await saveBlog(result);
        result.postId = savedPost?._id;
        await logInfo('BlogAgent', `[BlogAgent] Auto-published with ID: ${result.postId}`);
      } catch (saveErr) {
        await logError('BlogAgent', `[BlogAgent] Auto-save failed: ${saveErr.message}`);
      }
    }

    await logInfo('BlogAgent', `[BlogAgent] Cycle completed for: ${keyword}`);
    return result;
  } catch (error) {
    await logError('BlogAgent', `[BlogAgent] Fatal error: ${error.message}`, error);
    throw new Error(`runBlogAgent failed: ${error.message}`);
  }
}
