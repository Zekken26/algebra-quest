import type { Response } from "express";
import { z } from "zod";
import { toAvatarUrl } from "../../middleware/upload.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import * as userService from "./user.service";

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().toLowerCase().optional(),
  removeAvatar: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((value) => value === true || value === "true"),
});
const sectionIdParams = z.object({ sectionId: z.string().min(1) });
const classIdParams = z.object({ classId: z.string().min(1) });
const classQuestIdParams = z.object({ classId: z.string().min(1), questId: z.string().min(1) });
const joinSectionSchema = z.object({
  sectionCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{4,12}$/)
    .transform((value) => value.toUpperCase()),
});
const joinClassSchema = z.object({
  classCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{4,12}$/)
    .transform((value) => value.toUpperCase()),
});

export const getStudentDashboard = asyncHandler(async (req, res: Response) => {
  const dashboard = await userService.getStudentDashboard(req.user!.sub);

  res.status(200).json({ success: true, data: dashboard });
});

export const updateStudentProfile = asyncHandler(async (req, res: Response) => {
  const body = updateProfileSchema.parse(req.body);
  const avatarUrl = req.file ? toAvatarUrl(req.file) : body.removeAvatar ? null : undefined;
  const user = await userService.updateStudentProfile(req.user!.sub, {
    name: body.name,
    email: body.email,
    avatarUrl,
  });

  res.status(200).json({ success: true, data: { user } });
});

export const getStudentSections = asyncHandler(async (req, res: Response) => {
  const sections = await userService.getStudentSections(req.user!.sub);

  res.status(200).json({ success: true, data: { sections } });
});

export const getStudentClasses = asyncHandler(async (req, res: Response) => {
  const classes = await userService.getStudentSections(req.user!.sub);

  res.status(200).json({ success: true, data: { classes, sections: classes } });
});

export const getStudentEnrollmentStatus = asyncHandler(async (req, res: Response) => {
  const enrollment = await userService.getStudentEnrollmentStatus(req.user!.sub);

  res.status(200).json({ success: true, data: { enrollment } });
});

export const joinSection = asyncHandler(async (req, res: Response) => {
  const body = joinSectionSchema.parse(req.body);
  const section = await userService.joinSectionByCode(req.user!.sub, body.sectionCode);

  res.status(201).json({ success: true, data: { section } });
});

export const joinClass = asyncHandler(async (req, res: Response) => {
  const body = joinClassSchema.parse(req.body);
  const section = await userService.joinSectionByCode(req.user!.sub, body.classCode);

  res.status(201).json({ success: true, data: { class: section, section } });
});

export const getStudentSection = asyncHandler(async (req, res: Response) => {
  const { sectionId } = sectionIdParams.parse(req.params);
  const section = await userService.getStudentSection(req.user!.sub, sectionId);

  res.status(200).json({ success: true, data: { section } });
});

export const getStudentClass = asyncHandler(async (req, res: Response) => {
  const { classId } = classIdParams.parse(req.params);
  const section = await userService.getStudentSection(req.user!.sub, classId);

  res.status(200).json({ success: true, data: { class: section, section } });
});

export const getStudentSectionQuestGuides = asyncHandler(async (req, res: Response) => {
  const { sectionId } = sectionIdParams.parse(req.params);
  const guides = await userService.getStudentSectionQuestGuides(req.user!.sub, sectionId);

  res.status(200).json({ success: true, data: { guides } });
});

export const getStudentClassQuestGuides = asyncHandler(async (req, res: Response) => {
  const { classId } = classIdParams.parse(req.params);
  const guides = await userService.getStudentSectionQuestGuides(req.user!.sub, classId);

  res.status(200).json({ success: true, data: { guides } });
});

export const getStudentSectionQuests = asyncHandler(async (req, res: Response) => {
  const { sectionId } = sectionIdParams.parse(req.params);
  const quests = await userService.getStudentSectionQuests(req.user!.sub, sectionId);

  res.status(200).json({ success: true, data: { quests } });
});

export const getStudentClassQuests = asyncHandler(async (req, res: Response) => {
  const { classId } = classIdParams.parse(req.params);
  const quests = await userService.getStudentSectionQuests(req.user!.sub, classId);

  res.status(200).json({ success: true, data: { quests } });
});

export const getStudentClassQuest = asyncHandler(async (req, res: Response) => {
  const { classId, questId } = classQuestIdParams.parse(req.params);
  const quest = await userService.getStudentSectionQuest(req.user!.sub, classId, questId);

  res.status(200).json({ success: true, data: { quest } });
});

export const getStudentSectionProgress = asyncHandler(async (req, res: Response) => {
  const { sectionId } = sectionIdParams.parse(req.params);
  const progress = await userService.getStudentSectionProgress(req.user!.sub, sectionId);

  res.status(200).json({ success: true, data: { progress } });
});

export const getStudentClassProgress = asyncHandler(async (req, res: Response) => {
  const { classId } = classIdParams.parse(req.params);
  const progress = await userService.getStudentSectionProgress(req.user!.sub, classId);

  res.status(200).json({ success: true, data: { progress } });
});

export const getStudentClassLeaderboard = asyncHandler(async (req, res: Response) => {
  const { classId } = classIdParams.parse(req.params);
  const leaderboard = await userService.getStudentSectionLeaderboard(req.user!.sub, classId);

  res.status(200).json({ success: true, data: leaderboard });
});
