import mongoose, { Document, Model, Schema } from "mongoose";

export interface IComment extends Document {
  post: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId;
  content: string;
  isApproved: boolean;
  isSpam: boolean;
  likeCount: number;
  replies: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    parentComment: { type: Schema.Types.ObjectId, ref: "Comment" },
    content: { type: String, required: true, maxlength: 2000 },
    isApproved: { type: Boolean, default: false },
    isSpam: { type: Boolean, default: false },
    likeCount: { type: Number, default: 0 },
    replies: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

const Comment: Model<IComment> =
  mongoose.models.Comment ||
  mongoose.model<IComment>("Comment", CommentSchema);
export default Comment;
