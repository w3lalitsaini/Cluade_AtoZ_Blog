import { runBlogAgent } from './lib/workflows/blogAgent';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testAgent() {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGODB_URI!);
    
    console.log('Running Blog Agent for: "Future of Space Travel"');
    const result = await runBlogAgent('Future of Space Travel', { useCache: false, autoSave: false });
    
    console.log('--- AGENT RESULT ---');
    console.log('Title:', result.title);
    console.log('Image URL:', result.featured_image);
    console.log('Category:', result.category);
    console.log('Tags:', JSON.stringify(result.tags));
    console.log('Content Length:', result.content?.length);
    console.log('Fallback Used:', result.fallback_used);
    
    await mongoose.disconnect();
  } catch (err: any) {
    console.error('Agent Test Failed:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

testAgent();
