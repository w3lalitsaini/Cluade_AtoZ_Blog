import 'dotenv/config';
import { getCachedBlog, setCachedBlog } from '../lib/services/cacheService';

async function testCacheService() {
  console.log('🚀 Testing AI Cache Service...');
  const testKeyword = 'test-cache-keyword-2026';
  const testData = { topic: 'Test Topic', content: '<p>Test content</p>', fallback_used: false };

  try {
    // 1. Set Cache
    await setCachedBlog(testKeyword, testData, 60); // 60s for test
    console.log('✅ Cache Set');

    // 2. Get Cache
    const retrieved = await getCachedBlog(testKeyword);
    if (retrieved && retrieved.topic === testData.topic) {
        console.log('✅ Cache Get: SUCCESS');
        console.log('Retrieved Data:', JSON.stringify(retrieved, null, 2));
    } else {
        console.error('❌ Cache Get: FAILED or MISMATCH');
    }

    // 3. Verify Fallback Expiry/Missing
    const missing = await getCachedBlog('non-existent-keyword');
    if (missing === null) {
        console.log('✅ Cache Miss: SUCCESS');
    } else {
        console.error('❌ Cache Miss: FAILED (returned something for missing key)');
    }

  } catch (err) {
    console.error('❌ ERROR:', err instanceof Error ? err.message : String(err));
  }
}

testCacheService();
