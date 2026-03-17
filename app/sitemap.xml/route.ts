import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";
import { config } from "@/lib/config";

export async function GET() {
  await connectDB();

  const posts = await Post.find({ status: "published" })
    .select("slug updatedAt")
    .lean();
  const categories = await Category.find().select("slug").lean();

  const baseUrl = config.siteUrl;

  const staticPages = [
    "",
    "/about",
    "/contact",
    "/subscribe",
    "/latest",
    "/advertise",
    "/careers",
    "/press",
    "/privacy",
    "/terms",
    "/cookie-policy",
    "/dmca",
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map((page) => {
      return `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>${page === "" ? "1.0" : "0.8"}</priority>
  </url>`;
    })
    .join("")}
  ${posts
    .map((post: any) => {
      return `
  <url>
    <loc>${baseUrl}/article/${post.slug}</loc>
    <lastmod>${new Date(post.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join("")}
  ${categories
    .map((category: any) => {
      return `
  <url>
    <loc>${baseUrl}/category/${category.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    })
    .join("")}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
