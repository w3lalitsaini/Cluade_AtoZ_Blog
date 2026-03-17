import mongoose, { Schema, Document, Model } from "mongoose";

// =================== CATEGORY ===================
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

// =================== TAG ===================
export interface ITag extends Document {
  name: string;
  slug: string;
  description?: string;
  postCount: number;
  createdAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    postCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Tag: Model<ITag> =
  mongoose.models.Tag || mongoose.model<ITag>("Tag", TagSchema);

// =================== COMMENT ===================
export interface IComment extends Document {
  post: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  parent?: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "spam" | "trash";
  likeCount: number;
  isEdited: boolean;
  editedAt?: Date;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 2000 },
    parent: { type: Schema.Types.ObjectId, ref: "Comment" },
    status: {
      type: String,
      enum: ["pending", "approved", "spam", "trash"],
      default: "pending",
    },
    likeCount: { type: Number, default: 0 },
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    ipAddress: { type: String, select: false },
  },
  { timestamps: true },
);

CommentSchema.index({ post: 1, status: 1 });
CommentSchema.index({ author: 1 });

export const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

// =================== AD ===================
export interface IAd extends Document {
  name: string;
  type: "adsense" | "custom" | "affiliate" | "sponsored";
  position:
    | "header"
    | "sidebar"
    | "in-article"
    | "footer"
    | "sticky-bottom"
    | "between-paragraphs";
  adCode: string;
  imageUrl?: string;
  linkUrl?: string;
  altText?: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  impressions: number;
  clicks: number;
  pages: string[];
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdSchema = new Schema<IAd>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["adsense", "custom", "affiliate", "sponsored"],
      required: true,
    },
    position: {
      type: String,
      enum: [
        "header",
        "sidebar",
        "in-article",
        "footer",
        "sticky-bottom",
        "between-paragraphs",
      ],
      required: true,
    },
    adCode: { type: String, required: true },
    imageUrl: { type: String },
    linkUrl: { type: String },
    altText: { type: String },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    pages: [{ type: String }],
    priority: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Ad: Model<IAd> =
  mongoose.models.Ad || mongoose.model<IAd>("Ad", AdSchema);

// =================== SUBSCRIBER ===================
export interface ISubscriber extends Document {
  email: string;
  name?: string;
  isActive: boolean;
  isVerified: boolean;
  verificationToken?: string;
  preferences: { categories: string[]; frequency: "daily" | "weekly" };
  subscribedAt: Date;
  unsubscribedAt?: Date;
  source?: string;
}

const SubscriberSchema = new Schema<ISubscriber>({
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, select: false },
  preferences: {
    categories: [String],
    frequency: { type: String, enum: ["daily", "weekly"], default: "weekly" },
  },
  subscribedAt: { type: Date, default: Date.now },
  unsubscribedAt: { type: Date },
  source: { type: String },
});

export const Subscriber: Model<ISubscriber> =
  mongoose.models.Subscriber ||
  mongoose.model<ISubscriber>("Subscriber", SubscriberSchema);

// =================== ANALYTICS ===================
export interface IAnalytics extends Document {
  date: Date;
  pageViews: number;
  uniqueVisitors: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPosts: { postId: mongoose.Types.ObjectId; views: number }[];
  trafficSources: { source: string; count: number }[];
  topCountries: { country: string; count: number }[];
  topDevices: { device: string; count: number }[];
  newUsers: number;
  adClicks: number;
  adImpressions: number;
  estimatedRevenue: number;
}

const AnalyticsSchema = new Schema<IAnalytics>({
  date: { type: Date, required: true, unique: true },
  pageViews: { type: Number, default: 0 },
  uniqueVisitors: { type: Number, default: 0 },
  sessions: { type: Number, default: 0 },
  bounceRate: { type: Number, default: 0 },
  avgSessionDuration: { type: Number, default: 0 },
  topPosts: [
    {
      postId: { type: Schema.Types.ObjectId, ref: "Post" },
      views: Number,
    },
  ],
  trafficSources: [{ source: String, count: Number }],
  topCountries: [{ country: String, count: Number }],
  topDevices: [{ device: String, count: Number }],
  newUsers: { type: Number, default: 0 },
  adClicks: { type: Number, default: 0 },
  adImpressions: { type: Number, default: 0 },
  estimatedRevenue: { type: Number, default: 0 },
});

export const Analytics: Model<IAnalytics> =
  mongoose.models.Analytics ||
  mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);

// =================== SITE SETTINGS ===================
export interface ISiteSettings extends Document {
  siteName: string;
  siteUrl: string;
  tagline?: string;
  description?: string;
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  adsensePublisherId?: string;
  headerAdCode?: string;
  footerAdCode?: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  emailFrom?: string;
  emailReplyTo?: string;
  socialLinks: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    tiktok?: string;
  };
  seoDefaults: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  moderateComments: boolean;
  postsPerPage: number;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>({
  siteName: { type: String, default: "AtoZ Blogs" },
  siteUrl: { type: String, default: "http://localhost:3000" },
  tagline: { type: String, default: "News & Stories That Matter" },
  description: { type: String },
  logo: { type: String },
  favicon: { type: String },
  primaryColor: { type: String, default: "#ef4444" },
  secondaryColor: { type: String, default: "#1f1f1f" },
  adsensePublisherId: { type: String },
  headerAdCode: { type: String },
  footerAdCode: { type: String },
  googleAnalyticsId: { type: String },
  facebookPixelId: { type: String },
  emailFrom: { type: String },
  emailReplyTo: { type: String },
  socialLinks: {
    twitter: String,
    facebook: String,
    instagram: String,
    youtube: String,
    linkedin: String,
    tiktok: String,
  },
  seoDefaults: {
    metaTitle: String,
    metaDescription: String,
    ogImage: String,
  },
  maintenanceMode: { type: Boolean, default: false },
  allowRegistration: { type: Boolean, default: true },
  requireEmailVerification: { type: Boolean, default: false },
  moderateComments: { type: Boolean, default: true },
  postsPerPage: { type: Number, default: 12 },
  updatedAt: { type: Date, default: Date.now },
});

export const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

// =================== MEDIA ===================
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

// =================== POST LIKE ===================
export interface IPostLike extends Document {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PostLikeSchema = new Schema<IPostLike>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  createdAt: { type: Date, default: Date.now },
});

PostLikeSchema.index({ user: 1, post: 1 }, { unique: true });

export const PostLike: Model<IPostLike> =
  mongoose.models.PostLike ||
  mongoose.model<IPostLike>("PostLike", PostLikeSchema);

// =================== FOLLOW ===================
export interface IFollow extends Document {
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FollowSchema = new Schema<IFollow>({
  follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
  following: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

export const Follow: Model<IFollow> =
  mongoose.models.Follow || mongoose.model<IFollow>("Follow", FollowSchema);

// =================== BOOKMARK ===================
export interface IBookmark extends Document {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  createdAt: { type: Date, default: Date.now },
});

BookmarkSchema.index({ user: 1, post: 1 }, { unique: true });

export const Bookmark: Model<IBookmark> =
  mongoose.models.Bookmark ||
  mongoose.model<IBookmark>("Bookmark", BookmarkSchema);
// =================== MESSAGE ===================
export interface IMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: "contact" | "advertising";
  status: "unread" | "read" | "replied";
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["contact", "advertising"],
      default: "contact",
    },
    status: {
      type: String,
      enum: ["unread", "read", "replied"],
      default: "unread",
    },
  },
  { timestamps: true },
);

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
