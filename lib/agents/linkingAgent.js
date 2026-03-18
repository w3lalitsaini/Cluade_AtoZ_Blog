import { generateText } from '@/lib/services/aiService';
import { logAgentStep, logError, logWarn } from '@/lib/services/logger';

/**
 * Internal Linking Agent
 * Naturally inserts 3-5 internal links into the HTML content using keywords as anchor text.
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
3. Natural Placement: Ensure the links are inserted into existing text without changing the surrounding context significantly.
4. HTML: Return the FULL updated HTML content. Keep all existing tags (h1, h2, p, etc.) intact.
5. Do NOT add <html> or <body> tags.

Content:
${content}

Return ONLY the updated HTML.`;

  try {
    await logAgentStep('LinkingAgent', 'Starting Internal Linking', keywords[0] || 'Unknown');
    const updatedContent = await generateText(prompt);

    return {
      content: updatedContent || content,
      fallback_used: false,
    };
  } catch (err) {
    await logWarn('LinkingAgent', `Linking issue: ${err.message}. Returning original content.`, { keyword: keywords[0] });
    return {
      content: content,
      fallback_used: true,
    };
  }
}
