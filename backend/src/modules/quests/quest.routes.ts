import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import * as progressController from "../progress/progress.controller";
import * as questController from "./quest.controller";

export const questRouter = Router();

questRouter.use(requireAuth, requireRole("TEACHER"));
questRouter.post("/", questController.createQuest);
questRouter.get("/", questController.getQuests);
questRouter.get("/:questId", questController.getQuest);
questRouter.put("/:questId", questController.updateQuest);
questRouter.delete("/:questId", questController.deleteQuest);

export const studentQuestRouter = Router();

studentQuestRouter.use(requireAuth, requireRole("STUDENT"));
studentQuestRouter.get("/", questController.getStudentQuests);
studentQuestRouter.get("/:questId", questController.getStudentQuest);
studentQuestRouter.post("/:questId/start", progressController.startQuest);
studentQuestRouter.post("/:questId/answer", progressController.answerQuestion);
studentQuestRouter.post("/:questId/use-hint", progressController.useHint);
studentQuestRouter.post("/:questId/complete", progressController.completeQuest);
