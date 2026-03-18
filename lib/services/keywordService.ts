// @ts-ignore
import googleTrends from "google-trends-api";
import { logInfo, logWarn, logError } from "./logger";

/**
 * Fallback keywords if Google Trends fails
 */
const FALLBACK_KEYWORDS = [
  "AI tools for students",
  "latest tech news",
  "make money online",
  "blogging tips",
  "crypto trends",
  "digital marketing 2026",
  "remote work productivity",
  "future of tech"
];

/**
 * Fetches real-time trending keywords from Google Trends (India)
 * Returns a cleaned array of 5-8 strings
 */
export async function getTrendingKeywords(): Promise<string[]> {
  try {
    await logInfo("KeywordService", "Fetching daily trends from Google (geo: IN)...");

    const response = await googleTrends.dailyTrends({
      geo: "IN",
    });

    const data = JSON.parse(response);
    const trendingSearches = data.default?.trendingSearchesDays?.[0]?.trendingSearches || [];

    if (trendingSearches.length === 0) {
      throw new Error("No trending searches found in response");
    }

    // Extract query strings
    let keywords: string[] = trendingSearches.map((item: any) => item.title.query);

    // Clean Keywords
    const cleanKeywords = keywords
      .map((k) => k.toLowerCase().trim()) // Lowercase
      .filter((k, index, self) => self.indexOf(k) === index) // Unique
      .filter((k) => k.length >= 5) // Min length 5
      .slice(0, 8); // Top 5-8

    await logInfo("KeywordService", `Successfully fetched ${cleanKeywords.length} keywords.`);
    
    return cleanKeywords;
  } catch (error: any) {
    await logWarn("KeywordService", `Google Trends API failed: ${error.message}. Using fallback.`);
    return FALLBACK_KEYWORDS.sort(() => 0.5 - Math.random()).slice(0, 5);
  }
}
