import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { AppError } from "../utils/AppError";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const uploadRoot = path.resolve(process.cwd(), "uploads");
const avatarUploadDir = path.join(uploadRoot, "avatars");

fs.mkdirSync(avatarUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, avatarUploadDir);
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${req.user?.sub ?? "avatar"}-${Date.now()}${extension}`);
  },
});

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new AppError("Avatar must be a JPG, PNG, or WEBP image.", 400, "INVALID_IMAGE_TYPE"));
      return;
    }

    callback(null, true);
  },
}).single("avatar");

export function toAvatarUrl(file: Express.Multer.File) {
  return `/uploads/avatars/${file.filename}`;
}
