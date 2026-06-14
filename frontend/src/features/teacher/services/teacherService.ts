import { getAuth, saveAuth } from "@/lib/store";
import type {
  AnalyticsPoint,
  DashboardStats,
  TeacherActivity,
  TeacherClass,
  TeacherModule,
  TeacherStudent,
  WeakTopic,
} from "@/features/teacher/types/teacher.types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

type ApiPayload<T> = {
  success: boolean;
  data?: T;
  error?: { message?: string };
};

export type TeacherProfile = {
  id: string;
  name: string;
  email: string;
  role: "TEACHER";
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type TeacherSection = {
  id: string;
  name: string;
  description?: string | null;
  code?: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: { studentSections?: number; questGuides?: number; quests?: number };
  students?: Array<{
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    xp?: number;
    coins?: number;
    grade?: number | null;
    joinedAt?: string;
    progressSummary?: {
      completionProgress: number;
      accuracy: number;
      xpEarned: number;
      coinsEarned: number;
      timeSpent: number;
    };
  }>;
  quests?: Array<{ id: string; title: string; topic: string; levelNumber: number }>;
  questGuides?: Array<{ id: string; title: string; topic: string }>;
};

export type TeacherGuide = {
  id: string;
  title: string;
  topic: string;
  shortExplanation: string;
  exampleProblem: string;
  solutionSteps: string[];
  tips: string[];
  imageUrl?: string | null;
  sectionId: string;
  questId?: string | null;
};

export type TeacherQuest = {
  id: string;
  title: string;
  worldName: string;
  topic: string;
  difficulty: string;
  requiredPuzzlePieces: number;
  maxHearts: number;
  hintLimit: number;
  xpReward?: number;
  coinReward?: number;
  levelNumber: number;
  isPublished?: boolean;
  sectionId: string;
  guideId?: string | null;
  questions?: TeacherQuestion[];
  _count?: { questions?: number; progress?: number };
};

export type TeacherQuestion = {
  id: string;
  equation: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
  solutionSteps: string[];
  difficulty: string;
  imageUrl?: string | null;
};

function authHeaders(json = true) {
  const auth = getAuth();
  const headers = new Headers();
  if (json) headers.set("Content-Type", "application/json");
  if (auth?.accessToken) headers.set("Authorization", `Bearer ${auth.accessToken}`);
  return headers;
}

function avatarUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL.replace(/\/api$/, "")}${url}`;
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: options.headers ?? authHeaders(options.body instanceof FormData ? false : true),
  });
  if (response.status === 204) return undefined as T;
  const payload = (await response.json().catch(() => ({}))) as ApiPayload<T>;

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.error?.message ?? "Request failed. Please try again.");
  }

  return payload.data;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function toTeacherClass(section: TeacherSection): TeacherClass {
  const studentCount = section._count?.studentSections ?? section.students?.length ?? 0;
  const progressSummaries =
    section.students?.map((student) => student.progressSummary).filter(Boolean) ?? [];
  const averagePerformance =
    progressSummaries.length === 0
      ? 0
      : Math.round(
          progressSummaries.reduce((sum, item) => sum + (item?.accuracy ?? 0), 0) /
            progressSummaries.length,
        );

  return {
    id: section.id,
    name: section.name,
    code: section.code,
    section: section.code ? `Code ${section.code}` : section.name,
    gradeLevel: "Section",
    studentCount,
    averagePerformance,
    activeModules: section._count?.quests ?? section.quests?.length ?? 0,
    atRiskCount:
      section.students?.filter((student) => (student.progressSummary?.accuracy ?? 100) < 70)
        .length ?? 0,
  };
}

function toTeacherStudent(
  student: NonNullable<TeacherSection["students"]>[number],
  classId: string,
): TeacherStudent {
  const progress = student.progressSummary;
  const accuracy = Math.round(progress?.accuracy ?? 0);
  const completion = Math.round(progress?.completionProgress ?? 0);

  return {
    id: student.id,
    name: student.name,
    email: student.email,
    classId,
    avatar: initials(student.name),
    xp: student.xp ?? progress?.xpEarned ?? 0,
    coins: student.coins ?? progress?.coinsEarned ?? 0,
    grade: student.grade ?? null,
    accuracy,
    completion,
    quizAverage: accuracy,
    gameScore: progress?.xpEarned ?? 0,
    timeSpentMinutes: Math.round((progress?.timeSpent ?? 0) / 60),
    weakAreas: accuracy < 70 ? ["Needs review"] : [],
    status: accuracy >= 90 ? "thriving" : accuracy < 70 ? "at-risk" : "steady",
  };
}

export type TeacherClassDetails = {
  classInfo: {
    id: string;
    name: string;
    code: string;
    teacher: { id: string; name: string; email: string };
    createdAt: string;
    updatedAt: string;
  };
  students: Array<
    NonNullable<TeacherSection["students"]>[number] & {
      currentQuest?: { id: string; title: string; topic: string } | null;
      status: "thriving" | "steady" | "at-risk";
    }
  >;
  analytics: {
    totalStudents: number;
    averageAccuracy: number;
    completionRate: number;
    studentsAtRisk: number;
    topStudent?: {
      student: { id: string; name: string; email: string; xp?: number; coins?: number };
      accuracy: number;
      completionProgress: number;
      overallScore: number;
    } | null;
  };
  assignedGuides: TeacherGuide[];
  assignedQuests: TeacherQuest[];
  leaderboard: Array<{
    rank: number;
    student: { id: string; name: string; email: string; xp?: number; coins?: number };
    accuracy: number;
    completionProgress: number;
    xpEarned: number;
    coinsEarned: number;
    overallScore: number;
    totalTimeSpent: number;
  }>;
};

export async function fetchTeacherProfile() {
  const data = await apiRequest<{ profile: TeacherProfile }>("/teacher/profile");
  return { ...data.profile, avatarUrl: avatarUrl(data.profile.avatarUrl) };
}

export async function updateTeacherProfile(input: { name: string; email: string }) {
  const data = await apiRequest<{ profile: TeacherProfile }>("/teacher/profile", {
    method: "PUT",
    body: JSON.stringify(input),
  });
  const auth = getAuth();
  if (auth)
    saveAuth({
      ...auth,
      name: data.profile.name,
      email: data.profile.email,
      avatarUrl: avatarUrl(data.profile.avatarUrl),
    });
  return { ...data.profile, avatarUrl: avatarUrl(data.profile.avatarUrl) };
}

export async function changeTeacherPassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}) {
  return apiRequest<{ passwordChanged: boolean }>("/teacher/profile/password", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function uploadTeacherAvatar(file: File) {
  const formData = new FormData();
  formData.append("avatar", file);
  const data = await apiRequest<{ profile: TeacherProfile }>("/teacher/profile/avatar", {
    method: "POST",
    body: formData,
    headers: authHeaders(false),
  });
  const auth = getAuth();
  if (auth) saveAuth({ ...auth, avatarUrl: avatarUrl(data.profile.avatarUrl) });
  return { ...data.profile, avatarUrl: avatarUrl(data.profile.avatarUrl) };
}

export async function uploadTeacherQuestAsset(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  const data = await apiRequest<{ imageUrl: string }>("/teacher/upload", {
    method: "POST",
    body: formData,
    headers: authHeaders(false),
  });
  return data.imageUrl;
}

export async function fetchTeacherDashboardStats(): Promise<DashboardStats> {
  const data = await apiRequest<{
    dashboard: {
      stats: {
        totalSections: number;
        totalStudents: number;
        totalActiveQuests: number;
        averageStudentAccuracy: number;
      };
      overallTopStudent?: {
        student: {
          id: string;
          name: string;
          avatarUrl?: string | null;
          xp?: number;
          coins?: number;
        };
        accuracy: number;
        completionProgress: number;
        overallScore: number;
      } | null;
      topStudentPerSection?: Array<{ section: { id: string; name: string }; topStudent: unknown }>;
    };
  }>("/teacher/dashboard");
  const top = data.dashboard.overallTopStudent;
  const topStudent: TeacherStudent = top
    ? {
        id: top.student.id,
        name: top.student.name,
        classId: "",
        avatar: initials(top.student.name),
        avatarUrl: avatarUrl(top.student.avatarUrl),
        xp: top.student.xp ?? 0,
        coins: top.student.coins ?? 0,
        accuracy: Math.round(top.accuracy),
        completion: Math.round(top.completionProgress),
        quizAverage: Math.round(top.accuracy),
        gameScore: Math.round(top.overallScore),
        timeSpentMinutes: 0,
        weakAreas: [],
        status: "thriving",
      }
    : {
        id: "none",
        name: "No student yet",
        classId: "",
        avatar: "--",
        xp: 0,
        coins: 0,
        accuracy: 0,
        completion: 0,
        quizAverage: 0,
        gameScore: 0,
        timeSpentMinutes: 0,
        weakAreas: [],
        status: "steady",
      };
  const recentActivity: TeacherActivity[] =
    data.dashboard.topStudentPerSection?.map((item) => ({
      id: item.section.id,
      title: "Section leaderboard updated",
      detail: `${item.section.name} has current rankings available.`,
      timestamp: "Now",
      type: "module",
    })) ?? [];

  return {
    totalClasses: data.dashboard.stats.totalSections,
    totalStudents: data.dashboard.stats.totalStudents,
    activeModules: data.dashboard.stats.totalActiveQuests,
    averagePerformance: Math.round(data.dashboard.stats.averageStudentAccuracy),
    topStudent,
    atRiskStudents: [],
    recentActivity,
  };
}

export async function fetchTeacherClasses() {
  const data = await apiRequest<{ sections: TeacherSection[] }>("/teacher/classes");
  return data.sections.map(toTeacherClass);
}

export async function fetchTeacherSections() {
  const data = await apiRequest<{ sections: TeacherSection[] }>("/teacher/classes");
  return data.sections;
}

export async function fetchTeacherClass(classId: string) {
  const data = await apiRequest<TeacherClassDetails>(`/teacher/classes/${classId}`);
  return toTeacherClass({
    id: data.classInfo.id,
    name: data.classInfo.name,
    code: data.classInfo.code,
    students: data.students,
    quests: data.assignedQuests,
    questGuides: data.assignedGuides,
    _count: {
      studentSections: data.analytics.totalStudents,
      quests: data.assignedQuests.length,
      questGuides: data.assignedGuides.length,
    },
  });
}

export async function fetchTeacherClassDetails(classId: string) {
  return apiRequest<TeacherClassDetails>(`/teacher/classes/${classId}`);
}

export async function fetchTeacherSection(sectionId: string) {
  const data = await apiRequest<{ section: TeacherSection }>(`/teacher/sections/${sectionId}`);
  return data.section;
}

export async function createTeacherSection(input: { name: string; code?: string }) {
  const data = await apiRequest<{ section: TeacherSection }>("/teacher/classes", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.section;
}

export async function updateTeacherSection(
  sectionId: string,
  input: { name: string; code?: string },
) {
  const data = await apiRequest<{ section: TeacherSection }>(`/teacher/classes/${sectionId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return data.section;
}

export async function deleteTeacherSection(sectionId: string) {
  await apiRequest<unknown>(`/teacher/classes/${sectionId}`, { method: "DELETE" });
}

export async function fetchClassStudents(classId: string) {
  const data = await apiRequest<{ students: NonNullable<TeacherSection["students"]> }>(
    `/teacher/classes/${classId}/students`,
  );
  return data.students.map((student) => toTeacherStudent(student, classId));
}

export async function addStudentToSection(sectionId: string, email: string) {
  return apiRequest<{ section: TeacherSection }>(`/teacher/classes/${sectionId}/students`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function removeStudentFromSection(sectionId: string, studentId: string) {
  return apiRequest<{ section: TeacherSection }>(
    `/teacher/classes/${sectionId}/students/${studentId}`,
    {
      method: "DELETE",
    },
  );
}

export async function updateStudentGrade(
  sectionId: string,
  studentId: string,
  grade: number | null,
) {
  return apiRequest<{
    enrollment: { id: string; studentId: string; sectionId: string; grade: number | null };
  }>(`/teacher/classes/${sectionId}/students/${studentId}/grade`, {
    method: "PUT",
    body: JSON.stringify({ grade }),
  });
}

export async function fetchStudentProgress(studentId: string) {
  return apiRequest<{ progress: unknown }>(`/teacher/students/${studentId}/progress`);
}

export async function fetchTeacherGuides(sectionId?: string) {
  const path = sectionId
    ? `/teacher/classes/${encodeURIComponent(sectionId)}/quest-guides`
    : "/teacher/guides";
  const data = await apiRequest<{ guides: TeacherGuide[] }>(path);
  return data.guides;
}

export async function createTeacherGuide(input: Omit<TeacherGuide, "id">) {
  const path = input.sectionId
    ? `/teacher/classes/${encodeURIComponent(input.sectionId)}/quest-guides`
    : "/teacher/guides";
  const data = await apiRequest<{ guide: TeacherGuide }>(path, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.guide;
}

export async function updateTeacherGuide(
  guideId: string,
  input: Partial<Omit<TeacherGuide, "id">>,
) {
  const data = await apiRequest<{ guide: TeacherGuide }>(`/teacher/guides/${guideId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return data.guide;
}

export async function deleteTeacherGuide(guideId: string) {
  await apiRequest<unknown>(`/teacher/guides/${guideId}`, { method: "DELETE" });
}

export async function fetchTeacherQuests(sectionId?: string) {
  const path = sectionId
    ? `/teacher/classes/${encodeURIComponent(sectionId)}/quests`
    : "/teacher/quests";
  const data = await apiRequest<{ quests: TeacherQuest[] }>(path);
  return data.quests;
}

export async function createTeacherQuest(
  input: Omit<TeacherQuest, "id" | "questions"> & {
    questions?: Omit<TeacherQuestion, "id" | "difficulty">[];
  },
) {
  const path = input.sectionId
    ? `/teacher/classes/${encodeURIComponent(input.sectionId)}/quests`
    : "/teacher/quests";
  const data = await apiRequest<{ quest: TeacherQuest }>(path, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.quest;
}

export async function updateTeacherQuest(
  questId: string,
  input: Partial<Omit<TeacherQuest, "id" | "questions">>,
) {
  const data = await apiRequest<{ quest: TeacherQuest }>(`/teacher/quests/${questId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return data.quest;
}

export async function deleteTeacherQuest(questId: string) {
  await apiRequest<unknown>(`/teacher/quests/${questId}`, { method: "DELETE" });
}

export async function addQuestionToQuest(
  questId: string,
  question: Omit<TeacherQuestion, "id" | "difficulty">,
) {
  return apiRequest<{ questions: TeacherQuestion[] }>(`/teacher/quests/${questId}/questions`, {
    method: "POST",
    body: JSON.stringify(question),
  });
}

export async function deleteTeacherQuestion(questionId: string) {
  await apiRequest<unknown>(`/teacher/questions/${questionId}`, { method: "DELETE" });
}

export async function updateTeacherQuestion(
  questionId: string,
  input: Partial<Omit<TeacherQuestion, "id">>,
) {
  const data = await apiRequest<{ question: TeacherQuestion }>(`/teacher/questions/${questionId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return data.question;
}

export async function fetchTeacherAnalytics(
  sectionId?: string,
  range: "7d" | "30d" | "term" = "7d",
) {
  const params = new URLSearchParams();
  params.set("range", range);
  if (sectionId) params.set("sectionId", sectionId);
  try {
    const data = await apiRequest<{
      analytics: {
        points: AnalyticsPoint[];
        weakTopics: WeakTopic[];
        summary: {
          averageTimeSpent: number;
          accuracy: number;
          completion: number;
          totalAttempts: number;
        };
      };
    }>(`/teacher/analytics?${params.toString()}`);
    return data.analytics;
  } catch (error) {
    const sections = await fetchTeacherSections();
    const selectedSections = sectionId
      ? sections.filter((section) => section.id === sectionId)
      : sections;
    return {
      points: selectedSections.map((section) => ({
        label: section.name,
        completion: 0,
        accuracy: 0,
        gameScore: section._count?.quests ?? 0,
      })),
      weakTopics: [],
      summary: { averageTimeSpent: 0, accuracy: 0, completion: 0, totalAttempts: 0 },
    };
  }
}

export async function fetchTeacherLeaderboard(sectionId?: string) {
  const sections = await fetchTeacherSections();
  const targetSectionId = sectionId ?? sections[0]?.id;
  if (!targetSectionId) return [];
  const data = await apiRequest<{
    leaderboard: Array<{
      student: {
        id: string;
        name: string;
        avatarUrl?: string | null;
        xp?: number;
        coins?: number;
      };
      accuracy: number;
      completionProgress: number;
      xpEarned: number;
      coinsEarned: number;
      overallScore: number;
      totalTimeSpent: number;
    }>;
  }>(`/teacher/classes/${targetSectionId}/leaderboard`);

  return data.leaderboard.map(
    (row) =>
      ({
        id: row.student.id,
        name: row.student.name,
        classId: targetSectionId,
        avatar: initials(row.student.name),
        avatarUrl: avatarUrl(row.student.avatarUrl),
        xp: row.student.xp ?? row.xpEarned ?? 0,
        coins: row.student.coins ?? row.coinsEarned ?? 0,
        accuracy: Math.round(row.accuracy),
        completion: Math.round(row.completionProgress),
        quizAverage: Math.round(row.accuracy),
        gameScore: Math.round(row.overallScore),
        timeSpentMinutes: Math.round(row.totalTimeSpent / 60),
        weakAreas: [],
        status: row.accuracy >= 90 ? "thriving" : row.accuracy < 70 ? "at-risk" : "steady",
      }) satisfies TeacherStudent,
  );
}

export async function fetchTeacherModules(): Promise<TeacherModule[]> {
  const quests = await fetchTeacherQuests();
  return quests.map((quest) => ({
    id: quest.id,
    title: quest.title,
    topic: quest.topic,
    status: quest.isPublished ? "published" : "draft",
    lessonCount: 1,
    quizQuestionCount: quest.questions?.length ?? 0,
    gameQuestionCount: quest.questions?.length ?? 0,
    assignedClasses: [quest.sectionId],
    completionRate: 0,
  }));
}

export async function saveModuleDraft(module: TeacherModule) {
  return updateTeacherQuest(module.id, {
    title: module.title,
    topic: module.topic,
    worldName: module.title,
    difficulty: "Easy",
    isPublished: module.status === "published",
  });
}
