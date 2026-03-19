import cron from 'node-cron';
import { logInfo, logError } from '../services/logger';
import { runAutoBlogEngine } from '../workflows/autoBlogEngine';

/**
 * Scheduled Blog Generation Task
 * Triggered by cron every 2 hours
 */
export async function generateDailyBlogs() {
  await logInfo('AutoBlog', 'Scheduled automation cycle triggered.');

  try {
    const summary = await runAutoBlogEngine();
    
    await logInfo('AutoBlog', `Cycle complete. Success: ${summary.success}, Failed: ${summary.failed}, Duration: ${summary.duration}s`);
    return { success: true, ...summary };
  } catch (err) {
    await logError('AutoBlog', `Fatal scheduler error: ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * Initialize Scheduler
 * High-Frequency: Every 10 Minutes
 */
export function initBlogCron() {
  // Run every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    await generateDailyBlogs();
  });
  
  logInfo('AutoBlog', 'Intelligent Cron Scheduler initialized (Every 10 Minutes)');
}
