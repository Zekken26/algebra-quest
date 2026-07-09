import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { uploadQuestImage } from "../../middleware/upload.middleware";
import * as teacherController from "./teacher.controller";
import { teacherProfileRouter } from "./teacherProfile.routes";

export const teacherRouter = Router();

teacherRouter.use(requireAuth, requireRole("TEACHER"));

teacherRouter.use("/profile", teacherProfileRouter);
teacherRouter.post("/upload", uploadQuestImage, teacherController.uploadQuestAsset);
teacherRouter.get("/dashboard", teacherController.getDashboard);
teacherRouter.get("/analytics", teacherController.getAnalytics);

teacherRouter.get("/students/search", teacherController.searchStudents);
teacherRouter.get("/students/:studentId/progress", teacherController.getStudentProgress);
teacherRouter.get("/students/:studentId/activity", teacherController.getStudentActivity);

teacherRouter.get("/classes", teacherController.getSections);
teacherRouter.post("/classes", teacherController.createSection);
teacherRouter.get("/classes/:classId", teacherController.getClassDetails);
teacherRouter.put("/classes/:classId", teacherController.updateClass);
teacherRouter.delete("/classes/:classId", teacherController.deleteClass);
teacherRouter.get("/classes/:classId/students", teacherController.getStudentsInClass);
teacherRouter.post("/classes/:classId/students", teacherController.addStudentToClass);
teacherRouter.put("/classes/:classId/students/:studentId/grade", teacherController.updateStudentGrade);
teacherRouter.delete("/classes/:classId/students/:studentId", teacherController.removeStudentFromClass);
teacherRouter.post("/classes/:classId/quest-guides", teacherController.createGuideForClass);
teacherRouter.get("/classes/:classId/quest-guides", teacherController.getGuidesForClass);
teacherRouter.post("/classes/:classId/quests", teacherController.createQuestForClass);
teacherRouter.get("/classes/:classId/quests", teacherController.getQuestsForClass);
teacherRouter.get("/classes/:classId/quests/:questId", teacherController.getQuestForClass);
teacherRouter.get("/classes/:classId/progress", teacherController.getClassProgress);
teacherRouter.get("/classes/:classId/leaderboard", teacherController.getClassLeaderboard);
teacherRouter.get("/classes/:classId/top-student", teacherController.getClassTopStudent);

teacherRouter.post("/sections", teacherController.createSection);
teacherRouter.get("/sections", teacherController.getSections);
teacherRouter.get("/sections/:sectionId", teacherController.getSection);
teacherRouter.put("/sections/:sectionId", teacherController.updateSection);
teacherRouter.delete("/sections/:sectionId", teacherController.deleteSection);
teacherRouter.post("/sections/:sectionId/code", teacherController.regenerateSectionCode);
teacherRouter.post("/sections/:sectionId/students", teacherController.addStudentToSection);
teacherRouter.delete("/sections/:sectionId/students/:studentId", teacherController.removeStudentFromSection);
teacherRouter.get("/sections/:sectionId/students", teacherController.getStudentsInSection);
teacherRouter.get("/sections/:sectionId/progress", teacherController.getSectionProgress);
teacherRouter.get("/sections/:sectionId/leaderboard", teacherController.getSectionLeaderboard);
teacherRouter.get("/sections/:sectionId/top-student", teacherController.getTopStudent);

teacherRouter.post("/guides", teacherController.createGuide);
teacherRouter.get("/guides", teacherController.getGuides);
teacherRouter.get("/guides/:guideId", teacherController.getGuide);
teacherRouter.put("/guides/:guideId", teacherController.updateGuide);
teacherRouter.delete("/guides/:guideId", teacherController.deleteGuide);

teacherRouter.post("/quests", teacherController.createQuest);
teacherRouter.get("/quests", teacherController.getQuests);
teacherRouter.get("/quests/:questId", teacherController.getQuest);
teacherRouter.put("/quests/:questId", teacherController.updateQuest);
teacherRouter.delete("/quests/:questId", teacherController.deleteQuest);
teacherRouter.post("/quests/:questId/questions", teacherController.addQuestionsToQuest);

teacherRouter.put("/questions/:questionId", teacherController.updateQuestion);
teacherRouter.delete("/questions/:questionId", teacherController.deleteQuestion);
