import 'dotenv/config';

async function testRateLimiting() {
  console.log('--- STARTING RATE LIMITING TEST ---');
  
  const { isRateLimited } = await import('../lib/services/rateLimiter');
  const testIp = '192.168.1.1';
  const limit = 5;

  console.log(`Simulating ${limit + 1} requests for IP: ${testIp}...`);

  for (let i = 1; i <= limit + 1; i++) {
    const limited = isRateLimited(testIp, { limit });
    console.log(`Request ${i}: ${limited ? 'RATE LIMITED (Correct)' : 'Allowed'}`);
    
    if (i <= limit && limited) {
      console.error('FAIL: Limited too early!');
      process.exit(1);
    }
    
    if (i > limit && !limited) {
      console.error('FAIL: Limit not enforced!');
      process.exit(1);
    }
  }

  console.log('\nRATE LIMITING VERIFIED SUCCESSFULLY');
}

testRateLimiting();
