ALTER TABLE "AnswerAttempt" ADD COLUMN IF NOT EXISTS "sectionId" TEXT;

UPDATE "AnswerAttempt"
SET "sectionId" = "Quest"."classId"
FROM "Quest"
WHERE "AnswerAttempt"."questId" = "Quest"."id"
  AND "AnswerAttempt"."sectionId" IS NULL;

ALTER TABLE "AnswerAttempt" ALTER COLUMN "sectionId" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "AnswerAttempt_studentId_sectionId_questId_idx"
ON "AnswerAttempt"("studentId", "sectionId", "questId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AnswerAttempt_sectionId_fkey') THEN
    ALTER TABLE "AnswerAttempt"
    ADD CONSTRAINT "AnswerAttempt_sectionId_fkey"
    FOREIGN KEY ("sectionId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
