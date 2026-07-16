export type TeacherNavItem =
  | "dashboard"
  | "classes"
  | "modules"
  | "analytics"
  | "leaderboard"
  | "profile";

export type TeacherClass = {
  id: string;
  name: string;
  code?: string;
  section: string;
  gradeLevel: string;
  studentCount: number;
  averagePerformance: number;
  activeModules: number;
  atRiskCount: number;
};

export type TeacherStudent = {
  id: string;
  name: string;
  email?: string;
  classId: string;
  avatar: string;
  avatarUrl?: string | null;
  xp: number;
  coins: number;
  grade?: number | null;
  accuracy: number;
  completion: number;
  quizAverage: number;
  gameScore: number;
  timeSpentMinutes: number;
  weakAreas: string[];
  currentQuest?: string;
  status: "thriving" | "steady" | "at-risk";
  lastLoginAt?: string | null;
  totalAttempts?: number;
  correctAttempts?: number;
};

export type TeacherModule = {
  id: string;
  title: string;
  topic: string;
  status: "draft" | "published";
  lessonCount: number;
  quizQuestionCount: number;
  gameQuestionCount: number;
  assignedClasses: string[];
  completionRate: number;
};

export type TeacherActivity = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  type: "quiz" | "game" | "module" | "risk";
};

export type DashboardStats = {
  totalClasses: number;
  totalStudents: number;
  activeModules: number;
  averagePerformance: number;
  topStudent: TeacherStudent;
  atRiskStudents: TeacherStudent[];
  recentActivity: TeacherActivity[];
};

export type ActivityType = "QUEST" | "ASSIGNMENT" | "PRE_TEST" | "ASSESSMENT";

export type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "IDENTIFICATION" | "MATCHING" | "ENUMERATION" | "SHORT_ANSWER" | "ESSAY";

export type SubmissionType = "FILE_UPLOAD" | "ESSAY" | "SHORT_ANSWER" | "MULTIPLE_CHOICE" | "ATTACHMENTS";

export type ClassContentType = "ASSIGNMENT" | "PRETEST" | "ASSESSMENT";

export type SubmissionStatus = "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED" | "OVERDUE" | "GRADED";

export type ClassContentQuestion = {
  id: string;
  equation: string;
  questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "IDENTIFICATION" | "MATCHING" | "ENUMERATION" | "SHORT_ANSWER" | "ESSAY";
  choices: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
  difficulty: string;
  imageUrl?: string | null;
  matchingPairs?: Array<{ left: string; right: string }> | null;
  enumerationItems?: string[];
  isCorrect?: boolean | null;
};

export type ClassContentItem = {
  id: string;
  title: string;
  type: ClassContentType;
  description: string | null;
  instructions: string | null;
  dueDate: string | null;
  availableFrom: string | null;
  availableTo: string | null;
  submissionType: string | null;
  submissionTypes?: string[];
  timeLimitMinutes: number | null;
  maxScore: number | null;
  isPublished: boolean;
  passingScore?: number | null;
  shuffleQuestions?: boolean;
  shuffleChoices?: boolean;
  attemptsAllowed?: number;
  showScoreImmediately?: boolean;
  randomQuestions?: number | null;
  autoGrade?: boolean;
  teacherId: string;
  sectionId: string;
  createdAt: string;
  updatedAt: string;
  questions: ClassContentQuestion[];
  _count?: { questions: number; attempts: number };
};

export type ActivityQuestRef = {
  id: string;
  title: string;
  worldName: string;
  topic: string;
  difficulty: string;
  levelNumber: number;
  isPublished: boolean;
  _count?: { questions: number; progress: number };
};

export type ActivityContentRef = ClassContentItem;

export type ActivityItem = {
  id: string;
  type: ActivityType;
  title: string;
  description: string | null;
  dueDate: string | null;
  availableFrom: string | null;
  availableTo: string | null;
  totalPoints: number | null;
  isPublished: boolean;
  orderIndex: number;
  teacherId: string;
  sectionId: string;
  questId: string | null;
  contentId: string | null;
  createdAt: string;
  updatedAt: string;
  quest: ActivityQuestRef | null;
  content: ActivityContentRef | null;
  _count: { submissions: number };
};

export type AnalyticsPoint = {
  label: string;
  completion: number;
  accuracy: number;
  gameScore: number;
};

export type WeakTopic = {
  topic: string;
  intensity: number;
  studentsImpacted: number;
};
