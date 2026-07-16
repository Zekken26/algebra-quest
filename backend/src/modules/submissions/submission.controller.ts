import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import * as submissionService from "./submission.service";

export const getContentSubmissions = asyncHandler(async (req, res) => {
  const { contentId } = z.object({ contentId: z.string().min(1) }).parse(req.params);
  const submissions = await submissionService.getContentSubmissions(req.user!.sub, contentId);
  res.status(200).json({ success: true, data: { submissions } });
});

export const getSectionSubmissions = asyncHandler(async (req, res) => {
  const { sectionId } = z.object({ sectionId: z.string().min(1) }).parse(req.params);
  const query = z.object({ status: z.string().optional() }).parse(req.query);
  const submissions = await submissionService.getSectionSubmissions(req.user!.sub, sectionId, query.status);
  res.status(200).json({ success: true, data: { submissions } });
});

export const getSubmissionDetail = asyncHandler(async (req, res) => {
  const { submissionId } = z.object({ submissionId: z.string().min(1) }).parse(req.params);
  const submission = await submissionService.getSubmissionDetail(req.user!.sub, submissionId);
  res.status(200).json({ success: true, data: { submission } });
});

export const gradeSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = z.object({ submissionId: z.string().min(1) }).parse(req.params);
  const body = z
    .object({
      score: z.number().finite().nonnegative(),
      maxScore: z.number().finite().nonnegative().nullable().optional(),
      teacherFeedback: z.string().max(5000).nullable().optional(),
      status: z.string().optional(),
    })
    .parse(req.body);
  const submission = await submissionService.gradeSubmission(req.user!.sub, submissionId, body);
  res.status(200).json({ success: true, data: { submission } });
});
