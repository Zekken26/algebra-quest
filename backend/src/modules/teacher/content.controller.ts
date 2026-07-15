import { asyncHandler } from "../../utils/asyncHandler";
import * as contentService from "./content.service";
import {
  contentIdParamsSchema,
  createContentSchema,
  updateContentSchema,
  contentQuerySchema,
} from "./content.validation";
import { sectionIdParamsSchema } from "./teacher.validation";

export const createClassContent = asyncHandler(async (req, res) => {
  const body = createContentSchema.parse(req.body);
  const content = await contentService.createContent(req.user!.sub, body);

  res.status(201).json({ success: true, data: { content } });
});

export const updateClassContent = asyncHandler(async (req, res) => {
  const { contentId } = contentIdParamsSchema.parse(req.params);
  const body = updateContentSchema.parse(req.body);
  const content = await contentService.updateContent(req.user!.sub, contentId, body);

  res.status(200).json({ success: true, data: { content } });
});

export const deleteClassContent = asyncHandler(async (req, res) => {
  const { contentId } = contentIdParamsSchema.parse(req.params);
  await contentService.deleteContent(req.user!.sub, contentId);

  res.status(204).send();
});

export const getClassContent = asyncHandler(async (req, res) => {
  const { sectionId } = sectionIdParamsSchema.parse(req.params);
  const query = contentQuerySchema.parse(req.query);
  const content = await contentService.getSectionContent(req.user!.sub, sectionId, query.type);

  res.status(200).json({ success: true, data: { content } });
});

export const getContentDetail = asyncHandler(async (req, res) => {
  const { contentId } = contentIdParamsSchema.parse(req.params);
  const content = await contentService.getContentDetail(req.user!.sub, contentId);

  res.status(200).json({ success: true, data: { content } });
});

export const togglePublishContent = asyncHandler(async (req, res) => {
  const { contentId } = contentIdParamsSchema.parse(req.params);
  const content = await contentService.getContentDetail(req.user!.sub, contentId);
  const updated = await contentService.updateContent(req.user!.sub, contentId, {
    isPublished: !content.isPublished,
  });

  res.status(200).json({ success: true, data: { content: updated } });
});
