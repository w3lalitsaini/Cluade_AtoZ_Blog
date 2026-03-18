import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILog extends Document {
  level: 'info' | 'error' | 'warn' | 'debug';
  message: string;
  source: string; // e.g., 'AgentBlogAPI', 'ResearchAgent', 'AutoBlogEngine'
  metadata?: any;
  timestamp: Date;
}

const LogSchema = new Schema<ILog>({
  level: { 
    type: String, 
    enum: ['info', 'error', 'warn', 'debug'], 
    default: 'info',
    index: true 
  },
  message: { type: String, required: true },
  source: { type: String, required: true, index: true },
  metadata: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now, index: true }
}, { expires: '30d' }); // Auto-delete logs after 30 days

const Log: Model<ILog> = mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema);

export default Log;
