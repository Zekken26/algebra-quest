-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('QUEST', 'ASSIGNMENT', 'PRE_TEST', 'ASSESSMENT');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'OVERDUE', 'GRADED');

-- AlterTable
ALTER TABLE "ClassContent" ADD COLUMN     "availableFrom" TIMESTAMP(3),
ADD COLUMN     "availableTo" TIMESTAMP(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "submissionType" TEXT DEFAULT 'quiz';

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "availableFrom" TIMESTAMP(3),
    "availableTo" TIMESTAMP(3),
    "totalPoints" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "teacherId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "questId" TEXT,
    "contentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivitySubmission" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "gradedAt" TIMESTAMP(3),
    "teacherFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivitySubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Activity_questId_key" ON "Activity"("questId");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_contentId_key" ON "Activity"("contentId");

-- CreateIndex
CREATE INDEX "Activity_teacherId_idx" ON "Activity"("teacherId");

-- CreateIndex
CREATE INDEX "Activity_sectionId_idx" ON "Activity"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_sectionId_questId_key" ON "Activity"("sectionId", "questId");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_sectionId_contentId_key" ON "Activity"("sectionId", "contentId");

-- CreateIndex
CREATE INDEX "ActivitySubmission_studentId_idx" ON "ActivitySubmission"("studentId");

-- CreateIndex
CREATE INDEX "ActivitySubmission_sectionId_idx" ON "ActivitySubmission"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivitySubmission_activityId_studentId_key" ON "ActivitySubmission"("activityId", "studentId");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ClassContent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySubmission" ADD CONSTRAINT "ActivitySubmission_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySubmission" ADD CONSTRAINT "ActivitySubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySubmission" ADD CONSTRAINT "ActivitySubmission_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
