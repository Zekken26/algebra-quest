import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import * as progressService from "./progress.service";

const questIdParams = z.object({ questId: z.string().min(1) });
const classIdParams = z.object({ classId: z.string().min(1) });
const classQuestIdParams = z.object({ classId: z.string().min(1), questId: z.string().min(1) });
const answerSchema = z.object({ questionId: z.string().min(1), selectedAnswer: z.string().min(1) });
const hintSchema = z.object({ questionId: z.string().min(1) });
const completeSchema = z.object({ timeSpent: z.number().int().nonnegative().optional() });

export const startQuest = asyncHandler(async (req, res) => {
  const { questId } = questIdParams.parse(req.params);
  const progress = await progressService.startQuest(req.user!.sub, questId);

  res.status(200).json({ success: true, data: { progress } });
});

export const answerQuestion = asyncHandler(async (req, res) => {
  const { questId } = questIdParams.parse(req.params);
  const body = answerSchema.parse(req.body);
  const data = await progressService.answerQuestion(req.user!.sub, questId, body);

  res.status(200).json({ success: true, data });
});

export const useHint = asyncHandler(async (req, res) => {
  const { questId } = questIdParams.parse(req.params);
  const body = hintSchema.parse(req.body);
  const data = await progressService.useHint(req.user!.sub, questId, body);

  res.status(200).json({ success: true, data });
});

export const completeQuest = asyncHandler(async (req, res) => {
  const { questId } = questIdParams.parse(req.params);
  const body = completeSchema.parse(req.body);
  const progress = await progressService.completeQuest(req.user!.sub, questId, body);

  res.status(200).json({ success: true, data: { progress } });
});

export const startClassQuest = asyncHandler(async (req, res) => {
  const { classId, questId } = classQuestIdParams.parse(req.params);
  const progress = await progressService.startQuest(req.user!.sub, questId, classId);

  res.status(200).json({ success: true, data: { progress } });
});

export const answerClassQuestQuestion = asyncHandler(async (req, res) => {
  const { classId, questId } = classQuestIdParams.parse(req.params);
  const body = answerSchema.parse(req.body);
  const data = await progressService.answerQuestion(req.user!.sub, questId, body, classId);

  res.status(200).json({ success: true, data });
});

export const useClassQuestHint = asyncHandler(async (req, res) => {
  const { classId, questId } = classQuestIdParams.parse(req.params);
  const body = hintSchema.parse(req.body);
  const data = await progressService.useHint(req.user!.sub, questId, body, classId);

  res.status(200).json({ success: true, data });
});

export const completeClassQuest = asyncHandler(async (req, res) => {
  const { classId, questId } = classQuestIdParams.parse(req.params);
  const body = completeSchema.parse(req.body);
  const progress = await progressService.completeQuest(req.user!.sub, questId, body, classId);

  res.status(200).json({ success: true, data: { progress } });
});

export const getClassProgress = asyncHandler(async (req, res) => {
  const { classId } = classIdParams.parse(req.params);
  const progress = await progressService.getClassProgress(req.user!.sub, classId);

  res.status(200).json({ success: true, data: { progress } });
});
