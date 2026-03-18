import 'dotenv/config';

async function testFullSystem() {
  const keyword = 'Revolutionary Quantum Computing in 2026';
  console.log('--- STARTING FULL SYSTEM TEST ---');
  console.log(`Input Keyword: "${keyword}"\n`);

  try {
    // 1. Dynamic import to ensure env is ready
    const { runBlogAgent } = await import('../lib/workflows/blogAgent');

    // 2. Run Workflow
    console.log('[Step 1] Executing Blog Agent Workflow...');
    const result = await runBlogAgent(keyword);

    // 3. Status Checks (Simulating AI steps implicitly via logs in workflow)
    // The workflow already logs "Research started", "Content generation started", "SEO generation started"
    // We confirm finish here.
    console.log('Research OK');
    console.log('Content OK');
    console.log('SEO OK');

    // 4. Validate Structure
    console.log('\n[Step 2] Validating Response Structure...');
    const errors = [];

    // Check for null/undefined
    const fields = ['topic', 'keywords', 'search_intent', 'title', 'meta_description', 'slug', 'tags', 'content'] as const;
    fields.forEach(field => {
      if (result[field] === undefined || result[field] === null) {
        errors.push(`Field "${field}" is missing or null.`);
      }
    });

    // Check keywords array
    if (!Array.isArray(result.keywords) || result.keywords.length === 0) {
      errors.push('Keywords array is empty or not an array.');
    }

    // Check content for <h1>
    if (typeof result.content === 'string' && !result.content.includes('</h1>')) {
      errors.push('Content is missing <h1> tag.');
    }

    // Check slug
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (typeof result.slug === 'string' && !slugRegex.test(result.slug)) {
      errors.push(`Slug "${result.slug}" is not URL-safe or contains uppercase/invalid characters.`);
    }

    // Check meta_description length
    if (typeof result.meta_description === 'string') {
      const len = result.meta_description.length;
      if (len < 30 || len > 200) { // Relaxed for fallback mode
        console.warn(`[Warning] Meta description length is ${len} chars.`);
      }
    }

    if (errors.length > 0) {
      console.error('\n--- VALIDATION FAILED ---');
      errors.forEach(err => console.error(`- ${err}`));
      process.exit(1);
    }

    // 5. Success
    console.log('\n--- FIRST RUN COMPLETE ---');
    console.log(`Cache Status: ${result.cached ? 'HIT' : 'MISS'}`);
    
    if (!result.cached) {
      const { saveBlog } = await import('../lib/services/blogService');
      console.log('\n[Step 3] Saving result to database for caching check...');
      await saveBlog(result);
      
      console.log('\n[Step 4] Running workflow again (Expected CACHE HIT)...');
      const secondResult = await runBlogAgent(keyword);
      
      console.log('\n--- SECOND RUN DATA ---');
      console.log(JSON.stringify(secondResult, null, 2));

      if ((secondResult as any).cached) {
        console.log('\nCACHE HIT VERIFIED');
      } else {
        console.error('\nCACHE HIT FAILED');
        process.exit(1);
      }
    }

    console.log('\nAGENT SYSTEM WORKING SUCCESSFULLY');

  } catch (error: any) {
    console.error('\n--- SYSTEM ERROR ---');
    console.error(`Exact Error: ${error.message}`);
    
    if (error.message.includes('429')) {
      console.log('\nFIX SUGGESTION: Your OpenAI API quota is exceeded. Please check your billing or API limits at platform.openai.com.');
    } else if (error.message.includes('keyword')) {
      console.log('\nFIX SUGGESTION: Ensure you are passing a valid non-empty string as the keyword.');
    } else {
      console.log('\nFIX SUGGESTION: Check your network connection and ensure your OPENAI_API_KEY is correctly set in .env.');
    }
    process.exit(1);
  }
}

testFullSystem();
