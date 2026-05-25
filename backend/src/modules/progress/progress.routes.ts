import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import * as progressController from "./progress.controller";

export const progressRouter = Router({ mergeParams: true });

progressRouter.use(requireAuth, requireRole("TEACHER"));
progressRouter.get("/", progressController.getClassProgress);
