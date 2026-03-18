import 'dotenv/config';
import { runAutoBlogEngine } from '../lib/workflows/autoBlogEngine';

async function testAutoBlogEngine() {
  console.log('🚀 Testing Automated Blog Generation Engine...');

  try {
    const summary = await runAutoBlogEngine();

    console.log('\n--- ENGINE TEST SUMMARY ---');
    console.log('Total Processed:', summary.total);
    console.log('Successfully Saved:', summary.success);
    console.log('Failed/Skipped:', summary.failed);
    
    if (summary.total > 0) {
      console.log('✅ PASS: Engine completed its cycle.');
    } else {
      console.warn('⚠️ WARNING: No keywords were processed.');
    }
  } catch (err) {
    console.error('❌ CRITICAL ENGINE ERROR:', err instanceof Error ? err.message : String(err));
  }
}

testAutoBlogEngine();
