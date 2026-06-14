import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import fs from "node:fs";
import path from "node:path";
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

export const uploadQuestImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new AppError("Quest asset must be a JPG, PNG, or WEBP image.", 400, "INVALID_IMAGE_TYPE"));
      return;
    }

    callback(null, true);
  },
}).single("image");

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

export async function toQuestImageUrl(file: Express.Multer.File, questId?: string) {
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    const publicId = `quest-${questId ?? "asset"}-${Date.now()}`;
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "algebra-quest/quests",
          public_id: publicId,
          resource_type: "image",
          overwrite: true,
        },
        (error, result) => {
          if (error || !result) reject(error ?? new Error("Cloudinary upload failed."));
          else resolve(result);
        },
      );
      stream.end(file.buffer);
    });
    return result.secure_url;
  }

  const uploadsDir = path.resolve(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const filename = `quest-${questId ?? "asset"}-${Date.now()}${path.extname(file.originalname)}`;
  fs.writeFileSync(path.join(uploadsDir, filename), file.buffer);
  return `/uploads/${filename}`;
}
