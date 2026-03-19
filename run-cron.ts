import * as dotenv from 'dotenv';
dotenv.config();

import { generateDailyBlogs } from './lib/cron/autoBlog';
import connectDB from './lib/db';
import mongoose from 'mongoose';

async function testCron() {
  console.log("Starting manual cron job test...");
  try {
    await connectDB();
    const result = await generateDailyBlogs();
    console.log("Cron Result:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Cron failed manually:", err);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

testCron();
