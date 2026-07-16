import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import * as assessmentController from "./assessment.controller";

export const assessmentRouter = Router();
export const studentAssessmentRouter = Router();

assessmentRouter.use(requireAuth, requireRole("TEACHER"));

assessmentRouter.post("/", assessmentController.createAssessment);
assessmentRouter.get("/", assessmentController.getAssessments);
assessmentRouter.get("/:assessmentId", assessmentController.getAssessmentDetail);
assessmentRouter.put("/:assessmentId", assessmentController.updateAssessment);
assessmentRouter.delete("/:assessmentId", assessmentController.deleteAssessment);
assessmentRouter.post("/:assessmentId/toggle-publish", assessmentController.togglePublishAssessment);
