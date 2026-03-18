import mongoose from "mongoose";
import Post from "../models/Post";
import User from "../models/User";
import Category from "../models/Category";
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env") });

async function publishPost() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");

    let post = await Post.findOne({ status: "draft" });
    if (!post) {
      console.log(
        "No draft posts found, using an existing published post for verification.",
      );
      post = await Post.findOne({ status: "published" });
    }

    if (!post) {
      console.log("No posts found at all.");
      process.exit(0);
    }

    const admin = await User.findOne({ role: "admin" });
    const category = await Category.findOne();

    if (!admin || !category) {
      console.log(
        "Admin or Category not found. Post might lack essential relations.",
      );
    }

    post.status = "published";
    post.publishedAt = post.publishedAt || new Date();
    post.viewCount = (post.viewCount || 0) + 500;

    // Ensure author and category are set if missing
    if (!post.author && admin) post.author = admin._id;
    if (!post.category && category) post.category = category._id;

    await post.save();
    console.log(
      `Successfully updated/published post: ${post.title} with ${post.viewCount} views`,
    );

    process.exit(0);
  } catch (error: any) {
    console.error("Error publishing post:", error?.message || error);
    process.exit(1);
  }
}

publishPost();
