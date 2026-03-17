import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  bio?: string;
  role: "admin" | "editor" | "author" | "user";
  isVerified: boolean;
  isActive: boolean;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  savedPosts: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  verifyToken?: string;
  notifications?: {
    comments: boolean;
    newsletter: boolean;
    updates: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, select: false },
    image: { type: String },
    bio: { type: String, maxlength: 500 },
    role: {
      type: String,
      enum: ["admin", "editor", "author", "user"],
      default: "user",
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    socialLinks: {
      twitter: String,
      linkedin: String,
      website: String,
    },
    savedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    resetToken: { type: String, select: false },
    resetTokenExpiry: { type: Date, select: false },
    verifyToken: { type: String, select: false },
    notifications: {
      comments: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: true },
      updates: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
