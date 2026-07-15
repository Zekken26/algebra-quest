import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { classRouter } from "../modules/classes/class.routes";
import { healthRouter } from "../modules/health/health.routes";
import { questGuideRouter, studentQuestGuideRouter } from "../modules/questGuides/questGuide.routes";
import { questRouter, studentQuestRouter } from "../modules/quests/quest.routes";
import { shopRouter } from "../modules/shop/shop.routes";
import { teacherRouter } from "../modules/teacher/teacher.routes";
import { userRouter } from "../modules/users/user.routes";
import { teacherActivityRouter, studentActivityRouter } from "../modules/activities/activity.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/teacher", teacherRouter);
apiRouter.use("/classes", classRouter);
apiRouter.use("/quest-guides", questGuideRouter);
apiRouter.use("/quests", questRouter);
apiRouter.use("/student", userRouter);
apiRouter.use("/student/shop", shopRouter);
apiRouter.use("/student/quest-guides", studentQuestGuideRouter);
apiRouter.use("/student/quests", studentQuestRouter);
apiRouter.use("/teacher/activities", teacherActivityRouter);
apiRouter.use("/student/activities", studentActivityRouter);
