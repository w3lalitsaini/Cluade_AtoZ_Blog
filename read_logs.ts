import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Force .env reading
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const LogSchema = new mongoose.Schema({
  level: String,
  message: String,
  source: String,
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: Date
});

const Log = mongoose.models.Log || mongoose.model('Log', LogSchema);

async function readLogs() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not found in .env');

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const logs = await Log.find({
      timestamp: { $gte: new Date(Date.now() - 30 * 60 * 1000) } 
    }).sort({ timestamp: -1 }).limit(100);

    console.log(JSON.stringify(logs, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error reading logs:', err.message);
  }
}

readLogs();
