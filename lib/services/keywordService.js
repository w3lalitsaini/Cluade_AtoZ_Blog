import { generateText } from './aiService';

/**
 * Static fallback keywords to use if the AI service fails
 */
const FALLBACK_KEYWORDS = [
  "Future of Artificial Intelligence 2026",
  "Sustainable Living Tips for Beginners",
  "Top 10 Remote Work Tools for Productivity",
  "Healthy Meal Prep Ideas for Busy Professionals",
  "Digital Marketing Trends to Watch in 2026",
  "Guide to Cryptocurrency Investing for Newbies",
  "Mental Health and Wellness Strategies",
  "Modern Kitchen Interior Design Ideas",
  "Best Travel Destinations for Solo Travelers",
  "Web Development Roadmap for 2026"
];

/**
 * Fetches 10-20 trending blog keywords using the AI Service.
 */
export async function getTrendingKeywords() {
  console.log('[KeywordService] Fetching trending keywords via AI Service...');

  const prompt = `You are a senior SEO and content strategist. 
Identify 15 trending, high-traffic, low-competition blog keywords for 2026.
Return a valid JSON object with a "keywords" array of strings.
Example: { "keywords": ["keyword 1", "keyword 2"] }
Return ONLY the JSON.`;

  try {
    const raw = await generateText(prompt);

    // Attempt to extract JSON
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : raw;
    
    const parsed = JSON.parse(jsonStr);
    const keywords = parsed.keywords || [];

    if (!Array.isArray(keywords) || keywords.length === 0) {
      throw new Error('Invalid format or no keywords returned');
    }

    console.log(`[KeywordService] Successfully generated ${keywords.length} keywords.`);
    return keywords;
  } catch (error) {
    console.warn(`[KeywordService] AI Service Error: ${error.message}. Using static fallback.`);
    return FALLBACK_KEYWORDS;
  }
}
