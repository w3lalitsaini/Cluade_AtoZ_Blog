import { generateText } from './aiService';

/**
 * Legacy OpenAI Service Proxy
 * Redirects requests to the new free AI Service.
 */
const openai = {
  chat: {
    completions: {
      create: async ({ messages }) => {
        const prompt = messages[messages.length - 1].content;
        const result = await generateText(prompt);
        return {
          choices: [{ message: { content: result } }],
          usage: { total_tokens: 0 } // Mock usage
        };
      }
    }
  }
};

/**
 * Helper to maintain compatibility with existing callWithRetry usage.
 */
export async function callWithRetry(task) {
  try {
    return await task();
  } catch (err) {
    console.error('[AIService Proxy] Task failed:', err.message);
    throw err;
  }
}

export default openai;
