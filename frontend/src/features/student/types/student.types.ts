export type ModuleStatus = "locked" | "unlocked" | "completed";

export type QuizStatus = "idle" | "correct" | "wrong";

export type AlgebraQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  answer: string;
  explanation: string;
  hint: string;
};

export type StudentLesson = {
  id: string;
  title: string;
  guideTitle?: string;
  summary: string;
  example: string;
  steps: string[];
  tip: string;
  examples: string[];
};

export type StudentModule = {
  id: string;
  title: string;
  topic: string;
  rank: string;
  description: string;
  lesson: StudentLesson;
  quiz: AlgebraQuestion[];
  gameQuestions: AlgebraQuestion[];
  requiredPieces: number;
};

export type QuizResult = {
  score: number;
  total: number;
  passed: boolean;
  mistakes: Array<{
    question: AlgebraQuestion;
    selectedAnswer: string | null;
  }>;
};

export type StudentProgress = {
  progressVersion: number;
  xp: number;
  coins: number;
  rank: string;
  currentLevel: string;
  hintTokens: number;
  hearts: number;
  activeQuestId?: string | null;
  modules: Record<
    string,
    {
      status: ModuleStatus;
      completion: number;
      guideViewed: boolean;
      quizPassed: boolean;
      bestQuizScore: number;
      gameCompleted: boolean;
      relicPieces: number;
      currentQuestionIndex: number;
      badge?: string;
      answeredQuestionIds?: string[];
    }
  >;
};
