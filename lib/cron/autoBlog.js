import cron from 'node-cron';
import { runBlogAgent } from '../workflows/blogAgent';
import { isKeywordUsed } from '../services/blogService';
import { logInfo, logError, logWarn } from '../services/logger';

const DEFAULT_KEYWORDS = [
  "Future of AI Agents",
  "Latest Crypto Trends 2026",
  "Mastering Next.js 15",
  "Sustainable Technology Solutions",
  "Passive Income Ideas for Developers",
  "Cloud Computing Best Practices",
  "Web3 Development Guide",
  "AI for Small Business Growth",
  "Cybersecurity in 2026",
  "The Rise of Neo-Banking"
];

/**
 * Daily Blog Generation Task
 * Runs at 9:00 AM daily
 */
export async function generateDailyBlogs() {
  await logInfo('AutoBlog', 'Daily automation cycle started.');

  try {
    // 1. Get 5 unique keywords to process today
    // In a real app, this could fetch from an API or trending database
    const shuffled = [...DEFAULT_KEYWORDS].sort(() => 0.5 - Math.random());
    const keywords = shuffled.slice(0, 5);

    let createdCount = 0;
    let failedCount = 0;

    for (const keyword of keywords) {
      // 2. Double check if keyword was recently used
      const used = await isKeywordUsed(keyword);
      if (used) {
        await logWarn('AutoBlog', `Keyword already used, skipping: ${keyword}`);
        continue;
      }

      await logInfo('AutoBlog', `Processing daily blog for: ${keyword}`);

      try {
        // 3. Run Workflow with autoSave enabled
        const result = await runBlogAgent(keyword, { useCache: true, autoSave: true });
        
        if (result.postId || result.cached) {
          createdCount++;
          await logInfo('AutoBlog', `Success! Created/Retrieved blog for: ${keyword}`);
        } else {
          failedCount++;
          await logError('AutoBlog', `Failed to create blog for: ${keyword}`);
        }
      } catch (err) {
        failedCount++;
        await logError('AutoBlog', `Error processing ${keyword}: ${err.message}`);
      }

      // Add a small delay between tasks to avoid API hammering
      await new Promise(r => setTimeout(r, 2000));
    }

    await logInfo('AutoBlog', `Daily cycle complete. Success: ${createdCount}, Failed: ${failedCount}`);
    return { success: true, createdCount, failedCount };
  } catch (err) {
    await logError('AutoBlog', `Fatal cron error: ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * Initialize Scheduler
 */
export function initBlogCron() {
  // Run at 09:00 AM every day
  cron.schedule('0 9 * * *', async () => {
    await generateDailyBlogs();
  });
  
  logInfo('AutoBlog', 'Cron Scheduler initialized (9:00 AM daily)');
}
