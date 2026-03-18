import { generateText } from '@/lib/services/aiService';
import { logAgentStep, logError, logWarn } from '@/lib/services/logger';

/**
 * Research Agent
 */
export async function researchAgent(keyword) {
  if (!keyword || typeof keyword !== 'string') {
    throw new Error('researchAgent: keyword must be a non-empty string.');
  }

  const prompt = `You are an expert SEO content strategist.
Given the seed keyword: "${keyword}"
Return a valid JSON object with the following structure:
{
  "topic": "Proposed Blog Title",
  "keywords": ["keyword1", "keyword2"],
  "search_intent": "informational"
}
Ensure the output is ONLY the JSON object, no other text.`;

  try {
    await logAgentStep('ResearchAgent', 'Starting Research', keyword);
    const raw = await generateText(prompt);
    
    // SAFE PARSING: Regex extraction + Try/Catch
    let parsed = {};
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : raw;
      parsed = JSON.parse(jsonStr);
    } catch (parseErr) {
      await logWarn('ResearchAgent', 'JSON Parse failed, using fallback parsing', { raw: raw.substring(0, 50) });
      parsed = {
        topic: raw.split('\n')[0].replace(/[{}"]/g, '').trim() || `Guide to ${keyword}`,
        keywords: [keyword],
        search_intent: "informational"
      };
    }
    
    await logAgentStep('ResearchAgent', 'Research Complete', keyword, { topic: parsed.topic });
    
    return {
      topic: parsed.topic || `Guide to ${keyword}`,
      keywords: parsed.keywords || [keyword],
      search_intent: parsed.search_intent || 'informational',
      fallback_used: false,
    };
  } catch (err) {
    await logWarn('ResearchAgent', `Agent issue: ${err.message}. Using fallback.`, { keyword });
    return {
      topic: `Expert Guide: ${keyword}`,
      keywords: [keyword, 'guide', 'tips'],
      search_intent: 'informational',
      fallback_used: true,
    };
  }
}
