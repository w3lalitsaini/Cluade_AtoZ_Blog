import * as dotenv from 'dotenv';
dotenv.config();
import * as fs from 'fs';

import { runBlogAgent } from './lib/workflows/blogAgent';

async function testAgent() {
  console.log("Testing Blog Agent...");
  try {
     const result = await runBlogAgent("Quantum Computing in 2026", { autoSave: false, useCache: false });
     fs.writeFileSync('agent-output.json', JSON.stringify(result, null, 2));
     console.log("WROTE OUTPUT TO agent-output.json");
  } catch (e) {
     fs.writeFileSync('agent-output.json', JSON.stringify({error: e.message, stack: e.stack}, null, 2));
     console.error("Agent Error:\n", e);
  }
  process.exit(0);
}

testAgent();
