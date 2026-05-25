-- Add Google Classroom-style class metadata and explicit earned-coin progress.
-- Prisma model names are ClassSection and Enrollment, mapped to the existing
-- "Class" and "StudentSection" tables to avoid destructive table renames.

ALTER TABLE "Class"
ADD COLUMN "description" TEXT;

ALTER TABLE "StudentProgress"
ADD COLUMN "coinsEarned" INTEGER NOT NULL DEFAULT 0;

UPDATE "StudentProgress" AS progress
SET "coinsEarned" = CASE
  WHEN progress."questCompleted" THEN quest."requiredPuzzlePieces" * 10
  ELSE 0
END
FROM "Quest" AS quest
WHERE progress."questId" = quest."id";
