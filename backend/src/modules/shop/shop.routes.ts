import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import * as shopController from "./shop.controller";

export const shopRouter = Router();

shopRouter.use(requireAuth, requireRole("STUDENT"));
shopRouter.post("/purchase", shopController.purchase);
shopRouter.post("/buy-health", shopController.buyHealth);
shopRouter.post("/buy-hint", shopController.buyHint);
shopRouter.post("/buy-skip", shopController.buySkip);
