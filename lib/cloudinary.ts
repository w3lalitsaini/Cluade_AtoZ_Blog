import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(
  file: string,
  folder = "atozblog"
): Promise<{ url: string; publicId: string; width: number; height: number }> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export async function getMediaLibrary(
  folder = "atozblog",
  maxResults = 50
): Promise<unknown[]> {
  const result = await cloudinary.api.resources({
    type: "upload",
    prefix: folder,
    max_results: maxResults,
    resource_type: "image",
  });
  return result.resources;
}

export default cloudinary;
