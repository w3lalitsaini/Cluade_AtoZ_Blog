import openai, { callWithRetry } from '@/lib/services/openai';

/**
 * SEO Meta Agent
 */
export async function seoAgent({ topic, content }) {
  const prompt = `Generate SEO JSON (title, meta_description, slug, tags) for: "${topic}".`;

  try {
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
      console.warn('[seoAgent] Quota exceeded. Using fallback SEO.');
      return {
        title: topic,
        meta_description: `Read our latest post about ${topic}.`,
        slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tags: ['ai', 'blog'],
        fallback_used: true,
      };
    }
    throw new Error(`seoAgent: ${err.message}`);
  }
}
