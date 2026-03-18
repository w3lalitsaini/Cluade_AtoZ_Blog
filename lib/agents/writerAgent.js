import openai from '@/lib/services/openai';

/**
 * Writer Agent
 * Generates a full markdown blog post based on research data.
 *
 * @param {Object} researchData - Data from Research Agent
 * @param {string} researchData.topic - The blog topic
 * @param {string[]} researchData.keywords - Related keywords
 * @param {string} researchData.search_intent - Search intent
 * @returns {Promise<{ content: string, excerpt: string }>}
 */
export async function writerAgent(researchData) {
  const { topic, keywords, search_intent } = researchData;

  const prompt = `You are a professional blog writer. Write a high-quality, SEO-optimized blog post in Markdown format.

Topic: ${topic}
Keywords to include: ${keywords.join(', ')}
Search Intent: ${search_intent}

Return a JSON object with exactly these fields:
- "content": The full blog post in Markdown. Include headers, lists, and bold text where appropriate.
- "excerpt": A short, engaging 2-sentence summary of the post for a meta description.

Respond ONLY with valid JSON. No explanation outside the JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const parsed = JSON.parse(response.choices[0].message.content);

    if (!parsed.content || !parsed.excerpt) {
      throw new Error('writerAgent: Missing required fields in AI response.');
    }

    return {
      content: parsed.content,
      excerpt: parsed.excerpt,
    };
  } catch (err) {
    throw new Error(`writerAgent: Failed to generate blog content — ${err.message}`);
  }
}
