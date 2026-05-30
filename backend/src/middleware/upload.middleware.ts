import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import multer from "multer";
import { AppError } from "../utils/AppError";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new AppError("Avatar must be a JPG, PNG, or WEBP image.", 400, "INVALID_IMAGE_TYPE"));
      return;
    }

    callback(null, true);
  },
}).single("avatar");

function assertCloudinaryConfigured() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new AppError("Cloudinary is not configured for image uploads.", 500, "CLOUDINARY_NOT_CONFIGURED");
  }
}

function uploadBuffer(buffer: Buffer, publicId: string): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "algebra-quest/avatars",
        public_id: publicId,
        resource_type: "image",
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }

        resolve(result);
      },
    );

    stream.end(buffer);
  });
}

export async function toAvatarUrl(file: Express.Multer.File, userId?: string) {
  assertCloudinaryConfigured();

  const publicId = `${userId ?? "avatar"}-${Date.now()}`;
  const result = await uploadBuffer(file.buffer, publicId);

  return result.secure_url;
}
