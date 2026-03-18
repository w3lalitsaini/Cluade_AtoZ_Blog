const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");
const { config } = require("dotenv");

config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error(
    "Please define the MONGODB_URI environment variable inside .env",
  );
  process.exit(1);
}

// Inline Schema Definitions
const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    bio: String,
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: true },
    role: { type: String, default: "author" },
    image: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    color: { type: String, default: "#000000" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const TagSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

const PostSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: String,
    content: String,
    featuredImage: String,
    author: { type: Schema.Types.ObjectId, ref: "User" },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    status: { type: String, default: "published" },
    isFeatured: { type: Boolean, default: false },
    isBreaking: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Tag = mongoose.models.Tag || mongoose.model("Tag", TagSchema);
const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.");

    // Clear existing data
    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Post.deleteMany({}),
      Tag.deleteMany({}),
    ]);

    // Seed Categories
    console.log("Seeding categories...");
    const categories = await Category.insertMany([
      {
        name: "Technology",
        slug: "technology",
        description: "All things tech and innovation",
        color: "#3b82f6",
        isActive: true,
      },
      {
        name: "Business",
        slug: "business",
        description: "Market trends and corporate news",
        color: "#8b5cf6",
        isActive: true,
      },
      {
        name: "AI",
        slug: "ai",
        description: "Artificial Intelligence and Machine Learning",
        color: "#06b6d4",
        isActive: true,
      },
      {
        name: "Health",
        slug: "health",
        description: "Wellness, science, and medical news",
        color: "#ec4899",
        isActive: true,
      },
      {
        name: "Science",
        slug: "science",
        description: "Discoveries and scientific research",
        color: "#14b8a6",
        isActive: true,
      },
      {
        name: "Politics",
        slug: "politics",
        description: "Global politics and policy",
        color: "#f59e0b",
        isActive: true,
      },
      {
        name: "Sports",
        slug: "sports",
        description: "Tournament news and athlete profiles",
        color: "#f97316",
        isActive: true,
      },
      {
        name: "Entertainment",
        slug: "entertainment",
        description: "Movies, music, and pop culture",
        color: "#a855f7",
        isActive: true,
      },
    ]);

    // Seed Tags
    console.log("Seeding tags...");
    const tags = await Tag.insertMany([
      { name: "Future", slug: "future" },
      { name: "Research", slug: "research" },
      { name: "Innovation", slug: "innovation" },
      { name: "Global", slug: "global" },
      { name: "Digital", slug: "digital" },
      { name: "Startup", slug: "startup" },
    ]);

    // Seed Authors
    console.log("Seeding users...");
    const authors = await User.insertMany([
      {
        name: "Admin User",
        email: "admin@example.com",
        password: await bcrypt.hash("password123", 12),
        role: "admin",
        isVerified: true,
        bio: "System Administrator",
        image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop",
        isActive: true,
      },
      {
        name: "Sarah Johnson",
        email: "sarah@example.com",
        password: await bcrypt.hash("password123", 12),
        role: "author",
        isVerified: true,
        bio: "Sarah is a veteran tech journalist with a passion for emerging technologies and their impact on society.",
        image:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
        isActive: true,
      },
      {
        name: "Mike Chen",
        email: "mike@example.com",
        password: await bcrypt.hash("password123", 12),
        role: "author",
        isVerified: true,
        bio: "Mike specializes in business strategy and market analysis, bringing deep insights into the corporate world.",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
        isActive: true,
      },
      {
        name: "Emma Williams",
        email: "emma@example.com",
        password: await bcrypt.hash("password123", 12),
        role: "author",
        isVerified: true,
        bio: "Emma covers health and wellness, focusing on science-backed advice and medical advancements.",
        image:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
        isActive: true,
      },
    ]);

    // Seed Posts
    console.log("Seeding posts...");
    const posts = [
      {
        title:
          "AI Models Now Surpass Human Performance on Complex Reasoning Tasks",
        slug: "ai-models-human-performance",
        excerpt:
          "New research from leading AI labs shows language models achieving unprecedented scores on standardized reasoning benchmarks.",
        content:
          "<p>In a landmark development that has sent ripples through the artificial intelligence research community...</p><h2>What the Research Shows</h2><p>The study evaluated AI systems across twelve distinct cognitive domains...</p>",
        featuredImage:
          "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&h=600&fit=crop",
        author: authors[0]._id,
        category: categories[2]._id,
        tags: [tags[0]._id, tags[1]._id],
        status: "published",
        isFeatured: true,
        isBreaking: true,
        viewCount: 15420,
        publishedAt: new Date(),
      },
      {
        title: "The Future of Sustainable Energy in Modern Cities",
        slug: "future-sustainable-energy",
        excerpt:
          "Cities around the world are adopting new technologies to reduce carbon footprints and achieve energy independence.",
        content:
          "<p>Urban environments are at the forefront of the green transition...</p>",
        featuredImage:
          "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&h=600&fit=crop",
        author: authors[1]._id,
        category: categories[0]._id,
        tags: [tags[2]._id, tags[3]._id],
        status: "published",
        isFeatured: true,
        viewCount: 8900,
        publishedAt: new Date(Date.now() - 86400000),
      },
      {
        title: "Breakthrough in Genetic Research Hits New Milestone",
        slug: "genetic-research-milestone",
        excerpt:
          "Scientists have identified a key genetic marker that could revolutionize the treatment of rare autoimmune disorders.",
        content:
          "<p>A decade-long study has finally borne fruit with the discovery of...</p>",
        featuredImage:
          "https://images.unsplash.com/photo-1532187863486-abf51ad9f69d?w=1200&h=600&fit=crop",
        author: authors[2]._id,
        category: categories[4]._id,
        tags: [tags[1]._id, tags[4]._id],
        status: "published",
        isFeatured: false,
        viewCount: 12300,
        publishedAt: new Date(Date.now() - 172800000),
      },
      {
        title: "Tech Giants Face New Regulations in the European Union",
        slug: "tech-giants-eu-regulations",
        excerpt:
          "Sweeping new digital services acts are changing how big tech operates within the European market.",
        content:
          "<p>The regulatory landscape for technology companies is undergoing a major shift...</p>",
        featuredImage:
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop",
        author: authors[0]._id,
        category: categories[1]._id,
        tags: [tags[3]._id, tags[5]._id],
        status: "published",
        isFeatured: false,
        viewCount: 5600,
        publishedAt: new Date(Date.now() - 259200000),
      },
    ];

    await Post.insertMany(posts);

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error: any) {
    console.error("Error seeding database:", error?.message || error);
    process.exit(1);
  }
}

seed();
