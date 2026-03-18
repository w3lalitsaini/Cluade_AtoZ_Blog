import { runBlogAgent } from "@/lib/workflows/blogAgent";
import { isKeywordUsed, markKeywordUsed } from "@/lib/services/blogService";
import { logInfo, logError, logWarn } from "@/lib/services/logger";

/**
 * Automated Blog Generation Engine
 * Fetches trending keywords and generates a full blog post for each.
 * Includes rate-limiting delays and robust error handling.
 * 
 * @returns {Promise<{ total: number, success: number, failed: number, results: Array }>} Summary of the run.
 */
export async function runAutoBlogEngine() {
  await logInfo('AutoBlogEngine', 'Starting full automation cycle...');
  
  const summary = {
    total: 0,
    success: 0,
    failed: 0,
    results: []
  };

  try {
    // 1. Fetch Keywords
    const keywords = await getTrendingKeywords();
    summary.total = keywords.length;

    if (summary.total === 0) {
      console.warn('[AutoBlogEngine] No keywords found to process.');
      return summary;
    }

    console.log(`[AutoBlogEngine] Processing ${summary.total} keywords...`);

    // 2. Loop Through Keywords
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      const progress = `[${i + 1}/${summary.total}]`;
      
      console.log(`${progress} Keyword: "${keyword}"`);
      
      try {
        // 3. Explicit Deduplication Check
        const alreadyUsed = await isKeywordUsed(keyword);
        if (alreadyUsed) {
          await logInfo('AutoBlogEngine', `Skipping existing keyword: ${keyword}`);
          summary.total--; // Don't count skipped as part of this run's total processing
          continue; 
        }

        // 4. Run Blog Agent (with autoSave enabled)
        const result = await runBlogAgent(keyword, { 
          useCache: true, 
          autoSave: true 
        });

        if (result.postId || result.cached) {
          const status = result.cached ? 'CACHED' : 'CREATED';
          console.log(`✅ ${progress} Success (${status}): ${keyword}`);
          
          // Mark as used in DB
          await markKeywordUsed(keyword, 'success', result.postId);
          
          summary.success++;
          summary.results.push({ keyword, status: 'success', postId: result.postId, cached: result.cached });
        } else {
          throw new Error('Workflow completed but no post ID was returned (possibly fallback mode)');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`❌ ${progress} Failed: ${keyword} - Error: ${errorMsg}`);
        
        // Mark as failed so we don't keep retrying the same broken keyword immediately
        await markKeywordUsed(keyword, 'failed');
        
        summary.failed++;
        summary.results.push({ keyword, status: 'failed', error: errorMsg });
      }

      // 4. Delay between requests (except for the last one)
      // Standard delay: 2 to 5 seconds
      if (i < keywords.length - 1) {
        const delayMs = Math.floor(Math.random() * (5000 - 2000 + 1) + 2000);
        console.log(`⏳ [AutoBlogEngine] Waiting ${delayMs}ms before next keyword...\n`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    await logInfo('AutoBlogEngine', 'Automation cycle complete.', summary);
    return summary;

  } catch (criticalError) {
    await logError('AutoBlogEngine', 'CRITICAL SYSTEM FAILURE', criticalError);
    throw criticalError;
  }
}
