import { logInfo, logWarn, logError } from './logger';

const OPENROUTER_MODEL = "openchat/openchat-7b";
const HF_ENDPOINT = "https://router.huggingface.co/hf-inference/models/gpt2";
const TIMEOUT_MS = 8000; // 8 seconds max

/**
 * Fallback Generator (No-API mode)
 * Produces usable content when all AI providers fail.
 */
function fallbackGenerator(prompt) {
  const isJSON = prompt.toLowerCase().includes('json');
  const isSEO = prompt.toLowerCase().includes('seo');
  const isResearch = prompt.toLowerCase().includes('research');
  
  // Extract keyword from prompt
  const keywordMatch = prompt.match(/"([^"]+)"/);
  const keyword = keywordMatch ? keywordMatch[1] : "this topic";

  if (isResearch || isSEO) {
    return JSON.stringify({
      topic: `Comprehensive Guide to ${keyword}`,
      title: `Expert Guide: Everything You Need to Know About ${keyword}`,
      meta_description: `Discover everything about ${keyword} in our detailed guide. Best tips and insights for 2026.`,
      keywords: [keyword, "guide", "tips", "2026"],
      tags: [keyword.toLowerCase().replace(/\s+/g, ''), "guide", "ai"],
      slug: keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      search_intent: "informational"
    });
  }

  return `
    <h2>Introduction to ${keyword}</h2>
    <p>Welcome to our detailed exploration of ${keyword}. In today's fast-paced world, understanding the nuances of ${keyword} is more important than ever.</p>
    <h2>Key Insights</h2>
    <p>When looking at ${keyword}, one must consider the historical context and the modern implications for the future.</p>
    <ul>
      <li>Essential tips for ${keyword} mastery</li>
      <li>Common pitfalls to avoid</li>
      <li>Future trends for 2026</li>
    </ul>
    <h2>Conclusion</h2>
    <p>We hope this brief guide on ${keyword} provides a solid foundation for your continued learning.</p>
  `.trim();
}

/**
 * AI Generation Service
 * Highly resilient multi-provider text generation.
 */
export async function generateText(prompt) {
  if (!prompt) return "No prompt provided.";

  // try OpenRouter -> try HuggingFace -> fallbackGenerator
  const providers = [
    { name: "OpenRouter", fn: tryOpenRouter },
    { name: "HuggingFace", fn: tryHuggingFace }
  ];

  for (const provider of providers) {
    try {
      const result = await provider.fn(prompt);
      if (result) {
        await logInfo('AIService', `Success using ${provider.name}`);
        return result;
      }
    } catch (err) {
      await logWarn('AIService', `${provider.name} failed: ${err.message}`);
    }
  }

  await logError('AIService', 'All providers failed. Using Fallback Generator.');
  return fallbackGenerator(prompt);
}

/**
 * OpenRouter Provider
 */
async function tryOpenRouter(prompt) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    clearTimeout(id);
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Timeout');
    throw err;
  }
}

/**
 * HuggingFace Provider
 */
async function tryHuggingFace(prompt) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(HF_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({ inputs: prompt }),
    });

    clearTimeout(id);
    const data = await response.json();
    
    // GPT-2 might return an array of objects
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text.trim();
    }
    return data.generated_text || null;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Timeout');
    throw err;
  }
}
