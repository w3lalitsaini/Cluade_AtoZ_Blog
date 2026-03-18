import 'dotenv/config';
import { linkingAgent } from '../lib/agents/linkingAgent';

async function testLinkingAgentDirect() {
  console.log('--- STARTING LINKING AGENT DIRECT TEST ---');

  const mockContent = `
    <h1>The Future of Space Travel</h1>
    <p>Space exploration has always been a dream for humanity. With the advancement of technology, we are now looking at Mars as a potential second home.</p>
    <p>Sustainable colonies will require advanced life support systems and efficient resource management.</p>
  `;

  const mockKeywords = ['space exploration', 'Mars', 'technology', 'life support systems'];

  console.log('[Test] Calling linkingAgent...');
  
  try {
    const result = await linkingAgent({
      content: mockContent,
      keywords: mockKeywords
    });

    console.log('\n--- RESULT CONTENT ---');
    console.log(result.content);
    
    if (result.fallback_used) {
      console.log('\n[Result] Fallback used (Quota Exceeded).');
    } else {
      console.log('\n[Result] Links successfully inserted (likely).');
    }

    if (result.content.includes('<a href="/blog/')) {
      console.log('VERIFICATION: Links found in content!');
    } else if (!result.fallback_used) {
      console.warn('VERIFICATION: No links found but no fallback used? Check agent logic.');
    }

  } catch (error) {
    console.error('Test Failed:', error.message);
  }
}

testLinkingAgentDirect();
