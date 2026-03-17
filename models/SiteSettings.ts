import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISiteSettings extends Document {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logo?: string;
  favicon?: string;
  themeColor: string;
  darkThemeColor: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  googleAnalyticsId?: string;
  adsenseClientId?: string;
  socialLinks: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
  emailSettings: {
    host: string;
    port: number;
    user: string;
    from: string;
  };
  headerScripts?: string;
  footerScripts?: string;
  maintenanceMode: boolean;
  allowComments: boolean;
  moderateComments: boolean;
  postsPerPage: number;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    siteName: { type: String, default: "AtoZ Blogs" },
    siteDescription: {
      type: String,
      default: "Your trusted source for news and insights",
    },
    siteUrl: { type: String, default: "https://atozblog.com" },
    logo: String,
    favicon: String,
    themeColor: { type: String, default: "#f97316" },
    darkThemeColor: { type: String, default: "#ea580c" },
    defaultMetaTitle: { type: String, default: "AtoZ Blogs" },
    defaultMetaDescription: { type: String, default: "" },
    googleAnalyticsId: String,
    adsenseClientId: String,
    socialLinks: {
      twitter: String,
      facebook: String,
      instagram: String,
      youtube: String,
      linkedin: String,
    },
    emailSettings: {
      host: { type: String, default: "" },
      port: { type: Number, default: 587 },
      user: { type: String, default: "" },
      from: { type: String, default: "" },
    },
    headerScripts: String,
    footerScripts: String,
    maintenanceMode: { type: Boolean, default: false },
    allowComments: { type: Boolean, default: true },
    moderateComments: { type: Boolean, default: true },
    postsPerPage: { type: Number, default: 12 },
  },
  { timestamps: true }
);

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);
export default SiteSettings;
