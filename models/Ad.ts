import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAd extends Document {
  title: string;
  type: "image" | "script" | "html";
  content: string; // Image URL, Script, or HTML
  link?: string;
  position: "sidebar" | "header" | "footer" | "in-post";
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  clicks: number;
  impressions: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdSchema = new Schema<IAd>(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ["image", "script", "html"], default: "image" },
    content: { type: String, required: true },
    link: String,
    position: {
      type: String,
      enum: ["sidebar", "header", "footer", "in-post"],
      default: "sidebar",
    },
    isActive: { type: Boolean, default: true },
    startDate: Date,
    endDate: Date,
    clicks: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Ad: Model<IAd> =
  mongoose.models.Ad || mongoose.model<IAd>("Ad", AdSchema);
export default Ad;
