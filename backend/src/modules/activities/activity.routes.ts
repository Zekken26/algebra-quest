import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import * as activityController from "./activity.controller";

export const teacherActivityRouter = Router();
export const studentActivityRouter = Router();

teacherActivityRouter.use(requireAuth, requireRole("TEACHER"));

teacherActivityRouter.post("/", activityController.createActivity);
teacherActivityRouter.get("/classes/:classId/activities", activityController.getClassActivities);
teacherActivityRouter.get("/:activityId", activityController.getActivityDetail);
teacherActivityRouter.put("/:activityId", activityController.updateActivity);
teacherActivityRouter.post("/:activityId/toggle-publish", activityController.togglePublishActivity);
teacherActivityRouter.delete("/:activityId", activityController.deleteActivity);

studentActivityRouter.use(requireAuth, requireRole("STUDENT"));

studentActivityRouter.get("/classes/:classId/activities", activityController.getStudentActivities);
studentActivityRouter.get("/:activityId", activityController.getStudentActivityDetail);
