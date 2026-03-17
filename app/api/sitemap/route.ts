import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import { CATEGORIES } from "@/lib/utils";

export async function GET() {
  try {
    await connectDB();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://atozblogs.com";

    const posts = await Post.find({ status: "published" })
      .select("slug updatedAt publishedAt")
      .sort("-publishedAt")
      .limit(1000)
      .lean();

    const staticPages = [
      { url: siteUrl, lastmod: new Date().toISOString(), priority: "1.0", changefreq: "daily" },
      { url: `${siteUrl}/news`, lastmod: new Date().toISOString(), priority: "0.9", changefreq: "hourly" },
      { url: `${siteUrl}/newsletter`, lastmod: new Date().toISOString(), priority: "0.7", changefreq: "monthly" },
    ];

    const categoryPages = CATEGORIES.map((cat) => ({
      url: `${siteUrl}/category/${cat.slug}`,
      lastmod: new Date().toISOString(),
      priority: "0.8",
      changefreq: "daily",
    }));

    const postPages = posts.map((post) => ({
      url: `${siteUrl}/article/${post.slug}`,
      lastmod: new Date(post.updatedAt || post.publishedAt || new Date()).toISOString(),
      priority: "0.7",
      changefreq: "weekly",
    }));

    const allPages = [...staticPages, ...categoryPages, ...postPages];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(({ url, lastmod, priority, changefreq }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join("\n")}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Sitemap generation failed" }, { status: 500 });
  }
}
