import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUsedKeyword extends Document {
  keyword: string;
  slug: string;
  usedAt: Date;
  status: 'pending' | 'success' | 'failed';
  postId?: mongoose.Types.ObjectId;
}

const UsedKeywordSchema = new Schema<IUsedKeyword>({
  keyword: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true 
  },
  slug: { 
    type: String, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  usedAt: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed'], 
    default: 'pending' 
  },
  postId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Post' 
  }
}, { timestamps: true });

// Indexing for quick lookups - redundant unique indexes removed (defined in schema)
const UsedKeyword: Model<IUsedKeyword> = mongoose.models.UsedKeyword || mongoose.model<IUsedKeyword>('UsedKeyword', UsedKeywordSchema);

export default UsedKeyword;
