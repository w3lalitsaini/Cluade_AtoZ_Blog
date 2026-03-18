import 'dotenv/config';
import cron from 'node-cron';
import { runAutoBlogEngine } from '../lib/workflows/autoBlogEngine';

/**
 * Cron Job for Automated Blog Generation
 * Scheduled to run every day at midnight (00:00).
 * Includes concurrency protection to prevent multiple simultaneous runs.
 */

let isEngineRunning = false;

// Schedule: Every day at 00:00 (Midnight)
// You can change '0 0 * * *' to other intervals for testing, e.g., '*/1 * * * *' for every minute.
const SCHEDULE = '0 0 * * *';

console.log(`[Cron] Initializing Blog Automation Cron...`);
console.log(`[Cron] Schedule: ${SCHEDULE}`);

cron.schedule(SCHEDULE, async () => {
  const timestamp = new Date().toISOString();
  
  if (isEngineRunning) {
    console.warn(`[Cron] [${timestamp}] Skipping run: AutoBlogEngine is already in progress.`);
    return;
  }

  console.log(`\n--- [Cron] [${timestamp}] STARTING DAILY BLOG AUTOMATION ---`);
  
  try {
    isEngineRunning = true;
    
    // Execute the full automation engine
    const summary = await runAutoBlogEngine();
    
    const endTimestamp = new Date().toISOString();
    console.log(`--- [Cron] [${endTimestamp}] DAILY BLOG AUTOMATION COMPLETE ---`);
    console.log(`--- [Cron] Result: Total: ${summary.total}, Success: ${summary.success}, Failed: ${summary.failed} ---\n`);

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`--- [Cron] [${new Date().toISOString()}] CRITICAL ERROR in Cron Job: ${errorMsg} ---`);
  } finally {
    isEngineRunning = false;
  }
});

console.log(`[Cron] Service is now active and waiting for schedule event.`);

// Keep process alive (unnecessary if run with a process manager like PM2, but good for local dev)
process.on('SIGINT', () => {
  console.log('\n[Cron] Shutting down gracefully...');
  process.exit(0);
});
