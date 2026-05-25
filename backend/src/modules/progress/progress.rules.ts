import { AppError } from "../../utils/AppError";

export function canContinueProgress(progress: {
  questUnlocked: boolean;
  questCompleted: boolean;
  heartsRemaining: number;
} | null | undefined) {
  return Boolean(progress?.questUnlocked && !progress.questCompleted && progress.heartsRemaining > 0);
}

export function assertQuestionCanBeAnswered(questionProgress: { answeredAt: Date | null } | null | undefined) {
  if (questionProgress?.answeredAt) {
    throw new AppError("This question was already answered in the current attempt.", 409, "QUESTION_ALREADY_ANSWERED");
  }
}

export function assertHintTokensAvailable(hintTokens: number) {
  if (hintTokens <= 0) {
    throw new AppError("No hint tokens remaining. Buy a hint from the Quest Shop.", 409, "NO_HINT_TOKENS");
  }
}

export function assertActiveEnrollment(enrollment: { status: string } | null | undefined) {
  if (!enrollment || enrollment.status !== "ACTIVE") {
    throw new AppError("You are not enrolled in this section.", 403, "SECTION_NOT_ENROLLED");
  }
}

export function assertTeacherOwnsResource(resource: { teacherId: string } | null | undefined, teacherId: string) {
  if (!resource) {
    throw new AppError("Resource was not found.", 404, "RESOURCE_NOT_FOUND");
  }

  if (resource.teacherId !== teacherId) {
    throw new AppError("You cannot access another teacher's resource.", 403, "RESOURCE_FORBIDDEN");
  }
}
