import { runBlogAgent } from "@/lib/workflows/blogAgent";
import { isKeywordUsed, markKeywordUsed } from "@/lib/services/blogService";
import { logInfo, logError, logWarn } from "@/lib/services/logger";
import { getTrendingKeywords } from "@/lib/services/keywordService";

/**
 * Automated Blog Generation Engine (V2 - Scalable & Parallel)
 * Features:
 * - Controlled Concurrency (Parallel Batching)
 * - 1-Retry Logic for failures
 * - Performance Metrics (Duration, Ratios)
 * - Intelligent Throttling
 */
export async function runAutoBlogEngine() {
  const startTime = Date.now();
  await logInfo('AutoBlogEngine', 'Starting Intelligent Automation Cycle...');
  
  const summary = {
    total: 0,
    success: 0,
    failed: 0,
    retries: 0,
    duration: 0,
    results: []
  };

  try {
    // 1. Fetch Trending Keywords
    const keywords = await getTrendingKeywords();
    summary.total = keywords.length;

    if (summary.total === 0) {
      await logWarn('AutoBlogEngine', 'No keywords found. Terminating cycle.');
      return summary;
    }

    console.log(`[AutoBlogEngine] 🚀 Processing ${summary.total} keywords with controlled parallelism...`);

    // 2. Controlled Parallel Batching (Process 2 at a time)
    const BATCH_SIZE = 2;
    for (let i = 0; i < keywords.length; i += BATCH_SIZE) {
      const batch = keywords.slice(i, i + BATCH_SIZE);
      console.log(`\n📦 [Batch] Processing items ${i + 1} to ${Math.min(i + BATCH_SIZE, summary.total)}...`);

      const batchPromises = batch.map(async (keyword) => {
        const itemStartTime = Date.now();
        let attempts = 0;
        const MAX_ATTEMPTS = 2; // Initial + 1 Retry

        while (attempts < MAX_ATTEMPTS) {
          try {
            attempts++;
            
            // Check Deduplication
            if (await isKeywordUsed(keyword)) {
              return { keyword, status: 'skipped', reason: 'already_used' };
            }

            const result = await runBlogAgent(keyword, { useCache: true, autoSave: true });

            if (result.postId || result.cached) {
              const duration = ((Date.now() - itemStartTime) / 1000).toFixed(1);
              await markKeywordUsed(keyword, 'success', result.postId);
              return { keyword, status: 'success', duration, postId: result.postId, cached: result.cached, attempts };
            }
            throw new Error('No post ID returned from agent');

          } catch (err) {
            if (attempts < MAX_ATTEMPTS) {
              console.warn(`[Retry] Attempt ${attempts} failed for "${keyword}". Retrying...`);
              summary.retries++;
              // Wait 1s before retry
              await new Promise(r => setTimeout(r, 1000));
              continue;
            }
            
            const errorMsg = err instanceof Error ? err.message : String(err);
            await markKeywordUsed(keyword, 'failed');
            return { keyword, status: 'failed', error: errorMsg, attempts };
          }
        }
      });

      // Execute batch in parallel
      const batchResults = await Promise.all(batchPromises);

      // Process results and update summary
      batchResults.forEach(res => {
        if (!res) return;
        if (res.status === 'success') {
          summary.success++;
          console.log(`✅ Success: "${res.keyword}" (${res.duration}s)`);
        } else if (res.status === 'failed') {
          summary.failed++;
          console.error(`❌ Failed: "${res.keyword}" - ${res.error}`);
        } else if (res.status === 'skipped') {
          summary.total--; // Adjust total for skipped
        }
        summary.results.push(res);
      });

      // 3. Batch Delay (Rate Limit Protection)
      if (i + BATCH_SIZE < keywords.length) {
        console.log(`⏳ Batch complete. Throttling for 2s...`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    // 4. Final Metrics
    summary.duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const ratio = ((summary.success / (summary.total || 1)) * 100).toFixed(0);

    await logInfo('AutoBlogEngine', `Cycle Complete. Success Ratio: ${ratio}%`, {
      ...summary,
      results: undefined // Don't bloat logs
    });

    console.log(`\n🏁 [AutoBlogEngine] Finished in ${summary.duration}s. Success: ${summary.success}, Failed: ${summary.failed}, Retries: ${summary.retries}`);
    return summary;

  } catch (criticalError) {
    await logError('AutoBlogEngine', 'CRITICAL SYSTEM FAILURE', criticalError);
    throw criticalError;
  }
}
