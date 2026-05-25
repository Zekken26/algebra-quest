-- Convert implicit class enrollment to explicit StudentSection enrollment.
-- This migration assumes existing Quest and QuestGuide rows are already assigned to a section
-- through the legacy "classId" column. Assign or remove unassigned rows before running it.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Quest" WHERE "classId" IS NULL) THEN
    RAISE EXCEPTION 'Cannot migrate: Quest rows with NULL classId exist. Assign them to a section before migrating.';
  END IF;

  IF EXISTS (SELECT 1 FROM "QuestGuide" WHERE "classId" IS NULL) THEN
    RAISE EXCEPTION 'Cannot migrate: QuestGuide rows with NULL classId exist. Assign them to a section before migrating.';
  END IF;
END $$;

CREATE TABLE "StudentSection" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "sectionId" TEXT NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudentSection_pkey" PRIMARY KEY ("id")
);

INSERT INTO "StudentSection" ("id", "studentId", "sectionId", "joinedAt")
SELECT concat('enr_', md5("_ClassStudents"."A" || ':' || "_ClassStudents"."B")), "_ClassStudents"."B", "_ClassStudents"."A", CURRENT_TIMESTAMP
FROM "_ClassStudents"
ON CONFLICT DO NOTHING;

ALTER TABLE "StudentProgress" ADD COLUMN "sectionId" TEXT;

UPDATE "StudentProgress"
SET "sectionId" = "Quest"."classId"
FROM "Quest"
WHERE "StudentProgress"."questId" = "Quest"."id";

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "StudentProgress" WHERE "sectionId" IS NULL) THEN
    RAISE EXCEPTION 'Cannot migrate: StudentProgress rows could not be mapped to a section.';
  END IF;
END $$;

DROP INDEX IF EXISTS "StudentProgress_studentId_questId_key";

ALTER TABLE "Quest" DROP CONSTRAINT IF EXISTS "Quest_classId_fkey";
ALTER TABLE "QuestGuide" DROP CONSTRAINT IF EXISTS "QuestGuide_classId_fkey";

ALTER TABLE "Quest" ALTER COLUMN "classId" SET NOT NULL;
ALTER TABLE "QuestGuide" ALTER COLUMN "classId" SET NOT NULL;
ALTER TABLE "StudentProgress" ALTER COLUMN "sectionId" SET NOT NULL;

CREATE UNIQUE INDEX "StudentSection_studentId_sectionId_key" ON "StudentSection"("studentId", "sectionId");
CREATE INDEX "StudentSection_sectionId_idx" ON "StudentSection"("sectionId");
CREATE INDEX "StudentSection_studentId_idx" ON "StudentSection"("studentId");
CREATE UNIQUE INDEX "StudentProgress_studentId_sectionId_questId_key" ON "StudentProgress"("studentId", "sectionId", "questId");
CREATE INDEX "StudentProgress_sectionId_idx" ON "StudentProgress"("sectionId");

ALTER TABLE "StudentSection" ADD CONSTRAINT "StudentSection_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentSection" ADD CONSTRAINT "StudentSection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuestGuide" ADD CONSTRAINT "QuestGuide_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP TABLE IF EXISTS "_ClassStudents";
