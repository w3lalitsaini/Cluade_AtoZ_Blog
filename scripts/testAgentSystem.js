/**
 * Full System Test for Agentic AI Blog Integration
 *
 * This script verifies that the /api/agent-blog endpoint is functional
 * and returns the expected data structure.
 * 
 * Run with: npx tsx scripts/testAgentSystem.js
 */

async function runSystemTest() {
  const TEST_KEYWORD = "Sustainability in Smart Cities 2026";
  const API_URL = "http://localhost:3000/api/agent-blog";

  console.log("🧪 Starting Full System Test: Agentic AI Integration");
  console.log(`Keyword: "${TEST_KEYWORD}"`);
  console.log(`Endpoint: ${API_URL}\n`);

  try {
    const startTime = Date.now();
    
    // 1. Call the API
    console.log("[1/3] Triggering AI Generation (may take 20-40s)...");
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keyword: TEST_KEYWORD,
        save: false // We only want to test generation, not save to DB for this test
      })
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const json = await response.json();
    
    if (!json.success || !json.data) {
      throw new Error("API reported failure or returned no data.");
    }

    const { data } = json;
    console.log(`[2/3] Response received in ${duration}s.`);

    // 2. Comprehensive Verification
    console.log("[3/3] Verifying data integrity...");
    const errors = [];

    if (!data.topic) errors.push("Missing 'topic'");
    if (!data.content || data.content.length < 100) errors.push("Missing or essentially empty 'content'");
    if (!Array.isArray(data.keywords) || data.keywords.length === 0) errors.push("Missing or empty 'keywords' array");
    if (!data.title) errors.push("Missing 'title'");
    if (!data.slug) errors.push("Missing 'slug'");

    if (errors.length > 0) {
      console.error("\n❌ TEST FAILED: Verification Errors Found");
      errors.forEach(err => console.error(`   - ${err}`));
      process.exit(1);
    }

    // 3. Final Result
    console.log("\n✅ SUCCESS: Agentic AI System is fully functional!");
    console.log("--------------------------------------------------");
    console.log(`Topic:   ${data.topic}`);
    console.log(`Content: ${data.content.substring(0, 100)}... (${data.content.length} chars)`);
    console.log(`Keywords: ${data.keywords.join(", ")}`);
    console.log(`Fallback: ${data.fallback_used ? "YES (Quota limit hit)" : "NO"}`);
    console.log("--------------------------------------------------");
    
    process.exit(0);

  } catch (err) {
    console.error("\n❌ TEST FAILED: System Error Detected");
    console.error(`   - ${err.message}`);
    process.exit(1);
  }
}

// Ensure the test handles timeouts for very long generations
const timeout = setTimeout(() => {
  console.error("\n❌ TEST FAILED: Timeout after 120 seconds");
  process.exit(1);
}, 120000);

runSystemTest().finally(() => clearTimeout(timeout));
