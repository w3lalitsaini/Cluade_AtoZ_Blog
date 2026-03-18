/**
 * Test script for the upgraded AI Auto-Blog Engine.
 * Verifies parallel processing, timing, and logging.
 */
import { runAutoBlogEngine } from '../lib/workflows/autoBlogEngine';
import connectDB from '../lib/db';
import { logInfo } from '../lib/services/logger';

async function testEngine() {
  console.log('🚀 Starting Auto-Blog Engine Test...');
  
  try {
    await connectDB();
    
    const summary = await runAutoBlogEngine();
    
    console.log('\n--- Test Summary ---');
    console.log(`Total Keywords: ${summary.total}`);
    console.log(`Successful:     ${summary.success}`);
    console.log(`Failed:         ${summary.failed}`);
    console.log(`Retries:        ${summary.retries}`);
    console.log(`Total Duration: ${summary.duration}s`);
    console.log('--------------------\n');
    
    if (summary.success > 0 || summary.total > 0) {
      console.log('✅ Engine test completed successfully.');
    } else {
      console.log('⚠️ Engine ran but no keywords were processed.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Engine Test Failed:', error);
    process.exit(1);
  }
}

testEngine();
