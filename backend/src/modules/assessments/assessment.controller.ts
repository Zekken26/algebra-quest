import { asyncHandler } from "../../utils/asyncHandler";
import * as assessmentService from "./assessment.service";
import {
  assessmentIdParamsSchema,
  createAssessmentSchema,
  updateAssessmentSchema,
  assessmentQuerySchema,
} from "./assessment.validation";

function fieldErrors(issues: Array<{ path: PropertyKey[]; message: string }>) {
  return Object.fromEntries(issues.map((issue) => [issue.path.join("."), issue.message]));
}

export const createAssessment = asyncHandler(async (req, res) => {
  const parsed = createAssessmentSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error.issues);
    console.info("assessment.create.validation_failed", { userId: req.user?.sub, fields: Object.keys(errors) });
    res.status(400).json({
      success: false,
      code: "ASSESSMENT_VALIDATION_ERROR",
      message: "The assessment could not be created.",
      fieldErrors: errors,
      error: { code: "ASSESSMENT_VALIDATION_ERROR", message: "The assessment could not be created.", fieldErrors: errors },
    });
    return;
  }
  const body = parsed.data;
  const assessment = await assessmentService.createAssessment(req.user!.sub, body);

  res.status(201).json({ success: true, data: { assessment } });
});

export const getAssessments = asyncHandler(async (req, res) => {
  const query = assessmentQuerySchema.parse(req.query);
  const assessments = await assessmentService.getAssessments(req.user!.sub, query.sectionId);

  res.status(200).json({ success: true, data: { assessments } });
});

export const getAssessmentDetail = asyncHandler(async (req, res) => {
  const { assessmentId } = assessmentIdParamsSchema.parse(req.params);
  const assessment = await assessmentService.getAssessmentDetail(req.user!.sub, assessmentId);

  res.status(200).json({ success: true, data: { assessment } });
});

export const updateAssessment = asyncHandler(async (req, res) => {
  const { assessmentId } = assessmentIdParamsSchema.parse(req.params);
  const body = updateAssessmentSchema.parse(req.body);
  const assessment = await assessmentService.updateAssessment(req.user!.sub, assessmentId, body);

  res.status(200).json({ success: true, data: { assessment } });
});

export const deleteAssessment = asyncHandler(async (req, res) => {
  const { assessmentId } = assessmentIdParamsSchema.parse(req.params);
  await assessmentService.deleteAssessment(req.user!.sub, assessmentId);

  res.status(204).send();
});

export const togglePublishAssessment = asyncHandler(async (req, res) => {
  const { assessmentId } = assessmentIdParamsSchema.parse(req.params);
  const assessment = await assessmentService.togglePublishAssessment(req.user!.sub, assessmentId);

  res.status(200).json({ success: true, data: { assessment } });
});
