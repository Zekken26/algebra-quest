DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AssignmentStatus') THEN
    CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'QuestAttemptStatus') THEN
    CREATE TYPE "QuestAttemptStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'FAILED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "Assignment" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "instructions" TEXT,
  "teacherId" TEXT NOT NULL,
  "sectionId" TEXT NOT NULL,
  "questId" TEXT NOT NULL,
  "availableFrom" TIMESTAMP(3),
  "availableUntil" TIMESTAMP(3),
  "dueDate" TIMESTAMP(3),
  "passingScore" INTEGER NOT NULL DEFAULT 70,
  "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "QuestAttempt" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "sectionId" TEXT NOT NULL,
  "questId" TEXT NOT NULL,
  "attemptNo" INTEGER NOT NULL,
  "status" "QuestAttemptStatus" NOT NULL DEFAULT 'ACTIVE',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "QuestAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "QuestionProgress" (
  "id" TEXT NOT NULL,
  "attemptId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "sectionId" TEXT NOT NULL,
  "questId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "selectedAnswer" TEXT,
  "isCorrect" BOOLEAN,
  "answeredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "QuestionProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Assignment_sectionId_questId_key" ON "Assignment"("sectionId", "questId");
CREATE INDEX IF NOT EXISTS "Assignment_teacherId_idx" ON "Assignment"("teacherId");
CREATE INDEX IF NOT EXISTS "Assignment_sectionId_idx" ON "Assignment"("sectionId");
CREATE INDEX IF NOT EXISTS "Assignment_questId_idx" ON "Assignment"("questId");
CREATE INDEX IF NOT EXISTS "Assignment_status_idx" ON "Assignment"("status");

CREATE UNIQUE INDEX IF NOT EXISTS "QuestAttempt_studentId_questId_attemptNo_key" ON "QuestAttempt"("studentId", "questId", "attemptNo");
CREATE INDEX IF NOT EXISTS "QuestAttempt_studentId_sectionId_questId_status_idx" ON "QuestAttempt"("studentId", "sectionId", "questId", "status");
CREATE INDEX IF NOT EXISTS "QuestAttempt_sectionId_idx" ON "QuestAttempt"("sectionId");
CREATE INDEX IF NOT EXISTS "QuestAttempt_questId_idx" ON "QuestAttempt"("questId");

CREATE UNIQUE INDEX IF NOT EXISTS "QuestionProgress_attemptId_questionId_key" ON "QuestionProgress"("attemptId", "questionId");
CREATE INDEX IF NOT EXISTS "QuestionProgress_studentId_sectionId_questId_idx" ON "QuestionProgress"("studentId", "sectionId", "questId");
CREATE INDEX IF NOT EXISTS "QuestionProgress_questionId_idx" ON "QuestionProgress"("questionId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Assignment_teacherId_fkey') THEN
    ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Assignment_sectionId_fkey') THEN
    ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Assignment_questId_fkey') THEN
    ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'QuestAttempt_studentId_fkey') THEN
    ALTER TABLE "QuestAttempt" ADD CONSTRAINT "QuestAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'QuestAttempt_sectionId_fkey') THEN
    ALTER TABLE "QuestAttempt" ADD CONSTRAINT "QuestAttempt_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'QuestAttempt_questId_fkey') THEN
    ALTER TABLE "QuestAttempt" ADD CONSTRAINT "QuestAttempt_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'QuestionProgress_attemptId_fkey') THEN
    ALTER TABLE "QuestionProgress" ADD CONSTRAINT "QuestionProgress_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "QuestAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'QuestionProgress_studentId_fkey') THEN
    ALTER TABLE "QuestionProgress" ADD CONSTRAINT "QuestionProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'QuestionProgress_sectionId_fkey') THEN
    ALTER TABLE "QuestionProgress" ADD CONSTRAINT "QuestionProgress_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'QuestionProgress_questId_fkey') THEN
    ALTER TABLE "QuestionProgress" ADD CONSTRAINT "QuestionProgress_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'QuestionProgress_questionId_fkey') THEN
    ALTER TABLE "QuestionProgress" ADD CONSTRAINT "QuestionProgress_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
