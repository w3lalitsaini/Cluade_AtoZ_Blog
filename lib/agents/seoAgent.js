import { generateText } from '@/lib/services/aiService';
import { logAgentStep, logError, logWarn } from '@/lib/services/logger';

/**
 * SEO Meta Agent
 */
export async function seoAgent({ topic, content }) {
  const prompt = `Generate SEO metadata and classification for the blog post titled: "${topic}".
Content Context: ${content.substring(0, 300)}...
Return a valid JSON object with:
{
  "title": "SEO Optimized Title",
  "meta_description": "Compelling meta description",
  "slug": "url-friendly-slug",
  "tags": ["tag1", "tag2"],
  "category": "Main Category Name",
  "excerpt": "A short 2-3 sentence summary of the post"
}
Return ONLY the JSON.`;

  try {
    await logAgentStep('SEOAgent', 'Starting SEO Generation', topic);
    const raw = await generateText(prompt);

    // SAFE PARSING
    let parsed = {};
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : raw;
      parsed = JSON.parse(jsonStr);
    } catch (parseErr) {
      await logWarn('SEOAgent', 'JSON Parse failed, using fallback extraction');
      parsed = {
        title: topic,
        meta_description: `Read about ${topic} on our blog.`,
        slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tags: ["ai", "blog"],
        category: "Technology",
        excerpt: content.substring(0, 150).replace(/<[^>]*>?/gm, '') + "..."
      };
    }
    
    return {
      title: parsed.title || topic,
      meta_description: parsed.meta_description || `Article about ${topic}`,
      slug: parsed.slug || topic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tags: parsed.tags || ['blog', 'ai'],
      category: parsed.category || 'Technology',
      excerpt: parsed.excerpt || (content.substring(0, 150).replace(/<[^>]*>?/gm, '') + "..."),
      fallback_used: false,
    };
  } catch (err) {
    await logWarn('SEOAgent', `SEO Agent issue: ${err.message}. Using fallback SEO.`, { topic });
    return {
      title: topic,
      meta_description: `Read our latest post about ${topic}.`,
      slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tags: ['ai', 'blog'],
      category: 'Technology',
      excerpt: content.substring(0, 150).replace(/<[^>]*>?/gm, '') + "...",
      fallback_used: true,
    };
  }
}
