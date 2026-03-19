import * as dotenv from 'dotenv';
dotenv.config();

import { generateText } from './lib/services/aiService';

async function test() {
  console.log("Testing AI text generation...");
  try {
     const t = await generateText("Hello world!");
     console.log("AI TEXT:", t);
  } catch (e) {
     console.error("AI FAIL:", e);
  }
}

test();
