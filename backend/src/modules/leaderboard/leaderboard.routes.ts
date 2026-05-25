import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import * as leaderboardController from "./leaderboard.controller";

export const leaderboardRouter = Router({ mergeParams: true });

leaderboardRouter.use(requireAuth, requireRole("TEACHER"));
leaderboardRouter.get("/", leaderboardController.getClassLeaderboard);
