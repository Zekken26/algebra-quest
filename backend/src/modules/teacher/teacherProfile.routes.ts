import { Router } from "express";
import { uploadAvatar } from "../../middleware/upload.middleware";
import * as teacherProfileController from "./teacherProfile.controller";

export const teacherProfileRouter = Router();

teacherProfileRouter.get("/", teacherProfileController.getProfile);
teacherProfileRouter.put("/", teacherProfileController.updateProfile);
teacherProfileRouter.put("/password", teacherProfileController.changePassword);
teacherProfileRouter.post("/avatar", uploadAvatar, teacherProfileController.uploadAvatar);
