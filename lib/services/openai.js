import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing environment variable: OPENAI_API_KEY');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Helper to call OpenAI with retries and 429 detection.
 * @param {Function} task - Async function that calls OpenAI
 * @param {number} retries - Number of retries (default 2)
 */
export async function callWithRetry(task, retries = 2) {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      return await task();
    } catch (err) {
      lastError = err;
      const isQuotaError = err.status === 429 || err.message?.includes('429');
      
      if (isQuotaError) {
        console.warn(`[OpenAI] Quota exceeded (429). Attempt ${i + 1}/${retries + 1}`);
        if (i < retries) {
          // Wait 1s before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        // If out of retries, throw custom error
        const error = new Error('API_QUOTA_EXCEEDED');
        error.status = 429;
        throw error;
      }
      
      // For other errors, rethrow immediately or retry if appropriate
      throw err;
    }
  }
  throw lastError;
}

export default openai;
