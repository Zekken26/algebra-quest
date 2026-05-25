import { Router } from "express";
import { db } from "../../config/db";
import { asyncHandler } from "../../shared/utils/asyncHandler";

export const healthRouter = Router();

healthRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        service: "algebra-quest-api",
        status: "ok",
        timestamp: new Date().toISOString(),
      },
    });
  }),
);

healthRouter.get(
  "/db",
  asyncHandler(async (_req, res) => {
    await db.query("SELECT 1");

    res.status(200).json({
      success: true,
      data: {
        database: "ok",
      },
    });
  }),
);
