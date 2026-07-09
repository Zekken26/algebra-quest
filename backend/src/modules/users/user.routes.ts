import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { uploadAvatar } from "../../middleware/upload.middleware";
import * as progressController from "../progress/progress.controller";
import * as contentStudentController from "../content/content.student.controller";
import * as userController from "./user.controller";

export const userRouter = Router();

userRouter.get("/dashboard", requireAuth, requireRole("STUDENT"), userController.getStudentDashboard);
userRouter.get("/enrollment/status", requireAuth, requireRole("STUDENT"), userController.getStudentEnrollmentStatus);
userRouter.post("/classes/join", requireAuth, requireRole("STUDENT"), userController.joinClass);
userRouter.get("/classes", requireAuth, requireRole("STUDENT"), userController.getStudentClasses);
userRouter.get("/classes/:classId", requireAuth, requireRole("STUDENT"), userController.getStudentClass);
userRouter.get("/classes/:classId/quest-guides", requireAuth, requireRole("STUDENT"), userController.getStudentClassQuestGuides);
userRouter.get("/classes/:classId/quests", requireAuth, requireRole("STUDENT"), userController.getStudentClassQuests);
userRouter.get("/classes/:classId/quests/:questId", requireAuth, requireRole("STUDENT"), userController.getStudentClassQuest);
userRouter.get("/classes/:classId/progress", requireAuth, requireRole("STUDENT"), userController.getStudentClassProgress);
userRouter.get("/classes/:classId/leaderboard", requireAuth, requireRole("STUDENT"), userController.getStudentClassLeaderboard);
userRouter.post("/classes/:classId/quests/:questId/guide/read", requireAuth, requireRole("STUDENT"), progressController.markClassQuestGuideRead);
userRouter.post("/classes/:classId/quests/:questId/start", requireAuth, requireRole("STUDENT"), progressController.startClassQuest);
userRouter.post("/classes/:classId/quests/:questId/answer", requireAuth, requireRole("STUDENT"), progressController.answerClassQuestQuestion);
userRouter.post("/classes/:classId/quests/:questId/use-hint", requireAuth, requireRole("STUDENT"), progressController.useClassQuestHint);
userRouter.post("/classes/:classId/quests/:questId/complete", requireAuth, requireRole("STUDENT"), progressController.completeClassQuest);
userRouter.post("/sections/join", requireAuth, requireRole("STUDENT"), userController.joinSection);
userRouter.get("/sections", requireAuth, requireRole("STUDENT"), userController.getStudentSections);
userRouter.get("/sections/:sectionId", requireAuth, requireRole("STUDENT"), userController.getStudentSection);
userRouter.get("/sections/:sectionId/quest-guides", requireAuth, requireRole("STUDENT"), userController.getStudentSectionQuestGuides);
userRouter.get("/sections/:sectionId/quests", requireAuth, requireRole("STUDENT"), userController.getStudentSectionQuests);
userRouter.get("/sections/:sectionId/progress", requireAuth, requireRole("STUDENT"), userController.getStudentSectionProgress);
userRouter.put("/profile", requireAuth, requireRole("STUDENT"), uploadAvatar, userController.updateStudentProfile);

userRouter.get("/classes/:classId/content", requireAuth, requireRole("STUDENT"), contentStudentController.getStudentContent);
userRouter.get("/content/:contentId", requireAuth, requireRole("STUDENT"), contentStudentController.getStudentContentDetail);
userRouter.post("/content/:contentId/start", requireAuth, requireRole("STUDENT"), contentStudentController.startStudentContent);
userRouter.post("/content/:contentId/answer", requireAuth, requireRole("STUDENT"), contentStudentController.answerStudentContent);
userRouter.post("/content/:contentId/submit", requireAuth, requireRole("STUDENT"), contentStudentController.submitStudentContent);
userRouter.get("/content/:contentId/attempts", requireAuth, requireRole("STUDENT"), contentStudentController.getStudentContentAttempts);

userRouter.get("/sections/:sectionId/content", requireAuth, requireRole("STUDENT"), contentStudentController.getStudentContent);
