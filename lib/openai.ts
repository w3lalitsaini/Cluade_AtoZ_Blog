import { generateText } from "./services/aiService";

/**
 * Free AI Service Wrapper for TypeScript
 * Implements the same interface as the legacy OpenAI helper.
 */

export async function generateBlogTitles(
  topic: string,
  count = 5
): Promise<string[]> {
  const prompt = `Generate ${count} compelling, SEO-optimized blog titles for the topic: "${topic}". Return only a JSON array of title strings: {"titles": ["title1", "title2"]}`;
  const raw = await generateText(prompt);
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    return parsed.titles || [];
  } catch {
    return [topic];
  }
}

export async function generateOutline(title: string): Promise<string> {
  const prompt = `Create a detailed outline for a blog post titled: "${title}". Include H2 and H3 headings.`;
  return await generateText(prompt);
}

export async function generateArticle(
  title: string,
  outline: string,
  tone = "professional"
): Promise<string> {
  const prompt = `Write a comprehensive, SEO-optimized blog article in HTML for:
Title: "${title}"
Outline: ${outline}
Tone: ${tone}. Use H2, H3, P, UL, LI tags.`;
  return await generateText(prompt);
}

export async function generateMetaDescription(
  title: string,
  content: string
): Promise<string> {
  const prompt = `Write a compelling SEO meta description (150-160 characters) for:
Title: "${title}"
Content: "${content.substring(0, 500)}"
Return only the meta description.`;
  const result = await generateText(prompt);
  return result.replace(/^"(.*)"$/, '$1'); // Remove potential quotes
}

export async function generateTags(
  title: string,
  content: string
): Promise<string[]> {
  const prompt = `Generate 8-10 relevant SEO tags for: "${title}". Return as JSON: {"tags": ["tag1", "tag2"]}`;
  const raw = await generateText(prompt);
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    return parsed.tags || [];
  } catch {
    return ["blog", "article"];
  }
}

export async function rewriteContent(
  content: string,
  instruction: string
): Promise<string> {
  const prompt = `Rewrite the following content with this instruction: "${instruction}"\n\nContent:\n${content}\n\nReturn HTML.`;
  return await generateText(prompt);
}

export async function analyzeSEO(
  title: string,
  content: string,
  keyword: string
): Promise<{
  score: number;
  suggestions: string[];
  keywordDensity: number;
  readabilityScore: number;
}> {
  const prompt = `Analyze SEO for:
Title: "${title}"
Focus keyword: "${keyword}"
Content preview: "${content.substring(0, 1000)}"

Return JSON: {
  "score": 0-100,
  "suggestions": ["suggestion1", "suggestion2"],
  "keywordDensity": 0.00,
  "readabilityScore": 0-100
}`;

  const raw = await generateText(prompt);
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    return { score: 50, suggestions: ["Could not complete AI analysis"], keywordDensity: 0, readabilityScore: 50 };
  }
}

// Mock export for legacy compatibility
export default {
  chat: {
    completions: {
      create: async ({ messages }: any) => {
        const content = await generateText(messages[messages.length - 1].content);
        return { choices: [{ message: { content } }] };
      }
    }
  }
};
