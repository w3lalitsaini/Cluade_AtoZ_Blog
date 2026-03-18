import openai, { callWithRetry } from '@/lib/services/openai';
import { logAgentStep, logError, logWarn } from '@/lib/services/logger';
import slugify from 'slugify';

/**
 * Internal Linking Agent
 * Naturally inserts 3-5 internal links into the HTML content using keywords as anchor text.
 * 
 * @param {Object} params
 * @param {string} params.content - The HTML content of the blog post.
 * @param {string[]} params.keywords - Related keywords to use as anchor text.
 * @returns {Promise<{ content: string, fallback_used: boolean }>}
 */
export async function linkingAgent({ content, keywords }) {
  if (!content || !keywords || !Array.isArray(keywords)) {
    throw new Error('linkingAgent: content and keywords array are required.');
  }

  const prompt = `You are an SEO expert. I have a blog post in HTML format.
I want you to naturally insert 3 to 5 internal links into the content.

Requirements:
1. Anchor Text: Use the provided keywords from this list: ${keywords.join(', ')}.
2. Link Format: Use realistic internal paths like "/blog/slug-name" where "slug-name" is a URL-friendly version of the keyword used.
3. Natural Placement: Ensure the links are inserted into existing text without changing the surrounding context significanlty.
4. HTML: Return the FULL updated HTML content. Keep all existing tags (h1, h2, p, etc.) intact.
5. Do NOT add <html> or <body> tags.

Content:
${content}

Return ONLY the updated HTML.`;

  try {
    await logAgentStep('LinkingAgent', 'Starting Internal Linking', keywords[0] || 'Unknown');
    const updatedContent = await callWithRetry(async () => {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      });
      return response.choices[0].message.content.trim();
    });

    return {
      content: updatedContent || content,
      fallback_used: false,
    };
  } catch (err) {
    if (err.message === 'API_QUOTA_EXCEEDED') {
      await logWarn('LinkingAgent', 'Quota exceeded. Returning original content.', { keyword: keywords[0] });
      return {
        content: content,
        fallback_used: true,
      };
    }
    await logError('LinkingAgent', `Critical error in linking for: ${keywords[0]}`, err);
    throw new Error(`linkingAgent: ${err.message}`);
  }
}
