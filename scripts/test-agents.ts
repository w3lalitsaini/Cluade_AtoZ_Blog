import 'dotenv/config';

async function main() {
  const keyword = 'Artificial Intelligence in 2024';
  
  try {
    // Dynamic import to ensure process.env is populated before openai.js is evaluated
    const { blogWorkflow } = await import('../lib/workflows/blogWorkflow');

    console.log('--- Agent System Test ---');
    const result = await blogWorkflow(keyword);
    
    console.log('\n--- Result ---');
    console.log('Topic:', result.topic);
    console.log('Keywords:', result.keywords.join(', '));
    console.log('Intent:', result.search_intent);
    console.log('\nExcerpt:', result.excerpt);
    console.log('\nContent Preview (First 200 chars):');
    console.log(result.content.substring(0, 200) + '...');
    console.log('--- Test Passed ---');
  } catch (error) {
    console.error('--- Test Failed ---');
    console.error(error);
    process.exit(1);
  }
}

main();
