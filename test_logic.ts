import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { saveBlog } from './lib/services/blogService';
import { Category } from './models/Category';
import { Tag } from './models/Tag';
import Post from './models/Post';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testLogic() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Create a test category and tag if they don't exist
    const testCatName = "Test-Category-AI";
    const testTagName = "Test-Tag-AI";
    
    let cat = await Category.findOne({ name: testCatName });
    if (!cat) {
      cat = await Category.create({ name: testCatName, slug: 'test-category-ai' });
      console.log('Created test category');
    }

    let tag = await Tag.findOne({ name: testTagName });
    if (!tag) {
      tag = await Tag.create({ name: testTagName, slug: 'test-tag-ai' });
      console.log('Created test tag');
    }

    // 2. Mock blog data that SHOULD reuse the existing ones
    // Note: We use slightly different casing/spacing to test the new robust matching
    const mockBlogData = {
      topic: "Testing Category Reuse " + Date.now(),
      content: "<div><h1>Test Post</h1><p>This is a test post content with <strong>bold</strong> and lists.</p><ul><li>Item 1</li><li>Item 2</li></ul></div>",
      category: "  test-category-ai  ", // Different casing and spaces
      tags: ["  test-tag-ai  ", "New-Unique-Tag-" + Date.now()],
      excerpt: "Testing if it reuses the category and tag.",
      slug: "test-reuse-" + Date.now(),
      meta_description: "Meta desc",
      meta_title: "Meta title",
      focus_keyword: "test reuse"
    };

    console.log('Saving blog with mocked data...');
    const savedPost = await saveBlog(mockBlogData);
    console.log(`Saved Post ID: ${savedPost._id}`);

    // 3. Verify reuse
    const populatedPost = await Post.findById(savedPost._id).populate('category tags');
    
    const catReused = populatedPost.category.name === testCatName;
    const tagReused = populatedPost.tags.some(t => t.name === testTagName);

    console.log(`Category Reused: ${catReused}`);
    console.log(`Tag Reused: ${tagReused}`);

    if (catReused && tagReused) {
      console.log('SUCCESS: Logic verified.');
    } else {
      console.error('FAILURE: Logic check failed.');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error during test:', err);
    process.exit(1);
  }
}

testLogic();
