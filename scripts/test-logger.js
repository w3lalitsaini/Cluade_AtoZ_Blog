import 'dotenv/config';
import { logInfo, logError, logAgentStep } from '../lib/services/logger';
import Log from '../models/Log';
import connectDB from '../lib/db';

async function testLoggingSystem() {
  console.log('🚀 Testing Production Logging System...');

  try {
    const testKeyword = 'test-log-keyword-2026';
    
    // 1. Log various types
    await logInfo('TestRunner', 'System test started');
    await logAgentStep('MockAgent', 'Step 1: Initialization', testKeyword, { detail: 'Testing metadata' });
    await logError('TestRunner', 'Simulated error for testing', new Error('Test error message'));

    console.log('✅ Logs emitted to console and DB');

    // 2. Verify in DB
    await connectDB();
    const recentLogs = await Log.find({ source: { $in: ['TestRunner', 'MockAgent'] } }).sort({ timestamp: -1 }).limit(5);
    
    console.log(`\n--- Recent Logs Found in DB (${recentLogs.length}) ---`);
    recentLogs.forEach(l => {
        console.log(`[${l.level.toUpperCase()}] [${l.source}] ${l.message}`);
    });

    if (recentLogs.length >= 3) {
        console.log('\n✅ Database Logging: SUCCESS');
    } else {
        console.error('\n❌ Database Logging: FAILED (Logs not found in DB)');
    }

  } catch (err) {
    console.error('❌ ERROR:', err instanceof Error ? err.message : String(err));
  }
}

testLoggingSystem();
