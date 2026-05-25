import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import * as classService from "./class.service";

const classIdParams = z.object({ classId: z.string().min(1) });
const createClassSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().max(2000).optional().nullable(),
});
const updateClassSchema = createClassSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required.",
});
const addStudentSchema = z
  .object({ studentId: z.string().optional(), email: z.string().email().optional() })
  .refine((value) => value.studentId || value.email, "studentId or email is required");

export const createClass = asyncHandler(async (req, res) => {
  const body = createClassSchema.parse(req.body);
  const classRecord = await classService.createClass(req.user!.sub, body);

  res.status(201).json({ success: true, data: { class: classRecord } });
});

export const getClasses = asyncHandler(async (req, res) => {
  const classes = await classService.getTeacherClasses(req.user!.sub);

  res.status(200).json({ success: true, data: { classes } });
});

export const getClass = asyncHandler(async (req, res) => {
  const { classId } = classIdParams.parse(req.params);
  const classRecord = await classService.getTeacherClass(req.user!.sub, classId);

  res.status(200).json({ success: true, data: { class: classRecord } });
});

export const updateClass = asyncHandler(async (req, res) => {
  const { classId } = classIdParams.parse(req.params);
  const body = updateClassSchema.parse(req.body);
  const classRecord = await classService.updateClass(req.user!.sub, classId, body);

  res.status(200).json({ success: true, data: { class: classRecord } });
});

export const deleteClass = asyncHandler(async (req, res) => {
  const { classId } = classIdParams.parse(req.params);
  await classService.deleteClass(req.user!.sub, classId);

  res.status(204).send();
});

export const addStudent = asyncHandler(async (req, res) => {
  const { classId } = classIdParams.parse(req.params);
  const body = addStudentSchema.parse(req.body);
  const classRecord = await classService.addStudentToClass(req.user!.sub, classId, body);

  res.status(200).json({ success: true, data: { class: classRecord } });
});
