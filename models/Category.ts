import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  color?: string;
  parent?: mongoose.Types.ObjectId;
  postCount: number;
  isActive: boolean;
  seo: { metaTitle?: string; metaDescription?: string };
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    image: { type: String },
    color: { type: String, default: "#ef4444" },
    parent: { type: Schema.Types.ObjectId, ref: "Category" },
    postCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    seo: { metaTitle: String, metaDescription: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
