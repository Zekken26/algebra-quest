import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import * as shopService from "./shop.service";

const purchaseSchema = z.object({
  itemType: z.enum(["health", "hint", "skip"]),
  questId: z.string().optional(),
});

export const purchase = asyncHandler(async (req, res) => {
  const body = purchaseSchema.parse(req.body);
  const data = await shopService.purchaseItem(req.user!.sub, body.itemType, body.questId);

  res.status(200).json({ success: true, data });
});

export const buyHealth = asyncHandler(async (req, res) => {
  const data = await shopService.purchaseItem(req.user!.sub, "health", req.body?.questId);
  res.status(200).json({ success: true, data });
});

export const buyHint = asyncHandler(async (req, res) => {
  const data = await shopService.purchaseItem(req.user!.sub, "hint", req.body?.questId);
  res.status(200).json({ success: true, data });
});

export const buySkip = asyncHandler(async (req, res) => {
  const data = await shopService.purchaseItem(req.user!.sub, "skip", req.body?.questId);
  res.status(200).json({ success: true, data });
});
