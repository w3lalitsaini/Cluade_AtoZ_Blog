import { generateText } from './lib/services/aiService';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testAI() {
  try {
    console.log('Testing AI connection...');
    const response = await generateText('Say "Hello World"');
    console.log('AI Response:', response);
  } catch (err) {
    console.error('AI Test Failed:', err.message);
  }
}

testAI();
