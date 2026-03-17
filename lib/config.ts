export const config = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || "AtoZ Blogs",
  siteDescription:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "Your trusted source for news and insights",
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  socialLinks: {
    twitter:
      process.env.NEXT_PUBLIC_TWITTER_URL || "https://twitter.com/atozblog",
    facebook:
      process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://facebook.com/atozblog",
    instagram:
      process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/atozblog",
    youtube:
      process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://youtube.com/atozblog",
    linkedin:
      process.env.NEXT_PUBLIC_LINKEDIN_URL ||
      "https://linkedin.com/company/atozblog",
  },
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@atozblog.com",
    address:
      process.env.NEXT_PUBLIC_CONTACT_ADDRESS ||
      "123 News St, Story City, SC 12345",
  },
};
