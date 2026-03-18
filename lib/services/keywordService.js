import openai from '../openai';

/**
 * Static fallback keywords to use if the OpenAI API fails
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
 * Fetches 10-20 trending blog keywords using OpenAI.
 * Focuses on SEO traffic, low competition, and high search intent.
 * 
 * @returns {Promise<string[]>} Array of keyword strings
 */
export async function getTrendingKeywords() {
  console.log('[KeywordService] Fetching trending keywords via OpenAI...');

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a senior SEO and content strategist. Your goal is to identify high-traffic, low-competition blog keywords with high search intent. Return only a JSON object with a keywords array."
        },
        {
          role: "user",
          content: "Generate 15 trending blog keywords for 2026 across various niches (tech, lifestyle, finance, health). Ensure they have high search volume potential but manageable competition. Return as JSON: { \"keywords\": [\"keyword 1\", \"keyword 2\"] }"
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = JSON.parse(content);
    const keywords = parsed.keywords || [];

    if (!Array.isArray(keywords) || keywords.length === 0) {
      throw new Error('Invalid format or no keywords returned');
    }

    console.log(`[KeywordService] Successfully generated ${keywords.length} keywords.`);
    return keywords;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[KeywordService] OpenAI API Error: ${message}. Using static fallback.`);
    return FALLBACK_KEYWORDS;
  }
}
