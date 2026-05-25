import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/AppError";
import * as teacherService from "./teacher.service";
import {
  addQuestionsSchema,
  addStudentSchema,
  analyticsQuerySchema,
  createSectionSchema,
  guideIdParamsSchema,
  guideQuerySchema,
  guideSchema,
  leaderboardQuerySchema,
  questionIdParamsSchema,
  questIdParamsSchema,
  questQuerySchema,
  questSchema,
  sectionIdParamsSchema,
  studentIdParamsSchema,
  studentSearchQuerySchema,
  updateGuideSchema,
  updateQuestionSchema,
  updateQuestSchema,
  updateSectionSchema,
} from "./teacher.validation";

const classIdParamsSchema = z.object({ classId: z.string().trim().min(1) });
const classStudentIdParamsSchema = z.object({
  classId: z.string().trim().min(1),
  studentId: z.string().trim().min(1),
});
const classQuestIdParamsSchema = z.object({
  classId: z.string().trim().min(1),
  questId: z.string().trim().min(1),
});

export const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await teacherService.getDashboard(req.user!.sub);

  res.status(200).json({ success: true, data: { dashboard } });
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const query = analyticsQuerySchema.parse(req.query);
  const analytics = await teacherService.getAnalytics(req.user!.sub, query);

  res.status(200).json({ success: true, data: { analytics } });
});

export const createSection = asyncHandler(async (req, res) => {
  const body = createSectionSchema.parse(req.body);
  const section = await teacherService.createSection(req.user!.sub, body);

  res.status(201).json({ success: true, data: { section } });
});

export const getSections = asyncHandler(async (req, res) => {
  const sections = await teacherService.getSections(req.user!.sub);

  res.status(200).json({ success: true, data: { sections } });
});

export const getSection = asyncHandler(async (req, res) => {
  const { sectionId } = sectionIdParamsSchema.parse(req.params);
  const section = await teacherService.getSection(req.user!.sub, sectionId);

  res.status(200).json({ success: true, data: { section } });
});

export const updateSection = asyncHandler(async (req, res) => {
  const { sectionId } = sectionIdParamsSchema.parse(req.params);
  const body = updateSectionSchema.parse(req.body);
  const section = await teacherService.updateSection(req.user!.sub, sectionId, body);

  res.status(200).json({ success: true, data: { section } });
});

export const deleteSection = asyncHandler(async (req, res) => {
  const { sectionId } = sectionIdParamsSchema.parse(req.params);
  await teacherService.deleteSection(req.user!.sub, sectionId);

  res.status(204).send();
});

export const regenerateSectionCode = asyncHandler(async (req, res) => {
  const { sectionId } = sectionIdParamsSchema.parse(req.params);
  const section = await teacherService.regenerateSectionCode(req.user!.sub, sectionId);

  res.status(200).json({ success: true, data: { section } });
});

export const searchStudents = asyncHandler(async (req, res) => {
  const query = studentSearchQuerySchema.parse(req.query);
  const students = await teacherService.searchStudents(req.user!.sub, query);

  res.status(200).json({ success: true, data: { students } });
});

export const addStudentToSection = asyncHandler(async (req, res) => {
  const { sectionId } = sectionIdParamsSchema.parse(req.params);
  const body = addStudentSchema.parse(req.body);
  const section = await teacherService.addStudentToSection(req.user!.sub, sectionId, body);

  res.status(200).json({ success: true, data: { section } });
});

export const removeStudentFromSection = asyncHandler(async (req, res) => {
  const { sectionId } = sectionIdParamsSchema.parse(req.params);
  const { studentId } = studentIdParamsSchema.parse(req.params);
  const section = await teacherService.removeStudentFromSection(req.user!.sub, sectionId, studentId);

  res.status(200).json({ success: true, data: { section } });
});

export const getStudentsInSection = asyncHandler(async (req, res) => {
  const { sectionId } = sectionIdParamsSchema.parse(req.params);
  const section = await teacherService.getStudentsInSection(req.user!.sub, sectionId);

  res.status(200).json({ success: true, data: { section, students: section.students } });
});

export const createGuide = asyncHandler(async (req, res) => {
  const body = guideSchema.parse(req.body);
  const guide = await teacherService.createGuide(req.user!.sub, body);

  res.status(201).json({ success: true, data: { guide } });
});

export const getGuides = asyncHandler(async (req, res) => {
  const query = guideQuerySchema.parse(req.query);
  const guides = await teacherService.getGuides(req.user!.sub, query);

  res.status(200).json({ success: true, data: { guides } });
});

export const getGuide = asyncHandler(async (req, res) => {
  const { guideId } = guideIdParamsSchema.parse(req.params);
  const guide = await teacherService.getGuide(req.user!.sub, guideId);

  res.status(200).json({ success: true, data: { guide } });
});

export const updateGuide = asyncHandler(async (req, res) => {
  const { guideId } = guideIdParamsSchema.parse(req.params);
  const body = updateGuideSchema.parse(req.body);
  const guide = await teacherService.updateGuide(req.user!.sub, guideId, body);

  res.status(200).json({ success: true, data: { guide } });
});

export const deleteGuide = asyncHandler(async (req, res) => {
  const { guideId } = guideIdParamsSchema.parse(req.params);
  await teacherService.deleteGuide(req.user!.sub, guideId);

  res.status(204).send();
});

export const createQuest = asyncHandler(async (req, res) => {
  const body = questSchema.parse(req.body);
  const quest = await teacherService.createQuest(req.user!.sub, body);

  res.status(201).json({ success: true, data: { quest } });
});

export const getQuests = asyncHandler(async (req, res) => {
  const query = questQuerySchema.parse(req.query);
  const quests = await teacherService.getQuests(req.user!.sub, query);

  res.status(200).json({ success: true, data: { quests } });
});

export const getQuest = asyncHandler(async (req, res) => {
  const { questId } = questIdParamsSchema.parse(req.params);
  const quest = await teacherService.getQuest(req.user!.sub, questId);

  res.status(200).json({ success: true, data: { quest } });
});

export const updateQuest = asyncHandler(async (req, res) => {
  const { questId } = questIdParamsSchema.parse(req.params);
  const body = updateQuestSchema.parse(req.body);
  const quest = await teacherService.updateQuest(req.user!.sub, questId, body);

  res.status(200).json({ success: true, data: { quest } });
});

export const deleteQuest = asyncHandler(async (req, res) => {
  const { questId } = questIdParamsSchema.parse(req.params);
  await teacherService.deleteQuest(req.user!.sub, questId);

  res.status(204).send();
});

export const addQuestionsToQuest = asyncHandler(async (req, res) => {
  const { questId } = questIdParamsSchema.parse(req.params);
  const questionsInput = addQuestionsSchema.parse(req.body);
  const questions = await teacherService.addQuestionsToQuest(req.user!.sub, questId, questionsInput);

  res.status(201).json({ success: true, data: { questions } });
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const { questionId } = questionIdParamsSchema.parse(req.params);
  const body = updateQuestionSchema.parse(req.body);
  const question = await teacherService.updateQuestion(req.user!.sub, questionId, body);

  res.status(200).json({ success: true, data: { question } });
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const { questionId } = questionIdParamsSchema.parse(req.params);
  await teacherService.deleteQuestion(req.user!.sub, questionId);

  res.status(204).send();
});

export const getSectionProgress = asyncHandler(async (req, res) => {
  const { sectionId } = sectionIdParamsSchema.parse(req.params);
  const progress = await teacherService.getSectionProgress(req.user!.sub, sectionId);

  res.status(200).json({ success: true, data: { progress } });
});

export const getStudentProgress = asyncHandler(async (req, res) => {
  const { studentId } = studentIdParamsSchema.parse(req.params);
  const progress = await teacherService.getStudentProgress(req.user!.sub, studentId);

  res.status(200).json({ success: true, data: { progress } });
});

export const getClassDetails = asyncHandler(async (req, res) => {
  const { classId } = classIdParamsSchema.parse(req.params);
  const classDetails = await teacherService.getClassDetails(req.user!.sub, classId);

  res.status(200).json({ success: true, data: classDetails });
});

export const updateClass = asyncHandler(async (req, res) => {
  const { classId } = classIdParamsSchema.parse(req.params);
  const body = updateSectionSchema.parse(req.body);
  const section = await teacherService.updateSection(req.user!.sub, classId, body);

  res.status(200).json({ success: true, data: { section, class: section } });
});

export const deleteClass = asyncHandler(async (req, res) => {
  const { classId } = classIdParamsSchema.parse(req.params);
  await teacherService.deleteSection(req.user!.sub, classId);

  res.status(204).send();
});

export const addStudentToClass = asyncHandler(async (req, res) => {
  const { classId } = classIdParamsSchema.parse(req.params);
  const body = addStudentSchema.parse(req.body);
  const section = await teacherService.addStudentToSection(req.user!.sub, classId, body);

  res.status(200).json({ success: true, data: { section, class: section } });
});

export const removeStudentFromClass = asyncHandler(async (req, res) => {
  const { classId, studentId } = classStudentIdParamsSchema.parse(req.params);
  const section = await teacherService.removeStudentFromSection(req.user!.sub, classId, studentId);

  res.status(200).json({ success: true, data: { section, class: section } });
});

export const getStudentsInClass = asyncHandler(async (req, res) => {
  const { classId } = classIdParamsSchema.parse(req.params);
  const section = await teacherService.getStudentsInSection(req.user!.sub, classId);

  res.status(200).json({ success: true, data: { section, class: section, students: section.students } });
});

export const createGuideForClass = asyncHandler(async (req, res) => {
  const { classId } = classIdParamsSchema.parse(req.params);
  const body = guideSchema.parse({ ...req.body, classId });
  const guide = await teacherService.createGuide(req.user!.sub, body);

  res.status(201).json({ success: true, data: { guide } });
});

export const getGuidesForClass = asyncHandler(async (req, res) => {
  const { classId } = classIdParamsSchema.parse(req.params);
  const guides = await teacherService.getGuides(req.user!.sub, { sectionId: classId });

  res.status(200).json({ success: true, data: { guides } });
});

export const createQuestForClass = asyncHandler(async (req, res) => {
  const { classId } = classIdParamsSchema.parse(req.params);
  const body = questSchema.parse({ ...req.body, classId });
  const quest = await teacherService.createQuest(req.user!.sub, body);

  res.status(201).json({ success: true, data: { quest } });
});

export const getQuestsForClass = asyncHandler(async (req, res) => {
  const { classId } = classIdParamsSchema.parse(req.params);
  const quests = await teacherService.getQuests(req.user!.sub, { sectionId: classId });

  res.status(200).json({ success: true, data: { quests } });
});

export const getQuestForClass = asyncHandler(async (req, res) => {
  const { classId, questId } = classQuestIdParamsSchema.parse(req.params);
  const quest = await teacherService.getQuest(req.user!.sub, questId);

  if (!quest || quest.sectionId !== classId) {
    throw new AppError("Quest was not found in this class.", 404, "QUEST_NOT_IN_CLASS");
  }

  res.status(200).json({ success: true, data: { quest } });
});

export const getClassProgress = asyncHandler(async (req, res) => {
  const { classId } = classIdParamsSchema.parse(req.params);
  const progress = await teacherService.getSectionProgress(req.user!.sub, classId);

  res.status(200).json({ success: true, data: { progress } });
});

export const getClassLeaderboard = asyncHandler(async (req, res) => {
  const { classId } = classIdParamsSchema.parse(req.params);
  const query = leaderboardQuerySchema.parse(req.query);
  const leaderboard = await teacherService.getSectionLeaderboard(req.user!.sub, classId, query);

  res.status(200).json({ success: true, data: leaderboard });
});

export const getClassTopStudent = asyncHandler(async (req, res) => {
  const { classId } = classIdParamsSchema.parse(req.params);
  const topStudent = await teacherService.getTopStudent(req.user!.sub, classId);

  res.status(200).json({ success: true, data: { topStudent } });
});

export const getSectionLeaderboard = asyncHandler(async (req, res) => {
  const { sectionId } = sectionIdParamsSchema.parse(req.params);
  const query = leaderboardQuerySchema.parse(req.query);
  const leaderboard = await teacherService.getSectionLeaderboard(req.user!.sub, sectionId, query);

  res.status(200).json({ success: true, data: leaderboard });
});

export const getTopStudent = asyncHandler(async (req, res) => {
  const { sectionId } = sectionIdParamsSchema.parse(req.params);
  const topStudent = await teacherService.getTopStudent(req.user!.sub, sectionId);

  res.status(200).json({ success: true, data: { topStudent } });
});
