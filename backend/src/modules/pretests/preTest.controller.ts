import { asyncHandler } from "../../utils/asyncHandler";
import * as preTestService from "./preTest.service";
import {
  preTestIdParamsSchema,
  createPreTestSchema,
  updatePreTestSchema,
  preTestQuerySchema,
} from "./preTest.validation";

export const createPreTest = asyncHandler(async (req, res) => {
  const body = createPreTestSchema.parse(req.body);
  const preTest = await preTestService.createPreTest(req.user!.sub, body);

  res.status(201).json({ success: true, data: { preTest } });
});

export const getPreTests = asyncHandler(async (req, res) => {
  const query = preTestQuerySchema.parse(req.query);
  const preTests = await preTestService.getPreTests(req.user!.sub, query.sectionId);

  res.status(200).json({ success: true, data: { preTests } });
});

export const getPreTestDetail = asyncHandler(async (req, res) => {
  const { preTestId } = preTestIdParamsSchema.parse(req.params);
  const preTest = await preTestService.getPreTestDetail(req.user!.sub, preTestId);

  res.status(200).json({ success: true, data: { preTest } });
});

export const updatePreTest = asyncHandler(async (req, res) => {
  const { preTestId } = preTestIdParamsSchema.parse(req.params);
  const body = updatePreTestSchema.parse(req.body);
  const preTest = await preTestService.updatePreTest(req.user!.sub, preTestId, body);

  res.status(200).json({ success: true, data: { preTest } });
});

export const deletePreTest = asyncHandler(async (req, res) => {
  const { preTestId } = preTestIdParamsSchema.parse(req.params);
  await preTestService.deletePreTest(req.user!.sub, preTestId);

  res.status(204).send();
});

export const togglePublishPreTest = asyncHandler(async (req, res) => {
  const { preTestId } = preTestIdParamsSchema.parse(req.params);
  const preTest = await preTestService.togglePublishPreTest(req.user!.sub, preTestId);

  res.status(200).json({ success: true, data: { preTest } });
});
