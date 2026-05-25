// UI auth profile cache. Session authority lives in the backend HttpOnly cookie.
export type Role = "student" | "teacher";
export type AuthUser = {
  id?: string;
  email: string;
  role: Role;
  name: string;
  avatarUrl?: string | null;
  xp?: number;
  coins?: number;
  hintTokens?: number;
  hearts?: number;
  accessToken?: string;
};

const AUTH_KEY = "aq_auth";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export function saveAuth(user: AuthUser) {
  const { accessToken: _accessToken, ...safeUser } = user;
  localStorage.setItem(AUTH_KEY, JSON.stringify(safeUser));
}
export function getAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}
export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  if (typeof window !== "undefined") {
    void fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);
  }
}

export function resolveAvatarUrl(avatarUrl?: string | null) {
  if (!avatarUrl) return null;
  if (
    /^https?:\/\//i.test(avatarUrl) ||
    avatarUrl.startsWith("blob:") ||
    avatarUrl.startsWith("data:")
  ) {
    return avatarUrl;
  }

  return `${API_BASE_URL.replace(/\/api\/?$/, "")}${avatarUrl}`;
}

export type Question = {
  id: string;
  text: string;
  choices: string[];
  answer: string;
  hint: string[];
};

export type Level = {
  id: string;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  requiredPieces: number;
  questionIds: string[];
};

export type Lesson = {
  id: string;
  title: string;
  content: string;
};

export type Module = {
  id: string;
  name: string;
  lessonIds: string[];
  levelIds: string[];
};

export const MOCK_LESSONS: Lesson[] = [
  {
    id: "LS1",
    title: "Introduction to Algebra",
    content: "Learn what algebra is and why variables are used to represent unknown values.",
  },
  {
    id: "LS2",
    title: "Variables and Expressions",
    content: "Understand how to translate words into algebraic expressions.",
  },
  {
    id: "LS3",
    title: "Order of Operations",
    content: "Follow the correct sequence (PEMDAS) to solve expressions accurately.",
  },
  {
    id: "LS4",
    title: "Simplifying Algebraic Expressions",
    content: "Combine like terms and make expressions easier to work with.",
  },
  {
    id: "LS5",
    title: "Solving One-Step Equations",
    content: "Solve basic equations using inverse operations.",
  },
  {
    id: "LS6",
    title: "Solving Multi-Step Equations",
    content: "Work through more complex equations step-by-step.",
  },
  {
    id: "LS7",
    title: "Inequalities",
    content: "Learn how to solve and graph inequalities.",
  },
  {
    id: "LS8",
    title: "Graphing on the Coordinate Plane",
    content: "Plot points and understand coordinates (x, y).",
  },
  {
    id: "LS9",
    title: "Linear Equations and Slope",
    content: "Explore slope, intercepts, and straight-line graphs.",
  },
  {
    id: "LS10",
    title: "Systems of Equations",
    content: "Solve problems with two or more equations.",
  },
  {
    id: "LS11",
    title: "Polynomials",
    content: "Understand expressions with multiple terms.",
  },
  {
    id: "LS12",
    title: "Factoring",
    content: "Break down expressions into simpler components.",
  },
  {
    id: "LS13",
    title: "Quadratic Equations",
    content: "Solve equations with squared variables.",
  },
  {
    id: "LS14",
    title: "Functions and Function Notation",
    content: "Understand input-output relationships.",
  },
  {
    id: "LS15",
    title: "Exponents and Radicals",
    content: "Work with powers and roots.",
  },
];

export const MOCK_MODULES: Module[] = [
  {
    id: "M1",
    name: "Algebra Basics",
    lessonIds: ["LS1", "LS2"],
    levelIds: ["L1", "L2"],
  },
];

export const MOCK_QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "x + 4 = 9",
    choices: ["3", "5", "13", "4"],
    answer: "5",
    hint: ["Subtract 4 from both sides.", "x = 9 - 4", "x = 5"],
  },
  {
    id: "q2",
    text: "2x = 14",
    choices: ["6", "8", "7", "12"],
    answer: "7",
    hint: ["Divide both sides by 2.", "x = 14 / 2", "x = 7"],
  },
  {
    id: "q3",
    text: "x - 3 = 10",
    choices: ["7", "13", "30", "12"],
    answer: "13",
    hint: ["Add 3 to both sides.", "x = 10 + 3", "x = 13"],
  },
  {
    id: "q4",
    text: "3x + 1 = 10",
    choices: ["2", "3", "4", "5"],
    answer: "3",
    hint: ["Subtract 1: 3x = 9", "Divide by 3: x = 3"],
  },
  {
    id: "q5",
    text: "x / 2 = 6",
    choices: ["3", "8", "12", "10"],
    answer: "12",
    hint: ["Multiply both sides by 2.", "x = 12"],
  },
];

export const MOCK_LEVELS: Level[] = [
  {
    id: "L1",
    name: "Forest of Variables",
    difficulty: "Easy",
    requiredPieces: 5,
    questionIds: ["q1", "q2", "q3", "q4", "q5"],
  },
  {
    id: "L2",
    name: "Cavern of Coefficients",
    difficulty: "Medium",
    requiredPieces: 5,
    questionIds: ["q4", "q5", "q1", "q2", "q3"],
  },
];

export const MOCK_STUDENTS = [
  { name: "Aria Stone", level: "Forest of Variables", progress: 80, score: 420 },
  { name: "Bran Oakheart", level: "Forest of Variables", progress: 40, score: 180 },
  { name: "Lyra Mistwood", level: "Cavern of Coefficients", progress: 60, score: 310 },
  { name: "Kael Emberfall", level: "Forest of Variables", progress: 100, score: 500 },
  { name: "Mira Dawnleaf", level: "Cavern of Coefficients", progress: 25, score: 95 },
];
