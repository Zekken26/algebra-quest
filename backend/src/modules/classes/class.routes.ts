import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import * as leaderboardController from "../leaderboard/leaderboard.controller";
import * as progressController from "../progress/progress.controller";
import * as classController from "./class.controller";

export const classRouter = Router();

classRouter.use(requireAuth, requireRole("TEACHER"));
classRouter.post("/", classController.createClass);
classRouter.get("/", classController.getClasses);
classRouter.get("/:classId", classController.getClass);
classRouter.put("/:classId", classController.updateClass);
classRouter.delete("/:classId", classController.deleteClass);
classRouter.post("/:classId/students", classController.addStudent);
classRouter.get("/:classId/progress", progressController.getClassProgress);
classRouter.get("/:classId/leaderboard", leaderboardController.getClassLeaderboard);
classRouter.get("/:classId/top-student", leaderboardController.getTopStudent);
