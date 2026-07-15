import { asyncHandler } from "../../utils/asyncHandler";
import * as activityService from "./activity.service";
import {
  activityIdParamsSchema,
  classIdParamsSchema,
  createActivitySchema,
  updateActivitySchema,
  activityQuerySchema,
} from "./activity.validation";
import { sectionIdParamsSchema } from "../teacher/teacher.validation";

export const createActivity = asyncHandler(async (req, res) => {
  const body = createActivitySchema.parse(req.body);
  const activity = await activityService.createActivity(req.user!.sub, body);

  res.status(201).json({ success: true, data: { activity } });
});

export const getClassActivities = asyncHandler(async (req, res) => {
  const { classId } = classIdParamsSchema.parse(req.params);
  const query = activityQuerySchema.parse(req.query);
  const activities = await activityService.getClassActivities(req.user!.sub, classId, query.type);

  res.status(200).json({ success: true, data: { activities } });
});

export const getActivityDetail = asyncHandler(async (req, res) => {
  const { activityId } = activityIdParamsSchema.parse(req.params);
  const activity = await activityService.getActivityDetail(req.user!.sub, activityId);

  res.status(200).json({ success: true, data: { activity } });
});

export const updateActivity = asyncHandler(async (req, res) => {
  const { activityId } = activityIdParamsSchema.parse(req.params);
  const body = updateActivitySchema.parse(req.body);
  const activity = await activityService.updateActivity(req.user!.sub, activityId, body);

  res.status(200).json({ success: true, data: { activity } });
});

export const togglePublishActivity = asyncHandler(async (req, res) => {
  const { activityId } = activityIdParamsSchema.parse(req.params);
  const activity = await activityService.toggleActivityPublish(req.user!.sub, activityId);

  res.status(200).json({ success: true, data: { activity } });
});

export const deleteActivity = asyncHandler(async (req, res) => {
  const { activityId } = activityIdParamsSchema.parse(req.params);
  await activityService.deleteActivity(req.user!.sub, activityId);

  res.status(204).send();
});

export const getStudentActivities = asyncHandler(async (req, res) => {
  const { classId } = classIdParamsSchema.parse(req.params);
  const query = activityQuerySchema.parse(req.query);
  const activities = await activityService.getStudentActivities(req.user!.sub, classId, query.type);

  res.status(200).json({ success: true, data: { activities } });
});

export const getStudentActivityDetail = asyncHandler(async (req, res) => {
  const { activityId } = activityIdParamsSchema.parse(req.params);
  const activity = await activityService.getStudentActivityDetail(req.user!.sub, activityId);

  res.status(200).json({ success: true, data: { activity } });
});
