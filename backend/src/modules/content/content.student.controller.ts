import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/AppError";
import * as contentStudentService from "./content.student.service";

const sectionIdParams = z.object({ sectionId: z.string().trim().min(1), classId: z.string().trim().min(1) });
const contentParams = z.object({ contentId: z.string().trim().min(1) });
const answerBody = z.object({
  questionId: z.string().trim().min(1),
  selectedAnswer: z.string().trim().min(1),
});
const contentQuery = z.object({ type: z.enum(["ASSIGNMENT", "PRETEST", "ASSESSMENT"]).optional() });

export const getStudentContent = asyncHandler(async (req, res) => {
  const params = sectionIdParams.parse({ ...req.params, ...req.query });
  const query = contentQuery.parse(req.query);
  const sectionId = params.sectionId || params.classId;
  const content = await contentStudentService.getStudentContent(req.user!.sub, sectionId, query.type);

  res.status(200).json({ success: true, data: { content } });
});

export const getStudentContentDetail = asyncHandler(async (req, res) => {
  const { contentId } = contentParams.parse(req.params);
  const content = await contentStudentService.getStudentContentDetail(req.user!.sub, contentId);

  res.status(200).json({ success: true, data: { content } });
});

export const startStudentContent = asyncHandler(async (req, res) => {
  const { contentId } = contentParams.parse(req.params);
  const attempt = await contentStudentService.startContentAttempt(req.user!.sub, contentId);

  res.status(200).json({ success: true, data: { attempt } });
});

export const answerStudentContent = asyncHandler(async (req, res) => {
  const { contentId } = contentParams.parse(req.params);
  const body = answerBody.parse(req.body);
  const result = await contentStudentService.answerContentQuestion(req.user!.sub, contentId, body.questionId, body.selectedAnswer);

  res.status(200).json({ success: true, data: result });
});

export const submitStudentContent = asyncHandler(async (req, res) => {
  const { contentId } = contentParams.parse(req.params);
  const result = await contentStudentService.submitContentAttempt(req.user!.sub, contentId);

  res.status(200).json({ success: true, data: result });
});

export const getStudentContentAttempts = asyncHandler(async (req, res) => {
  const { contentId } = contentParams.parse(req.params);
  const attempts = await contentStudentService.getStudentContentAttempts(req.user!.sub, contentId);

  res.status(200).json({ success: true, data: { attempts } });
});
