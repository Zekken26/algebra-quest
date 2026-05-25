import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import * as authController from "./auth.controller";

export const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.get("/me", requireAuth, authController.me);
