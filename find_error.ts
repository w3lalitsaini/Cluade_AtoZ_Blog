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
    const errorLog = await Log.findOne({ 
      level: 'error',
      source: { $in: ['BlogAgent', 'AutoBlogEngine', 'ImageService'] },
      timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } 
    }).sort({ timestamp: -1 });

    if (errorLog) {
      console.log('--- ERROR FOUND ---');
      console.log(`Source: ${errorLog.source}`);
      console.log(`Message: ${errorLog.message}`);
      console.log(`Metadata: ${JSON.stringify(errorLog.metadata, null, 2)}`);
    } else {
      console.log('No error logs found in the last 15 minutes.');
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error(err.message);
  }
}

findError();
