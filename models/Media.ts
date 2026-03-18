import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMedia extends Document {
  publicId: string;
  url: string;
  secureUrl: string;
  originalFilename: string;
  format: string;
  width?: number;
  height?: number;
  size: number;
  resourceType: string;
  folder?: string;
  uploadedBy: mongoose.Types.ObjectId;
  alt?: string;
  caption?: string;
  tags: string[];
  createdAt: Date;
}

const MediaSchema = new Schema<IMedia>({
  publicId: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  secureUrl: { type: String, required: true },
  originalFilename: { type: String },
  format: { type: String },
  width: { type: Number },
  height: { type: Number },
  size: { type: Number },
  resourceType: { type: String, default: "image" },
  folder: { type: String },
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  alt: { type: String },
  caption: { type: String },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
});

export const Media: Model<IMedia> =
  mongoose.models.Media || mongoose.model<IMedia>("Media", MediaSchema);

export default Media;
