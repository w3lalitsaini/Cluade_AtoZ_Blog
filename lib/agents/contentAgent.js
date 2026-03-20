import { generateText } from '@/lib/services/aiService';
import { logAgentStep, logError, logWarn } from '@/lib/services/logger';

/**
 * Content Agent
 * Generates high-quality, long-form SEO content.
 */
export async function contentAgent({ topic, keywords }) {
  const prompt = `You are a professional SEO blog writer. Create a comprehensive, high-quality blog post in HTML format.

Topic: ${topic}
Keywords to include: ${keywords.join(', ')}

Strict Formatting Rules (HTML):
1. Title: Include a clear, engaging <h1> title at the start.
2. Hierarchy: Use <h2> for main sections and <h3> for sub-sections.
3. Content: Every paragraph should be 3-4 sentences. Use a professional yet conversational tone.
4. Readability: Use <ul> or <ol> lists for key points, features, or steps.
5. Emphasis: Use <strong> for important keywords and concepts.
6. Structure: Include an Introduction, multiple informational sections with data/facts, and a strong Conclusion.
7. Length: The content should be at least 1000 words.
8. Links: Include <a href="#">Internal Link Placeholder</a> where relevant in the text.
9. Quality: Avoid generic "AI-sounding" intros. Start with a hook.

Return ONLY the high-quality, long-form HTML content inside a single <div> wrapper. Do not include any text outside the HTML.`;

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
