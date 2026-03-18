import { generateText } from '@/lib/services/aiService';

/**
 * Writer Agent
 * Generates a full markdown blog post based on research data.
 */
export async function writerAgent(researchData) {
  const { topic, keywords, search_intent } = researchData;

  const prompt = `You are a professional blog writer. Write a high-quality, SEO-optimized blog post in Markdown format.

Topic: ${topic}
Keywords to include: ${keywords.join(', ')}
Search Intent: ${search_intent}

Return a valid JSON object with exactly these fields:
{
  "content": "Full Markdown content here",
  "excerpt": "A short, engaging 2-sentence summary"
}
Ensure the output is ONLY the JSON object.`;

  try {
    const raw = await generateText(prompt);

    // Attempt to extract JSON
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : raw;
    
    const parsed = JSON.parse(jsonStr);

    if (!parsed.content || !parsed.excerpt) {
      throw new Error('writerAgent: Missing required fields in AI response.');
    }

    return {
      content: parsed.content,
      excerpt: parsed.excerpt,
    };
  } catch (err) {
    // Basic fallback for writer
    return {
      content: `# ${topic}\n\nContent generation failed. Please try again later.`,
      excerpt: `An article about ${topic}.`,
    };
  }
}
