import { generateText } from '@/lib/services/aiService';

/**
 * Writer Agent
 * Generates a full markdown blog post based on research data.
 */
export async function writerAgent(researchData) {
  const { topic, keywords, search_intent } = researchData;

  const prompt = `You are a professional SEO blog writer. Create a comprehensive, high-quality blog post in Markdown format.

Topic: ${topic}
Keywords to include: ${keywords.join(', ')}
Search Intent: ${search_intent}

Strict Formatting Rules:
1. Use a clear, engaging H1 title (already provided in the JSON as topic, but use it as the first line of content too).
2. Hierarchy: Use H2 for main sections and H3 for sub-sections.
3. Quality: Every paragraph should be 3-4 sentences. Use a professional yet conversational tone.
4. Readability: Use bulleted or numbered lists for key points and features.
5. Emphasis: Use **bold text** for important keywords and concepts.
6. Structure: Include an Introduction, multiple informational sections with data/facts, and a strong Conclusion.
7. Length: The content should be at least 800-1000 words.
8. Links: Include placeholders for [Internal Link] where relevant.

Return a valid JSON object with exactly these fields:
{
  "content": "Full Markdown content here starting with # Title",
  "excerpt": "A short, engaging 2-sentence summary (150-160 characters)"
}
Ensure the output is ONLY the JSON object. Do not include any text outside the JSON.`;

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
