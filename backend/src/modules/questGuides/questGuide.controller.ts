import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import * as questGuideService from "./questGuide.service";

const guideIdParams = z.object({ guideId: z.string().min(1) });
const guideSchema = z.object({
  title: z.string().min(2),
  topic: z.string().min(2),
  shortExplanation: z.string().min(5),
  exampleProblem: z.string().min(1),
  solutionSteps: z.array(z.string().min(1)).min(1),
  tips: z.array(z.string().min(1)).default([]),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  questId: z.string().optional(),
});

export const createQuestGuide = asyncHandler(async (req, res) => {
  const body = guideSchema.parse(req.body);
  const guide = await questGuideService.createQuestGuide(req.user!.sub, body);

  res.status(201).json({ success: true, data: { guide } });
});

export const getQuestGuides = asyncHandler(async (req, res) => {
  const guides = await questGuideService.getTeacherQuestGuides(req.user!.sub);

  res.status(200).json({ success: true, data: { guides } });
});

export const updateQuestGuide = asyncHandler(async (req, res) => {
  const { guideId } = guideIdParams.parse(req.params);
  const body = guideSchema.partial().parse(req.body);
  const guide = await questGuideService.updateQuestGuide(req.user!.sub, guideId, body);

  res.status(200).json({ success: true, data: { guide } });
});

export const deleteQuestGuide = asyncHandler(async (req, res) => {
  const { guideId } = guideIdParams.parse(req.params);
  await questGuideService.deleteQuestGuide(req.user!.sub, guideId);

  res.status(204).send();
});

export const getStudentQuestGuides = asyncHandler(async (req, res) => {
  const guides = await questGuideService.getStudentQuestGuides(req.user!.sub);

  res.status(200).json({ success: true, data: { guides } });
});

export const markGuideViewed = asyncHandler(async (req, res) => {
  const { guideId } = guideIdParams.parse(req.params);
  const guide = await questGuideService.markGuideViewed(req.user!.sub, guideId);

  res.status(200).json({ success: true, data: { guideViewed: true, guide } });
});
