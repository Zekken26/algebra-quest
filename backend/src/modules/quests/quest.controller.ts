import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import * as questService from "./quest.service";

const questIdParams = z.object({ questId: z.string().min(1) });
const questionSchema = z.object({
  equation: z.string().min(1),
  choices: z.array(z.string().min(1)).length(4),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(1).default("Review the solution steps for the reasoning."),
  solutionSteps: z.array(z.string().min(1)).min(1),
  difficulty: z.string().min(1).optional(),
}).superRefine((value, ctx) => {
  const normalizedChoices = value.choices.map((choice) => choice.trim().toLowerCase());
  if (!normalizedChoices.includes(value.correctAnswer.trim().toLowerCase())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["correctAnswer"],
      message: "correctAnswer must match one of the choices.",
    });
  }
});
const questSchema = z.object({
  title: z.string().min(2),
  worldName: z.string().min(2),
  topic: z.string().min(2),
  difficulty: z.string().min(1),
  requiredPuzzlePieces: z.number().int().positive(),
  maxHearts: z.number().int().positive().default(3),
  hintLimit: z.number().int().nonnegative().default(3),
  xpReward: z.number().int().nonnegative().default(100),
  coinReward: z.number().int().nonnegative().default(50),
  levelNumber: z.number().int().positive(),
  isPublished: z.boolean().default(false),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  guideId: z.string().optional(),
  questions: z.array(questionSchema).default([]),
});

export const createQuest = asyncHandler(async (req, res) => {
  const body = questSchema.parse(req.body);
  const quest = await questService.createQuest(req.user!.sub, body);

  res.status(201).json({ success: true, data: { quest } });
});

export const getQuests = asyncHandler(async (req, res) => {
  const quests = await questService.getTeacherQuests(req.user!.sub);

  res.status(200).json({ success: true, data: { quests } });
});

export const getQuest = asyncHandler(async (req, res) => {
  const { questId } = questIdParams.parse(req.params);
  const quest = await questService.getTeacherQuest(req.user!.sub, questId);

  res.status(200).json({ success: true, data: { quest } });
});

export const updateQuest = asyncHandler(async (req, res) => {
  const { questId } = questIdParams.parse(req.params);
  const body = questSchema.partial().parse(req.body);
  const quest = await questService.updateQuest(req.user!.sub, questId, body);

  res.status(200).json({ success: true, data: { quest } });
});

export const deleteQuest = asyncHandler(async (req, res) => {
  const { questId } = questIdParams.parse(req.params);
  await questService.deleteQuest(req.user!.sub, questId);

  res.status(204).send();
});

export const getStudentQuests = asyncHandler(async (req, res) => {
  const quests = await questService.getStudentQuests(req.user!.sub);

  res.status(200).json({ success: true, data: { quests } });
});

export const getStudentQuest = asyncHandler(async (req, res) => {
  const { questId } = questIdParams.parse(req.params);
  const quest = await questService.getStudentQuest(req.user!.sub, questId);

  res.status(200).json({ success: true, data: { quest } });
});
