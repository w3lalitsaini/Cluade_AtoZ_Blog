import { generateText } from '@/lib/services/aiService';
import { logAgentStep, logError, logWarn } from '@/lib/services/logger';

/**
 * Content Agent
 * Generates long-form HTML content.
 */
export async function contentAgent({ topic, keywords }) {
  const prompt = `Write a comprehensive, professional blog post in HTML format for the topic: "${topic}". 
Include headings, paragraphs, and lists. 
Focus on these keywords: ${keywords.join(', ')}.
Return ONLY the HTML content.`;

  try {
    await logAgentStep('ContentAgent', 'Starting Generation', topic);
    const content = await generateText(prompt);

    return { 
      content: content || `<h1>${topic}</h1><p>Content generation failed.</p>`, 
      fallback_used: false 
    };
  } catch (err) {
    await logWarn('ContentAgent', `AI Service failed: ${err.message}. Using fallback content.`, { topic });
    return {
      content: `<h1>${topic}</h1><p>Detailed guide coming soon. Currently generation is unavailable.</p>`,
      fallback_used: true,
    };
  }
}
