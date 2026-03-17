import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  author: mongoose.Types.ObjectId;
  coAuthors?: mongoose.Types.ObjectId[];
  category: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  status: "draft" | "pending" | "published" | "scheduled" | "archived";
  publishedAt?: Date;
  scheduledAt?: Date;
  isBreaking: boolean;
  isFeatured: boolean;
  isEditorsPick: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  bookmarkCount: number;
  readingTime: number;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    canonicalUrl?: string;
    noIndex: boolean;
    ogImage?: string;
    seoScore?: number;
    readabilityScore?: number;
  };
  jsonLd?: string;
  allowComments: boolean;
  sponsored: boolean;
  sponsoredBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true, maxlength: 300 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: { type: String, required: true, maxlength: 500 },
    content: { type: String, required: true },
    featuredImage: String,
    featuredImageAlt: String,
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    coAuthors: [{ type: Schema.Types.ObjectId, ref: "User" }],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    status: {
      type: String,
      enum: ["draft", "pending", "published", "scheduled", "archived"],
      default: "draft",
    },
    publishedAt: Date,
    scheduledAt: Date,
    isBreaking: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isEditorsPick: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    bookmarkCount: { type: Number, default: 0 },
    readingTime: { type: Number, default: 0 },
    seo: {
      metaTitle: String,
      metaDescription: String,
      focusKeyword: String,
      canonicalUrl: String,
      noIndex: { type: Boolean, default: false },
      ogImage: String,
      seoScore: Number,
      readabilityScore: Number,
    },
    jsonLd: String,
    allowComments: { type: Boolean, default: true },
    sponsored: { type: Boolean, default: false },
    sponsoredBy: String,
  },
  { timestamps: true },
);

PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ category: 1, status: 1 });
PostSchema.index({ author: 1, status: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ isBreaking: 1 });
PostSchema.index({ isFeatured: 1 });
PostSchema.index({ viewCount: -1 });

const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);
export default Post;
