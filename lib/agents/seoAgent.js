import openai, { callWithRetry } from '@/lib/services/openai';
import { logAgentStep, logError, logWarn } from '@/lib/services/logger';

/**
 * SEO Meta Agent
 */
export async function seoAgent({ topic, content }) {
  const prompt = `Generate SEO JSON (title, meta_description, slug, tags) for: "${topic}".`;

  try {
    await logAgentStep('SEOAgent', 'Starting SEO Generation', topic);
    const raw = await callWithRetry(async () => {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.6,
      });
      return response.choices[0].message.content;
    });

    const parsed = JSON.parse(raw);
    return {
      title: parsed.title || topic,
      meta_description: parsed.meta_description || '',
      slug: parsed.slug || topic.toLowerCase().replace(/\s+/g, '-'),
      tags: parsed.tags || [],
      fallback_used: false,
    };
  } catch (err) {
    if (err.message === 'API_QUOTA_EXCEEDED') {
      await logWarn('SEOAgent', 'Quota exceeded. Using fallback SEO.', { topic });
      return {
        title: topic,
        meta_description: `Read our latest post about ${topic}.`,
        slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tags: ['ai', 'blog'],
        fallback_used: true,
      };
    }
    await logError('SEOAgent', `Critical error generating SEO for: ${topic}`, err);
    throw new Error(`seoAgent: ${err.message}`);
  }
}
