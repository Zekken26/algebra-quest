import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import * as assignmentController from "./assignment.controller";

export const assignmentRouter = Router();
export const studentAssignmentRouter = Router();

assignmentRouter.use(requireAuth, requireRole("TEACHER"));

assignmentRouter.post("/", assignmentController.createAssignment);
assignmentRouter.get("/", assignmentController.getAssignments);
assignmentRouter.get("/:assignmentId", assignmentController.getAssignmentDetail);
assignmentRouter.put("/:assignmentId", assignmentController.updateAssignment);
assignmentRouter.delete("/:assignmentId", assignmentController.deleteAssignment);
assignmentRouter.post("/:assignmentId/toggle-publish", assignmentController.togglePublishAssignment);
assignmentRouter.post("/:assignmentId/duplicate", assignmentController.duplicateAssignment);
