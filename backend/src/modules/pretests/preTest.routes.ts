import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import * as preTestController from "./preTest.controller";

export const preTestRouter = Router();
export const studentPreTestRouter = Router();

preTestRouter.use(requireAuth, requireRole("TEACHER"));

preTestRouter.post("/", preTestController.createPreTest);
preTestRouter.get("/", preTestController.getPreTests);
preTestRouter.get("/:preTestId", preTestController.getPreTestDetail);
preTestRouter.put("/:preTestId", preTestController.updatePreTest);
preTestRouter.delete("/:preTestId", preTestController.deletePreTest);
preTestRouter.post("/:preTestId/toggle-publish", preTestController.togglePublishPreTest);
