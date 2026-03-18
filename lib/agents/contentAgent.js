import openai, { callWithRetry } from '@/lib/services/openai';
import { logAgentStep, logError, logWarn } from '@/lib/services/logger';

/**
 * Content Agent
 * Generates long-form HTML content.
 */
export async function contentAgent({ topic, keywords }) {
  const prompt = `Write a pro blog post in HTML for: "${topic}". Keywords: ${keywords.join(', ')}.`;

  try {
    await logAgentStep('ContentAgent', 'Starting Generation', topic);
    const content = await callWithRetry(async () => {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });
      return response.choices[0].message.content.trim();
    });

    return { 
      content: content || '<h1>No content generated</h1>', 
      fallback_used: false 
    };
  } catch (err) {
    if (err.message === 'API_QUOTA_EXCEEDED') {
      await logWarn('ContentAgent', 'Quota exceeded. Using fallback content.', { topic });
      return {
        content: `<h1>${topic}</h1><p>Detailed guide coming soon. Currently generation is unavailable due to high demand.</p>`,
        fallback_used: true,
      };
    }
    await logError('ContentAgent', `Critical error generating content for: ${topic}`, err);
    throw new Error(`contentAgent: ${err.message}`);
  }
}
