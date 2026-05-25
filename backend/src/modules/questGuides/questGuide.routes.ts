import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import * as questGuideController from "./questGuide.controller";

export const questGuideRouter = Router();

questGuideRouter.use(requireAuth, requireRole("TEACHER"));
questGuideRouter.post("/", questGuideController.createQuestGuide);
questGuideRouter.get("/", questGuideController.getQuestGuides);
questGuideRouter.put("/:guideId", questGuideController.updateQuestGuide);
questGuideRouter.delete("/:guideId", questGuideController.deleteQuestGuide);

export const studentQuestGuideRouter = Router();

studentQuestGuideRouter.use(requireAuth, requireRole("STUDENT"));
studentQuestGuideRouter.get("/", questGuideController.getStudentQuestGuides);
studentQuestGuideRouter.post("/:guideId/view", questGuideController.markGuideViewed);
