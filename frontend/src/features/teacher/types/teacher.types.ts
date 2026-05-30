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
