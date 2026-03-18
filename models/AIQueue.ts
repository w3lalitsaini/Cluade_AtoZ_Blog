import mongoose from "mongoose";

const AIQueueSchema = new mongoose.Schema(
  {
    keyword: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    error: {
      type: String,
    },
    lastAttempt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Prevent duplicate keywords in the queue
AIQueueSchema.index({ keyword: 1 }, { unique: true });

export default mongoose.models.AIQueue || mongoose.model("AIQueue", AIQueueSchema);
