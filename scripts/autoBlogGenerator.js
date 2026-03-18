import 'dotenv/config';
import connectDB from '../lib/db';
import { runBlogAgent } from '../lib/workflows/blogAgent';

/**
 * Batch Blog Generation Pipeline
 * Processes a list of keywords and generates/saves blogs for each.
 */
async function runBatchPipeline() {
  // --- CONFIGURATION ---
  const keywords = [
    'Future of Renewable Energy 2026',
    'AI in Modern Agriculture benefits',
    'Quantum Computing for Beginners 2026'
  ];
  
  const minDelay = 2000; // 2 seconds
  const maxDelay = 5000; // 5 seconds

  console.log('🚀 --- STARTING BATCH BLOG GENERATOR ---');
  console.log(`Keywords to process: ${keywords.length}`);
  
  try {
    // 1. Ensure Database Connection
    console.log('[Setup] Connecting to MongoDB...');
    await connectDB();
    console.log('[Setup] Database connected successfully.\n');

    const stats = {
      total: keywords.length,
      success: 0,
      failed: 0,
      skipped: 0
    };

    // 2. Process Keywords
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      const progress = `[${i + 1}/${keywords.length}]`;
      
      console.log(`${progress} Processing: "${keyword}"...`);
      
      try {
        const result = await runBlogAgent(keyword, { useCache: true, autoSave: true });
        
        if (result.postId) {
          console.log(`✅ Success: Saved post ID: ${result.postId}`);
          stats.success++;
        } else if (result.cached) {
          console.log(`ℹ️ Info: Keyword already exists in cache, skipped.`);
          stats.skipped++;
        } else if (result.fallback_used) {
          console.warn(`⚠️ Warning: Generation used fallback (quota limit?), post not saved.`);
          stats.failed++;
        } else {
          console.error(`❌ Error: Workflow completed but post not saved for unknown reason.`);
          stats.failed++;
        }
      } catch (err) {
        console.error(`❌ Error processing "${keyword}":`, err instanceof Error ? err.message : String(err));
        stats.failed++;
      }

      // 3. Delay between requests (except for the last one)
      if (i < keywords.length - 1) {
        const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay);
        console.log(`⏳ Waiting ${delay}ms before next keyword...\n`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // 4. Final Summary
    console.log('\n🏁 --- BATCH PROCESSING COMPLETE ---');
    console.log(`Total keywords: ${stats.total}`);
    console.log(`✅ Successes:    ${stats.success}`);
    console.log(`ℹ️ Skipped:      ${stats.skipped}`);
    console.log(`❌ Failures:     ${stats.failed}`);

  } catch (criticalError) {
    console.error('\n🛑 CRITICAL ERROR: Pipeline stopped unexpectedly:', criticalError);
    process.exit(1);
  } finally {
    // Graceful exit
    process.exit(0);
  }
}

// Run the pipeline
runBatchPipeline();
