import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAnalytics extends Document {
  date: Date;
  pageViews: number;
  uniqueVisitors: number;
  postViews: Record<string, number>;
  topPosts: { postId: string; views: number }[];
  trafficSources: Record<string, number>;
  deviceTypes: Record<string, number>;
  countries: Record<string, number>;
  newUsers: number;
  bounceRate: number;
  avgSessionDuration: number;
  createdAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    date: { type: Date, required: true, unique: true },
    pageViews: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    postViews: { type: Map, of: Number, default: {} },
    topPosts: [{ postId: String, views: Number }],
    trafficSources: { type: Map, of: Number, default: {} },
    deviceTypes: { type: Map, of: Number, default: {} },
    countries: { type: Map, of: Number, default: {} },
    newUsers: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 },
    avgSessionDuration: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Analytics: Model<IAnalytics> =
  mongoose.models.Analytics ||
  mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);
export default Analytics;
