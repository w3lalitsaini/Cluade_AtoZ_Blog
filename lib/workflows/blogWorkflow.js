import { researchAgent } from '@/lib/agents/researchAgent';
import { writerAgent } from '@/lib/agents/writerAgent';

/**
 * Blog Generation Workflow
 * Orchestrates research and writing to produce a complete blog post.
 *
 * @param {string} keyword - Seed keyword for the blog post
 * @returns {Promise<{ topic: string, keywords: string[], intent: string, content: string, excerpt: string }>}
 */
export async function blogWorkflow(keyword) {
  console.log(`[Workflow] Starting blog generation for: "${keyword}"`);

  // Step 1: Research
  console.log('[Workflow] Phase 1: Researching...');
  const researchData = await researchAgent(keyword);

  // Step 2: Writing
  console.log('[Workflow] Phase 2: Writing content...');
  const blogData = await writerAgent(researchData);

  console.log('[Workflow] Completed.');

  return {
    ...researchData,
    ...blogData,
  };
}
