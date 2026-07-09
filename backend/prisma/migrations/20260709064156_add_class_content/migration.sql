-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('ASSIGNMENT', 'PRETEST', 'ASSESSMENT');

-- CreateTable
CREATE TABLE "ClassContent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "instructions" TEXT,
    "timeLimitMinutes" INTEGER,
    "maxScore" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "teacherId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentQuestion" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "equation" TEXT NOT NULL,
    "choices" TEXT[],
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT NOT NULL DEFAULT '',
    "points" INTEGER NOT NULL DEFAULT 1,
    "difficulty" TEXT NOT NULL DEFAULT 'Medium',
    "imageUrl" TEXT,

    CONSTRAINT "ContentQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentAttempt" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "score" INTEGER,
    "maxScore" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ContentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedAnswer" TEXT,
    "isCorrect" BOOLEAN NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassContent_teacherId_idx" ON "ClassContent"("teacherId");

-- CreateIndex
CREATE INDEX "ClassContent_sectionId_idx" ON "ClassContent"("sectionId");

-- CreateIndex
CREATE INDEX "ContentQuestion_contentId_idx" ON "ContentQuestion"("contentId");

-- CreateIndex
CREATE INDEX "ContentAttempt_contentId_studentId_idx" ON "ContentAttempt"("contentId", "studentId");

-- CreateIndex
CREATE INDEX "ContentAttempt_studentId_idx" ON "ContentAttempt"("studentId");

-- CreateIndex
CREATE INDEX "ContentAnswer_attemptId_idx" ON "ContentAnswer"("attemptId");

-- AddForeignKey
ALTER TABLE "ClassContent" ADD CONSTRAINT "ClassContent_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassContent" ADD CONSTRAINT "ClassContent_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentQuestion" ADD CONSTRAINT "ContentQuestion_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ClassContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentAttempt" ADD CONSTRAINT "ContentAttempt_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ClassContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentAttempt" ADD CONSTRAINT "ContentAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentAttempt" ADD CONSTRAINT "ContentAttempt_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentAnswer" ADD CONSTRAINT "ContentAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "ContentAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentAnswer" ADD CONSTRAINT "ContentAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ContentQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
