import { z } from "zod";
import { toAvatarUrl } from "../../middleware/upload.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/AppError";
import * as teacherProfileService from "./teacherProfile.service";

const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    email: z.string().trim().email().toLowerCase().optional(),
  })
  .refine((value) => value.name || value.email, {
    message: "At least one profile field is required.",
  });

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128),
    confirmNewPassword: z.string().min(8).max(128),
  })
  .refine((value) => value.newPassword === value.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "New password and confirmation do not match.",
  });

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await teacherProfileService.getTeacherProfile(req.user!.sub);

  res.status(200).json({ success: true, data: { profile } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const body = updateProfileSchema.parse(req.body);
  const profile = await teacherProfileService.updateTeacherProfile(req.user!.sub, body);

  res.status(200).json({ success: true, data: { profile } });
});

export const changePassword = asyncHandler(async (req, res) => {
  const body = changePasswordSchema.parse(req.body);
  await teacherProfileService.changeTeacherPassword(req.user!.sub, {
    currentPassword: body.currentPassword,
    newPassword: body.newPassword,
  });

  res.status(200).json({ success: true, data: { passwordChanged: true } });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Avatar image is required.", 400, "AVATAR_REQUIRED");
  }

  const avatarUrl = await toAvatarUrl(req.file, req.user!.sub);
  const profile = await teacherProfileService.updateTeacherAvatar(req.user!.sub, avatarUrl);

  res.status(200).json({ success: true, data: { profile } });
});
