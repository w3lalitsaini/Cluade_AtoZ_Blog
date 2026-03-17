import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  color: string;
  parentCategory?: mongoose.Types.ObjectId;
  order: number;
  isActive: boolean;
  postCount: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    image: { type: String },
    color: { type: String, default: "#f97316" },
    parentCategory: { type: Schema.Types.ObjectId, ref: "Category" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    postCount: { type: Number, default: 0 },
    metaTitle: String,
    metaDescription: String,
  },
  { timestamps: true }
);

const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);
export default Category;
