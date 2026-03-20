import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const LogSchema = new mongoose.Schema({
  level: String,
  message: String,
  source: String,
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: Date
});

const Log = mongoose.models.Log || mongoose.model('Log', LogSchema);

async function findError() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const logs = await Log.find({ 
      source: { $in: ['BlogAgent', 'AutoBlogEngine', 'ImageService', 'AgentBlogAPI', 'AIService'] },
      timestamp: { $gte: new Date(Date.now() - 10 * 60 * 1000) } 
    }).sort({ timestamp: -1 }).limit(50);

    if (logs && logs.length > 0) {
      console.log(`--- FOUND ${logs.length} RECENT LOGS ---`);
      logs.forEach(log => {
        console.log(`[${log.timestamp.toISOString()}] [${log.level}] [${log.source}] ${log.message}`);
        if (log.metadata && Object.keys(log.metadata).length > 0) {
          console.log(`   Metadata: ${JSON.stringify(log.metadata)}`);
        }
      });
    } else {
      console.log('No recent logs found in the last 10 minutes.');
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error(err.message);
  }
}

findError();
