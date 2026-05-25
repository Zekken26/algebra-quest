import type { StudentModule, StudentProgress } from "@/features/student/types/student.types";
import { getAuth, saveAuth, type AuthUser } from "@/shared/services/api";

const PROGRESS_KEY = "aq_student_progress";
const PROGRESS_VERSION = 2;
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const PASSING_SCORE = 70;

type ApiPayload<T> = {
  success: boolean;
  data?: T;
  error?: {
    message?: string;
    code?: string;
    locked?: boolean;
    requiredLevel?: number;
    lockReason?: string;
  };
};

export class ApiRequestError extends Error {
  code?: string;
  locked?: boolean;
  requiredLevel?: number;
  lockReason?: string;

  constructor(error?: ApiPayload<unknown>["error"]) {
    super(error?.message ?? "Request failed. Please try again.");
    this.name = "ApiRequestError";
    this.code = error?.code;
    this.locked = error?.locked;
    this.requiredLevel = error?.requiredLevel;
    this.lockReason = error?.lockReason;
  }
}

export type StudentClass = {
  id: string;
  name: string;
  description?: string | null;
  code: string;
  joinedAt?: string;
  status?: string;
  teacher?: { id?: string; name: string };
  _count?: { questGuides?: number; quests?: number };
};

export type StudentEnrollmentStatus = {
  hasJoinedClass: boolean;
  sections: StudentClass[];
  message: string;
};

export type StudentAssignedQuest = {
  id: string;
  title: string;
  worldName: string;
  topic: string;
  difficulty: string;
  status?: "locked" | "unlocked" | "completed";
  locked?: boolean;
  requiredLevel?: number;
  lockReason?: string;
  requiredPuzzlePieces: number;
  maxHearts: number;
  hintLimit?: number;
  xpReward?: number;
  coinReward?: number;
  levelNumber: number;
  sectionId?: string;
  section?: { id: string; name: string };
  guideId?: string | null;
  guide?: {
    id: string;
    title: string;
    topic?: string;
    shortExplanation?: string;
    exampleProblem?: string;
    solutionSteps?: string[];
    tips?: string[];
  } | null;
  questions?: Array<{ id: string; equation: string; choices: string[]; difficulty: string }>;
  progress?: Array<{
    id: string;
    guideViewed: boolean;
    questUnlocked: boolean;
    questCompleted: boolean;
    score: number;
    xp: number;
    coins: number;
    coinsEarned: number;
    puzzlePieces: number;
    heartsRemaining: number;
    hintTokens: number;
    hintsUsed: number;
    correctAnswers: number;
    wrongAnswers: number;
    accuracy: number;
  }>;
  _count?: { questions?: number };
};

export type StudentQuestGuide = {
  id: string;
  title: string;
  topic: string;
  shortExplanation: string;
  exampleProblem: string;
  solutionSteps: string[];
  tips: string[];
  questId?: string | null;
  featuredQuest?: { id: string; title: string; levelNumber: number } | null;
  quests?: Array<{ id: string; title: string; levelNumber: number }>;
};

export type StudentClassProgress = {
  section: StudentClass;
  summary: {
    totalQuests: number;
    completedQuests: number;
    completionProgress: number;
    accuracy: number;
    timeSpent: number;
    xpEarned: number;
    coinsEarned: number;
  };
  quests: Array<{
    quest: Pick<
      StudentAssignedQuest,
      "id" | "title" | "topic" | "levelNumber" | "requiredPuzzlePieces"
    >;
    progress: NonNullable<StudentAssignedQuest["progress"]>[number] | null;
  }>;
};

export type StudentClassLeaderboardRow = {
  rank: number;
  student: { id: string; name: string; avatarUrl?: string | null };
  totalScore: number;
  completedQuests: number;
  totalQuests: number;
  completionProgress: number;
  accuracy: number;
  totalTimeSpent: number;
  xpEarned: number;
  coinsEarned: number;
  overallScore: number;
};

export type StudentQuestAnswerResult = {
  isCorrect: boolean;
  feedback: string;
  progress: NonNullable<StudentAssignedQuest["progress"]>[number];
  user?: StudentDashboardData["student"];
};

export type StudentDashboardData = {
  student: {
    id: string;
    name: string;
    email: string;
    role: "STUDENT";
    avatarUrl?: string | null;
    xp: number;
    coins: number;
    hintTokens: number;
    hearts: number;
  } | null;
  enrollment: StudentEnrollmentStatus;
  stats: {
    totalScore: number;
    totalXp: number;
    completedQuests: number;
    activeQuests: number;
  };
  progress: Array<NonNullable<StudentAssignedQuest["progress"]>[number] & { questId: string }>;
};

function authHeaders(json = true) {
  const auth = getAuth();
  const headers = new Headers();
  if (json) headers.set("Content-Type", "application/json");
  if (auth?.accessToken) headers.set("Authorization", `Bearer ${auth.accessToken}`);
  return headers;
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: options.headers ?? authHeaders(options.body instanceof FormData ? false : true),
  });

  const payload = (await response.json().catch(() => ({}))) as ApiPayload<T>;

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new ApiRequestError(payload.error);
  }

  return payload.data;
}

export async function fetchStudentEnrollmentStatus() {
  const data = await apiRequest<{ enrollment: StudentEnrollmentStatus }>(
    "/student/enrollment/status",
  );
  return data.enrollment;
}

export async function fetchStudentDashboard() {
  const dashboard = await apiRequest<StudentDashboardData>("/student/dashboard");
  if (dashboard.student) {
    saveAuth(mapBackendUser(dashboard.student));
  }
  return dashboard;
}

export function toStudentProgressFromDashboard(
  dashboard: StudentDashboardData,
  fallback = getStudentProgress(),
): StudentProgress {
  const student = dashboard.student;
  const completedQuests = dashboard.stats.completedQuests;
  const totalQuests = completedQuests + dashboard.stats.activeQuests;
  const currentLevel =
    dashboard.enrollment.sections[0]?.name ??
    dashboard.progress.find((item) => !item.questCompleted)?.questId ??
    fallback.currentLevel;

  return {
    ...fallback,
    xp: student?.xp ?? dashboard.stats.totalXp ?? fallback.xp,
    coins: student?.coins ?? fallback.coins,
    hintTokens: student?.hintTokens ?? fallback.hintTokens,
    hearts: student?.hearts ?? fallback.hearts,
    rank:
      completedQuests >= 10 ? "Algebra Hero" : completedQuests >= 5 ? "Quest Solver" : "Apprentice",
    currentLevel,
    modules: fallback.modules,
    activeQuestId:
      dashboard.progress.find((item) => item.questUnlocked && !item.questCompleted)?.questId ??
      fallback.activeQuestId,
  };
}

export function toStudentProgressFromUser(
  user: StudentDashboardData["student"] | undefined | null,
  fallback = getStudentProgress(),
): StudentProgress {
  if (!user) return fallback;

  return {
    ...fallback,
    xp: user.xp,
    coins: user.coins,
    hintTokens: user.hintTokens,
    hearts: user.hearts,
  };
}

export async function fetchStudentClasses() {
  const data = await apiRequest<{ classes?: StudentClass[]; sections?: StudentClass[] }>(
    "/student/classes",
  );
  return data.classes ?? data.sections ?? [];
}

export async function fetchStudentClass(classId: string) {
  const data = await apiRequest<{ class: StudentClass }>(`/student/classes/${classId}`);
  return data.class;
}

export async function fetchStudentClassQuestGuides(classId: string) {
  const data = await apiRequest<{ guides: StudentQuestGuide[] }>(
    `/student/classes/${classId}/quest-guides`,
  );
  return data.guides;
}

export async function fetchStudentClassQuests(classId: string) {
  const data = await apiRequest<{ quests: StudentAssignedQuest[] }>(
    `/student/classes/${classId}/quests`,
  );
  return data.quests;
}

export async function fetchStudentClassProgress(classId: string) {
  const data = await apiRequest<{ progress: StudentClassProgress }>(
    `/student/classes/${classId}/progress`,
  );
  return data.progress;
}

export async function fetchStudentClassLeaderboard(classId: string) {
  const data = await apiRequest<{ leaderboard: StudentClassLeaderboardRow[] }>(
    `/student/classes/${classId}/leaderboard`,
  );
  return data.leaderboard;
}

export async function fetchStudentAssignedQuests() {
  const data = await apiRequest<{ quests: StudentAssignedQuest[] }>("/student/quests");
  return data.quests;
}

export async function fetchStudentAssignedQuest(questId: string) {
  const data = await apiRequest<{ quest: StudentAssignedQuest }>(`/student/quests/${questId}`);
  return data.quest;
}

export async function markQuestGuideViewed(guideId: string) {
  const data = await apiRequest<{ guideViewed: boolean }>(`/student/quest-guides/${guideId}/view`, {
    method: "POST",
  });
  return data.guideViewed;
}

export async function startAssignedQuest(questId: string, classId?: string) {
  const data = await apiRequest<{
    progress: NonNullable<StudentAssignedQuest["progress"]>[number];
  }>(
    classId
      ? `/student/classes/${classId}/quests/${questId}/start`
      : `/student/quests/${questId}/start`,
    { method: "POST" },
  );
  return data.progress;
}

export async function answerAssignedQuestQuestion(
  questId: string,
  questionId: string,
  selectedAnswer: string,
  classId?: string,
) {
  const data = await apiRequest<StudentQuestAnswerResult>(
    classId
      ? `/student/classes/${classId}/quests/${questId}/answer`
      : `/student/quests/${questId}/answer`,
    {
      method: "POST",
      body: JSON.stringify({ questionId, selectedAnswer }),
    },
  );

  if (data.user) {
    saveAuth(mapBackendUser(data.user));
  }

  return data;
}

export async function useAssignedQuestHint(questId: string, questionId: string, classId?: string) {
  const data = await apiRequest<{
    hintStep: string | null;
    hintStepIndex: number;
    noMoreHints: boolean;
    progress: NonNullable<StudentAssignedQuest["progress"]>[number];
  }>(
    classId
      ? `/student/classes/${classId}/quests/${questId}/use-hint`
      : `/student/quests/${questId}/use-hint`,
    {
      method: "POST",
      body: JSON.stringify({ questionId }),
    },
  );
  return data;
}

export async function completeAssignedQuest(questId: string, timeSpent?: number, classId?: string) {
  const data = await apiRequest<{
    progress: NonNullable<StudentAssignedQuest["progress"]>[number];
  }>(
    classId
      ? `/student/classes/${classId}/quests/${questId}/complete`
      : `/student/quests/${questId}/complete`,
    {
      method: "POST",
      body: JSON.stringify({ timeSpent }),
    },
  );
  return data.progress;
}

export const studentModules: StudentModule[] = [
  {
    id: "variables",
    title: "Forest of Variables",
    topic: "Basic Addition",
    rank: "Level 1",
    description: "Begin with addition equations and collect the first relic pieces.",
    requiredPieces: 4,
    lesson: {
      id: "variables-guide",
      title: "Solving One-Step Equations",
      guideTitle: "Guide 1: Solving One-Step Equations",
      summary: "To solve an equation like x + 4 = 9, remove 4 from both sides.",
      example: "x + 4 = 9",
      steps: ["Subtract 4 from both sides", "x = 9 - 4", "x = 5"],
      tip: "Always do the same operation on both sides of the equation.",
      examples: [
        "x + 4 = 9 -> subtract 4 from both sides -> x = 5",
        "x + 7 = 12 -> subtract 7 from both sides -> x = 5",
      ],
    },
    quiz: [],
    gameQuestions: [
      {
        id: "v1",
        prompt: "x + 4 = 9",
        choices: ["3", "5", "13", "4"],
        answer: "5",
        explanation: "Subtract 4 from both sides. x = 5.",
        hint: "Step 1: subtract 4 from both sides.",
      },
      {
        id: "v2",
        prompt: "x + 7 = 12",
        choices: ["3", "5", "7", "19"],
        answer: "5",
        explanation: "Subtract 7 from both sides. x = 5.",
        hint: "Step 1: remove +7 using -7.",
      },
      {
        id: "v3",
        prompt: "x + 6 = 15",
        choices: ["8", "9", "11", "21"],
        answer: "9",
        explanation: "Subtract 6 from both sides. x = 9.",
        hint: "Step 1: subtract 6 from 15.",
      },
      {
        id: "v4",
        prompt: "x + 2 = 10",
        choices: ["5", "8", "12", "20"],
        answer: "8",
        explanation: "Subtract 2 from both sides. x = 8.",
        hint: "Step 1: undo +2.",
      },
    ],
  },
  {
    id: "subtraction",
    title: "Cave of Subtraction",
    topic: "Subtraction",
    rank: "Level 2",
    description: "Use addition to undo subtraction equations inside the cavern.",
    requiredPieces: 4,
    lesson: {
      id: "subtraction-guide",
      title: "Solving Subtraction Equations",
      guideTitle: "Guide 2: Solving Subtraction Equations",
      summary: "To solve x - 3 = 10, add 3 to both sides to isolate x.",
      example: "x - 3 = 10",
      steps: ["Add 3 to both sides", "x = 10 + 3", "x = 13"],
      tip: "Subtraction is undone with addition.",
      examples: ["x - 3 = 10 -> x = 13", "x - 8 = 4 -> x = 12"],
    },
    quiz: [],
    gameQuestions: [
      {
        id: "s1",
        prompt: "x - 3 = 10",
        choices: ["7", "13", "30", "12"],
        answer: "13",
        explanation: "Add 3 to both sides. x = 13.",
        hint: "Step 1: add 3 to both sides.",
      },
      {
        id: "s2",
        prompt: "x - 8 = 4",
        choices: ["2", "8", "12", "32"],
        answer: "12",
        explanation: "Add 8 to both sides. x = 12.",
        hint: "Step 1: undo -8 with +8.",
      },
      {
        id: "s3",
        prompt: "x - 5 = 11",
        choices: ["6", "16", "55", "15"],
        answer: "16",
        explanation: "Add 5 to both sides. x = 16.",
        hint: "Step 1: add 5.",
      },
      {
        id: "s4",
        prompt: "x - 9 = 6",
        choices: ["3", "15", "54", "12"],
        answer: "15",
        explanation: "Add 9 to both sides. x = 15.",
        hint: "Step 1: add 9 to 6.",
      },
    ],
  },
  {
    id: "multiplication",
    title: "Multiplication Mountains",
    topic: "Multiplication",
    rank: "Level 3",
    description: "Climb by dividing both sides when x is multiplied.",
    requiredPieces: 5,
    lesson: {
      id: "multiplication-guide",
      title: "Solving Multiplication Equations",
      guideTitle: "Guide 3: Solving Multiplication Equations",
      summary: "When a number is multiplied by x, divide both sides by that number.",
      example: "3x = 21",
      steps: ["Divide both sides by 3", "x = 21 / 3", "x = 7"],
      tip: "A number beside x means multiplication.",
      examples: ["3x = 21 -> x = 7", "4x = 20 -> x = 5"],
    },
    quiz: [],
    gameQuestions: [
      {
        id: "m1",
        prompt: "3x = 21",
        choices: ["6", "7", "18", "24"],
        answer: "7",
        explanation: "Divide both sides by 3. x = 7.",
        hint: "Step 1: divide 21 by 3.",
      },
      {
        id: "m2",
        prompt: "4x = 20",
        choices: ["4", "5", "16", "24"],
        answer: "5",
        explanation: "Divide both sides by 4. x = 5.",
        hint: "Step 1: divide by the coefficient 4.",
      },
      {
        id: "m3",
        prompt: "6x = 36",
        choices: ["5", "6", "30", "42"],
        answer: "6",
        explanation: "Divide both sides by 6. x = 6.",
        hint: "Step 1: 36 / 6.",
      },
      {
        id: "m4",
        prompt: "5x = 45",
        choices: ["8", "9", "40", "50"],
        answer: "9",
        explanation: "Divide both sides by 5. x = 9.",
        hint: "Step 1: split 45 into 5 groups.",
      },
      {
        id: "m5",
        prompt: "2x = 14",
        choices: ["6", "7", "8", "12"],
        answer: "7",
        explanation: "Divide both sides by 2. x = 7.",
        hint: "Step 1: halve 14.",
      },
    ],
  },
  {
    id: "division",
    title: "Division Dungeon",
    topic: "Division",
    rank: "Level 4",
    description: "Escape by multiplying both sides when x is divided.",
    requiredPieces: 5,
    lesson: {
      id: "division-guide",
      title: "Solving Division Equations",
      guideTitle: "Guide 4: Solving Division Equations",
      summary: "When x is divided by a number, multiply both sides by that number.",
      example: "x / 2 = 6",
      steps: ["Multiply both sides by 2", "x = 6 x 2", "x = 12"],
      tip: "Division is undone with multiplication.",
      examples: ["x / 2 = 6 -> x = 12", "x / 4 = 3 -> x = 12"],
    },
    quiz: [],
    gameQuestions: [
      {
        id: "d1",
        prompt: "x / 2 = 6",
        choices: ["3", "8", "12", "10"],
        answer: "12",
        explanation: "Multiply both sides by 2. x = 12.",
        hint: "Step 1: multiply 6 by 2.",
      },
      {
        id: "d2",
        prompt: "x / 4 = 3",
        choices: ["7", "12", "16", "1"],
        answer: "12",
        explanation: "Multiply both sides by 4. x = 12.",
        hint: "Step 1: undo /4 with x4.",
      },
      {
        id: "d3",
        prompt: "x / 5 = 9",
        choices: ["14", "40", "45", "4"],
        answer: "45",
        explanation: "Multiply both sides by 5. x = 45.",
        hint: "Step 1: multiply 9 by 5.",
      },
      {
        id: "d4",
        prompt: "x / 3 = 7",
        choices: ["10", "21", "4", "18"],
        answer: "21",
        explanation: "Multiply both sides by 3. x = 21.",
        hint: "Step 1: 7 times 3.",
      },
      {
        id: "d5",
        prompt: "x / 6 = 4",
        choices: ["10", "2", "24", "18"],
        answer: "24",
        explanation: "Multiply both sides by 6. x = 24.",
        hint: "Step 1: undo division by 6.",
      },
    ],
  },
  {
    id: "temple",
    title: "Temple of Equations",
    topic: "Multi-step Equations",
    rank: "Level 5",
    description: "Combine inverse operations to open the final gate.",
    requiredPieces: 6,
    lesson: {
      id: "temple-guide",
      title: "Solving Multi-step Equations",
      guideTitle: "Guide 5: Solving Multi-step Equations",
      summary: "Clear addition or subtraction first, then divide by the coefficient.",
      example: "2x + 3 = 11",
      steps: ["Subtract 3 from both sides", "2x = 8", "Divide both sides by 2", "x = 4"],
      tip: "Work from the outside toward x: constant first, coefficient second.",
      examples: ["2x + 3 = 11 -> x = 4", "3x - 6 = 12 -> x = 6"],
    },
    quiz: [],
    gameQuestions: [
      {
        id: "t1",
        prompt: "2x + 3 = 11",
        choices: ["3", "4", "7", "8"],
        answer: "4",
        explanation: "Subtract 3 to get 2x = 8, then divide by 2. x = 4.",
        hint: "Step 1: subtract 3.",
      },
      {
        id: "t2",
        prompt: "3x - 6 = 12",
        choices: ["4", "6", "9", "18"],
        answer: "6",
        explanation: "Add 6 to get 3x = 18, then divide by 3. x = 6.",
        hint: "Step 1: add 6.",
      },
      {
        id: "t3",
        prompt: "4x + 4 = 20",
        choices: ["4", "5", "6", "16"],
        answer: "4",
        explanation: "Subtract 4 to get 4x = 16, then divide by 4. x = 4.",
        hint: "Step 1: remove +4.",
      },
      {
        id: "t4",
        prompt: "5x - 5 = 25",
        choices: ["4", "5", "6", "10"],
        answer: "6",
        explanation: "Add 5 to get 5x = 30, then divide by 5. x = 6.",
        hint: "Step 1: add 5.",
      },
      {
        id: "t5",
        prompt: "6x + 6 = 42",
        choices: ["5", "6", "7", "8"],
        answer: "6",
        explanation: "Subtract 6 to get 6x = 36, then divide by 6. x = 6.",
        hint: "Step 1: subtract 6.",
      },
      {
        id: "t6",
        prompt: "2x - 8 = 18",
        choices: ["9", "10", "13", "26"],
        answer: "13",
        explanation: "Add 8 to get 2x = 26, then divide by 2. x = 13.",
        hint: "Step 1: add 8.",
      },
    ],
  },
];

const makeModuleProgress = (status: "locked" | "unlocked" | "completed") => ({
  status,
  completion: status === "unlocked" ? 10 : status === "completed" ? 100 : 0,
  guideViewed: false,
  quizPassed: false,
  bestQuizScore: 0,
  gameCompleted: status === "completed",
  relicPieces: 0,
  currentQuestionIndex: 0,
});

const createInitialProgress = (): StudentProgress => ({
  progressVersion: PROGRESS_VERSION,
  xp: 0,
  coins: 50,
  rank: "Apprentice",
  currentLevel: "Forest of Variables",
  hintTokens: 3,
  hearts: 3,
  activeQuestId: null,
  modules: {
    variables: makeModuleProgress("unlocked"),
    subtraction: makeModuleProgress("locked"),
    multiplication: makeModuleProgress("locked"),
    division: makeModuleProgress("locked"),
    temple: makeModuleProgress("locked"),
  },
});

function mergeProgress(progress: StudentProgress): StudentProgress {
  const initial = createInitialProgress();
  if (progress.progressVersion !== PROGRESS_VERSION) return initial;

  return {
    ...initial,
    ...progress,
    progressVersion: PROGRESS_VERSION,
    modules: Object.fromEntries(
      studentModules.map((module) => {
        const mergedModule = {
          ...initial.modules[module.id],
          ...progress.modules?.[module.id],
          relicPieces: Math.min(
            module.requiredPieces,
            Math.max(
              0,
              progress.modules?.[module.id]?.relicPieces ?? initial.modules[module.id].relicPieces,
            ),
          ),
          currentQuestionIndex: Math.max(
            0,
            progress.modules?.[module.id]?.currentQuestionIndex ?? 0,
          ),
        };

        return [
          module.id,
          {
            ...mergedModule,
            completion: mergedModule.gameCompleted
              ? 100
              : Math.round((mergedModule.relicPieces / module.requiredPieces) * 100),
          },
        ];
      }),
    ) as StudentProgress["modules"],
  };
}

export function getStudentModules() {
  return studentModules;
}

export function getStudentModule(moduleId: string) {
  return studentModules.find((module) => module.id === moduleId);
}

export function getStudentProgress(): StudentProgress {
  if (typeof window === "undefined") return createInitialProgress();

  const stored = window.localStorage.getItem(PROGRESS_KEY);
  if (!stored) return createInitialProgress();

  try {
    return mergeProgress(JSON.parse(stored) as StudentProgress);
  } catch {
    return createInitialProgress();
  }
}

export function saveStudentProgress(progress: StudentProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function updateStudentProgress(updater: (progress: StudentProgress) => StudentProgress) {
  const nextProgress = updater(getStudentProgress());
  saveStudentProgress(nextProgress);
  return nextProgress;
}

export type UpdateStudentProfileInput = {
  name: string;
  email: string;
  avatar?: File | null;
  removeAvatar: boolean;
};

function mapBackendUser(user: {
  id?: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "student" | "teacher";
  avatarUrl?: string | null;
  xp?: number;
  coins?: number;
  hintTokens?: number;
  hearts?: number;
}): AuthUser {
  const existingAuth = getAuth();

  return {
    ...existingAuth,
    id: user.id ?? existingAuth?.id,
    name: user.name,
    email: user.email,
    role: user.role.toString().toLowerCase() === "teacher" ? "teacher" : "student",
    avatarUrl: user.avatarUrl ?? null,
    xp: user.xp ?? existingAuth?.xp,
    coins: user.coins ?? existingAuth?.coins,
    hintTokens: user.hintTokens ?? existingAuth?.hintTokens,
    hearts: user.hearts ?? existingAuth?.hearts,
  };
}

export function resolveAvatarUrl(avatarUrl?: string | null) {
  if (!avatarUrl) return "";
  if (
    /^https?:\/\//i.test(avatarUrl) ||
    avatarUrl.startsWith("blob:") ||
    avatarUrl.startsWith("data:")
  ) {
    return avatarUrl;
  }

  return `${API_BASE_URL.replace(/\/api\/?$/, "")}${avatarUrl}`;
}

export async function updateStudentProfile(input: UpdateStudentProfileInput) {
  const auth = getAuth();

  if (!auth) {
    throw new Error("Sign in before updating your profile.");
  }

  const formData = new FormData();
  formData.set("name", input.name);
  formData.set("email", input.email);
  formData.set("removeAvatar", String(input.removeAvatar));

  if (input.avatar) {
    formData.set("avatar", input.avatar);
  }

  const response = await fetch(`${API_BASE_URL}/student/profile`, {
    method: "PUT",
    credentials: "include",
    headers: {
      ...(auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {}),
    },
    body: formData,
  });

  const payload = (await response.json()) as {
    success: boolean;
    data?: { user: Parameters<typeof mapBackendUser>[0] };
    error?: { message?: string };
  };

  if (!response.ok || !payload.success || !payload.data?.user) {
    throw new Error(payload.error?.message ?? "Unable to save profile.");
  }

  const updatedUser = mapBackendUser(payload.data.user);
  saveAuth(updatedUser);
  return updatedUser;
}

export async function joinClassByCode(classCode: string) {
  const auth = getAuth();

  if (!auth) {
    throw new Error("Sign in before joining a class.");
  }

  const response = await fetch(`${API_BASE_URL}/student/classes/join`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {}),
    },
    body: JSON.stringify({ classCode: classCode.trim().toUpperCase() }),
  });

  const payload = (await response.json()) as {
    success: boolean;
    data?: { class?: { id: string; name: string; code: string; teacher?: { name: string } } };
    error?: { message?: string };
  };

  if (!response.ok || !payload.success || !payload.data?.class) {
    throw new Error(payload.error?.message ?? "Unable to join class.");
  }

  return payload.data.class;
}

export type ShopItemType = "health" | "hint" | "skip";

export async function purchaseShopItem(itemType: ShopItemType, questId?: string) {
  const auth = getAuth();

  if (!auth) return null;

  const response = await fetch(`${API_BASE_URL}/student/shop/purchase`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {}),
    },
    body: JSON.stringify({ itemType, questId }),
  });

  const payload = (await response.json()) as {
    success: boolean;
    data?: { user: Parameters<typeof mapBackendUser>[0] };
    error?: { message?: string };
  };

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message ?? "Unable to complete purchase.");
  }

  if (payload.data?.user) {
    const updatedUser = mapBackendUser(payload.data.user);
    saveAuth(updatedUser);
  }

  return payload.data ?? null;
}
