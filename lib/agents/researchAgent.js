import openai, { callWithRetry } from '@/lib/services/openai';
import { logAgentStep, logError, logWarn } from '@/lib/services/logger';

/**
 * Research Agent
 * Given a keyword, returns an SEO-optimized blog topic,
 * related keywords, and identified search intent.
 */
export async function researchAgent(keyword) {
  if (!keyword || typeof keyword !== 'string') {
    throw new Error('researchAgent: keyword must be a non-empty string.');
  }

  const prompt = `You are an expert SEO content strategist.
Given the seed keyword: "${keyword}"
Return a JSON object with: "topic", "keywords" (array), "search_intent".`;

  try {
    await logAgentStep('ResearchAgent', 'Starting Research', keyword);
    const raw = await callWithRetry(async () => {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });
      return response.choices[0].message.content;
    });

    const parsed = JSON.parse(raw);
    await logAgentStep('ResearchAgent', 'Research Complete', keyword, { topic: parsed.topic });
    
    return {
      topic: parsed.topic || 'Untitled Post',
      keywords: parsed.keywords || [],
      search_intent: parsed.search_intent || 'informational',
      fallback_used: false,
    };
  } catch (err) {
    if (err.message === 'API_QUOTA_EXCEEDED') {
      await logWarn('ResearchAgent', 'Quota exceeded. Using static fallback.', { keyword });
      return {
        topic: `Guide to ${keyword}`,
        keywords: [keyword, 'how to', 'tips'],
        search_intent: 'informational',
        fallback_used: true,
      };
    }
    
    await logError('ResearchAgent', `Fatal error processing: ${keyword}`, err);
    throw new Error(`researchAgent: ${err.message}`);
  }
}
