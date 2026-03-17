import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISubscriber extends Document {
  email: string;
  name?: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  source?: string;
  tags?: string[];
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: String,
    isActive: { type: Boolean, default: true },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: Date,
    source: String,
    tags: [String],
  },
  { timestamps: true }
);

const Subscriber: Model<ISubscriber> =
  mongoose.models.Subscriber ||
  mongoose.model<ISubscriber>("Subscriber", SubscriberSchema);
export default Subscriber;
