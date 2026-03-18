import 'dotenv/config';
import { getTrendingKeywords } from '../lib/services/keywordService';

async function testKeywordService() {
  console.log('🚀 Testing Keyword Research Service...');

  try {
    const keywords = await getTrendingKeywords();

    console.log('--- TEST RESULTS ---');
    console.log('Result Type:', typeof keywords);
    console.log('Is Array?', Array.isArray(keywords));
    console.log('Count:', keywords.length);
    console.log('Keywords:', JSON.stringify(keywords, null, 2));

    if (Array.isArray(keywords) && keywords.length >= 10) {
      console.log('✅ PASS: Keyword service is working as expected.');
    } else {
      console.error('❌ FAIL: Invalid output format or too few keywords.');
    }
  } catch (err) {
    console.error('❌ CRITICAL ERROR:', err instanceof Error ? err.message : String(err));
  }
}

testKeywordService();
