import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
  process.exit(1);
}

// Define inline schemas for diagnostics
const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  isActive: Boolean,
});

const PostSchema = new mongoose.Schema({
  title: String,
  status: String,
  viewCount: Number,
});

const SubscriberSchema = new mongoose.Schema({
  email: String,
  isActive: Boolean,
});

const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);
const Subscriber =
  mongoose.models.Subscriber || mongoose.model("Subscriber", SubscriberSchema);

async function check() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log("Connected to MongoDB\n");

    // 1. Categories
    const categories = await Category.find();
    console.log("--- CATEGORIES ---");
    categories.forEach((c) =>
      console.log(`- ${c.name} (${c.slug}) [Active: ${c.isActive}]`),
    );

    const nicheCat = categories.find(
      (c) =>
        c.name.toLowerCase().includes("niche") ||
        c.slug.toLowerCase().includes("niche"),
    );
    if (nicheCat) console.log(`\nFound niche category: ${nicheCat.name}`);
    else console.log("\nNo niche category found.");

    // 2. Posts
    const totalPosts = await Post.countDocuments();
    const publishedPosts = await Post.countDocuments({ status: "published" });
    const draftPosts = await Post.countDocuments({ status: "draft" });

    console.log("\n--- POSTS ---");
    console.log(`Total: ${totalPosts}`);
    console.log(`Published: ${publishedPosts}`);
    console.log(`Drafts: ${draftPosts}`);

    if (publishedPosts > 0) {
      const topPosts = await Post.find({ status: "published" })
        .sort({ viewCount: -1 })
        .limit(5);
      console.log("\nTop 5 Posts by Views:");
      topPosts.forEach((p) =>
        console.log(`- ${p.title} (${p.viewCount} views)`),
      );
    }

    // 3. Subscribers
    const subscribers = await Subscriber.countDocuments();
    console.log("\n--- SUBSCRIBERS ---");
    console.log(`Total: ${subscribers}`);

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error: any) {
    console.error("Error:", error?.message || error);
    process.exit(1);
  }
}

check();
