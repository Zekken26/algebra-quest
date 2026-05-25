import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import * as leaderboardService from "./leaderboard.service";

const classIdParams = z.object({ classId: z.string().min(1) });

export const getClassLeaderboard = asyncHandler(async (req, res) => {
  const { classId } = classIdParams.parse(req.params);
  const leaderboard = await leaderboardService.getClassLeaderboard(req.user!.sub, classId);

  res.status(200).json({ success: true, data: { leaderboard } });
});

export const getTopStudent = asyncHandler(async (req, res) => {
  const { classId } = classIdParams.parse(req.params);
  const topStudent = await leaderboardService.getTopStudent(req.user!.sub, classId);

  res.status(200).json({ success: true, data: { topStudent } });
});
