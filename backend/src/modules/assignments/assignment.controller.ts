import { asyncHandler } from "../../utils/asyncHandler";
import * as assignmentService from "./assignment.service";
import {
  assignmentIdParamsSchema,
  createAssignmentSchema,
  updateAssignmentSchema,
  assignmentQuerySchema,
} from "./assignment.validation";

function assignmentFieldErrors(issues: Array<{ path: PropertyKey[]; message: string }>) {
  return Object.fromEntries(
    issues.map((issue) => [issue.path.join("."), issue.message]),
  );
}

export const createAssignment = asyncHandler(async (req, res) => {
  const parsed = createAssignmentSchema.safeParse(req.body);
  if (!parsed.success) {
    const fieldErrors = assignmentFieldErrors(parsed.error.issues);
    console.info("assignment.create.validation_failed", {
      userId: req.user?.sub,
      fields: Object.keys(fieldErrors),
    });
    res.status(400).json({
      success: false,
      code: "ASSIGNMENT_VALIDATION_ERROR",
      message: "The assignment could not be created.",
      fieldErrors,
      error: { code: "ASSIGNMENT_VALIDATION_ERROR", message: "The assignment could not be created.", fieldErrors },
    });
    return;
  }

  const body = parsed.data;
  const assignment = await assignmentService.createAssignment(req.user!.sub, body);

  res.status(201).json({ success: true, data: { assignment } });
});

export const getAssignments = asyncHandler(async (req, res) => {
  const query = assignmentQuerySchema.parse(req.query);
  const assignments = await assignmentService.getAssignments(req.user!.sub, query.sectionId);

  res.status(200).json({ success: true, data: { assignments } });
});

export const getAssignmentDetail = asyncHandler(async (req, res) => {
  const { assignmentId } = assignmentIdParamsSchema.parse(req.params);
  const assignment = await assignmentService.getAssignmentDetail(req.user!.sub, assignmentId);

  res.status(200).json({ success: true, data: { assignment } });
});

export const updateAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = assignmentIdParamsSchema.parse(req.params);
  const body = updateAssignmentSchema.parse(req.body);
  const assignment = await assignmentService.updateAssignment(req.user!.sub, assignmentId, body);

  res.status(200).json({ success: true, data: { assignment } });
});

export const deleteAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = assignmentIdParamsSchema.parse(req.params);
  await assignmentService.deleteAssignment(req.user!.sub, assignmentId);

  res.status(204).send();
});

export const togglePublishAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = assignmentIdParamsSchema.parse(req.params);
  const assignment = await assignmentService.togglePublishAssignment(req.user!.sub, assignmentId);

  res.status(200).json({ success: true, data: { assignment } });
});

export const duplicateAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = assignmentIdParamsSchema.parse(req.params);
  const assignment = await assignmentService.duplicateAssignment(req.user!.sub, assignmentId);

  res.status(201).json({ success: true, data: { assignment } });
});
