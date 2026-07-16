-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'IDENTIFICATION', 'MATCHING', 'ENUMERATION', 'SHORT_ANSWER', 'ESSAY');

-- CreateEnum
CREATE TYPE "SubmissionType" AS ENUM ('FILE_UPLOAD', 'ESSAY', 'SHORT_ANSWER', 'MULTIPLE_CHOICE', 'ATTACHMENTS');

-- AlterTable
ALTER TABLE "ClassContent" ADD COLUMN     "attemptsAllowed" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "autoGrade" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "passingScore" INTEGER,
ADD COLUMN     "randomQuestions" INTEGER,
ADD COLUMN     "showScoreImmediately" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "shuffleChoices" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shuffleQuestions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "submissionTypes" "SubmissionType"[];

-- AlterTable
ALTER TABLE "ContentQuestion" ADD COLUMN     "enumerationItems" TEXT[],
ADD COLUMN     "isCorrect" BOOLEAN,
ADD COLUMN     "matchingPairs" JSONB,
ADD COLUMN     "questionType" "QuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE';
