import { v2 as cloudinary } from "cloudinary";
import { logInfo, logWarn, logError } from "./logger";
import connectDB from "../db";
import { Media } from "../../models/index";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MODEL = "stabilityai/stable-diffusion-xl-base-1.0";
const HF_URL = `https://router.huggingface.co/hf-inference/models/${MODEL}`;

/**
 * AI Image Generation Service (Production Ready)
 * Generates with SDXL -> Uploads to Cloudinary -> Records in DB -> Returns CDN URL
 */
export async function generateAIImage(keyword, userId = null) {
  const hfToken = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;

  if (hfToken) {
    try {
      await logInfo("ImageService", `[IMAGE] Generating: ${keyword}`);

      const response = await fetch(HF_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `High quality professional blog cover image about ${keyword}, cinematic, award winning photography, 4k, ultra realistic`,
        }),
      });

      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");

        // Upload to Cloudinary for permanent storage & optimization
        const uploadResult = await cloudinary.uploader.upload(
          `data:image/png;base64,${base64}`,
          {
            folder: "ai-blogs",
            public_id: `blog-${Date.now()}`,
            transformation: [
              { width: 1200, crop: "limit" },
              { quality: "auto" },
              { fetch_format: "auto" }, // Auto WebP
            ],
          },
        );

        await logInfo(
          "ImageService",
          `[IMAGE] Cloudinary Success: ${uploadResult.secure_url}`,
        );

        // Record in Database if userId is provided (system-wide visibility)
        if (userId) {
          try {
            await connectDB();
            await Media.create({
              publicId: uploadResult.public_id,
              url: uploadResult.url,
              secureUrl: uploadResult.secure_url,
              originalFilename: `${keyword.replace(/\s+/g, '-').toLowerCase()}.png`,
              format: uploadResult.format,
              width: uploadResult.width,
              height: uploadResult.height,
              size: uploadResult.bytes,
              resourceType: uploadResult.resource_type,
              folder: "ai-blogs",
              uploadedBy: userId,
              alt: `AI generated image for ${keyword}`,
            });
          } catch (dbErr) {
            await logError("ImageService", `Failed to record media in DB: ${dbErr.message}`);
          }
        }

        return {
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
        };
      } else {
        await logWarn(
          "ImageService",
          `HF failed (${response.status}). Trying Pexels.`,
        );
      }
    } catch (err) {
      await logWarn(
        "ImageService",
        `HF/Cloudinary error: ${err.message}. Trying Pexels.`,
      );
    }
  }

  // Fallback to Pexels
  const fallbackUrl = await getFallbackImage(keyword);
  return { url: fallbackUrl, public_id: "" };
}

/**
 * Pexels API Fallback
 */
async function getFallbackImage(keyword) {
  const pexelsKey = process.env.PEXELS_API_KEY;
  if (!pexelsKey) return "";

  try {
    await logInfo("ImageService", `[IMAGE] Fetching from Pexels: ${keyword}`);
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=1`,
      {
        headers: { Authorization: pexelsKey },
      },
    );

    if (response.ok) {
      const data = await response.json();
      if (data.photos?.length > 0) {
        await logInfo("ImageService", "[IMAGE] Success via Pexels");
        return data.photos[0].src.medium;
      }
    }
  } catch (err) {
    await logError(
      "ImageService",
      `[IMAGE] All fallbacks failed: ${err.message}`,
    );
  }

  return "";
}
