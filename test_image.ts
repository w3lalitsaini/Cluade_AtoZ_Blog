import { generateAIImage } from './lib/services/imageService';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testImage() {
  try {
    console.log('Testing AI Image Generation...');
    const result = await generateAIImage('Modern skyscraper in a futuristic city');
    console.log('Image Generation Result:', JSON.stringify(result, null, 2));
    
    if (result.url) {
      console.log('SUCCESS: Image URL received.');
    } else {
      console.error('FAILURE: No image URL received.');
    }
  } catch (err) {
    console.error('Image Test Failed:', err.message);
  }
}

testImage();
