import connectDB from "./lib/db";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("🛠️  Instrumentation: Initializing background services...");
    
    // Connect to DB immediately to avoid delays in background tasks
    try {
      await connectDB();
      console.log("🛠️  Instrumentation: Connected to MongoDB.");
    } catch (err) {
      console.error("🛠️  Instrumentation: Failed to connect to MongoDB.", err);
    }
    
    // Start Cron scheduler
    try {
      const { initBlogCron } = await import("./lib/cron/autoBlog");
      initBlogCron();
      console.log("🛠️  Instrumentation: Cron jobs registered successfully.");
    } catch (err) {
      console.error("🛠️  Instrumentation: Failed to register Cron jobs.", err);
    }
  }
}
