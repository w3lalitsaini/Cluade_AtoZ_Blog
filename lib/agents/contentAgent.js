import { generateText } from '@/lib/services/aiService';
import { logAgentStep, logError, logWarn } from '@/lib/services/logger';

/**
 * Content Agent
 * Generates high-quality, long-form SEO content.
 */
export async function contentAgent({ topic, keywords }) {
  const prompt = `You are a professional SEO blogger.

Write a detailed, engaging, human-like blog post.

Requirements:
- 1200–1500 words
- conversational tone
- real-world examples
- H2, H3 headings
- bullet points
- storytelling style
- SEO optimized
- avoid generic AI text

Topic: ${topic}
Keywords: ${keywords.join(', ')}

Return ONLY the high-quality HTML content.`;

  try {
    await logAgentStep('ContentAgent', 'Starting Professional Generation', topic);
    const content = await generateText(prompt);

    if (!content || content.length < 100) {
      throw new Error("Content generation failed or was too short.");
    }

    return { 
      content, 
      fallback_used: false 
    };
  } catch (err) {
    await logError('ContentAgent', `Fatal generation error: ${err.message}`, { topic });
    throw err; // No more dummy fallback
  }
}
