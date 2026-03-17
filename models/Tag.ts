import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITag extends Document {
  name: string;
  slug: string;
  description?: string;
  postCount: number;
  createdAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: String,
    postCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Tag: Model<ITag> =
  mongoose.models.Tag || mongoose.model<ITag>("Tag", TagSchema);
export default Tag;
