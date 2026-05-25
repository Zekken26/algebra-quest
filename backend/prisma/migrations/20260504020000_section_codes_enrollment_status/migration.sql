-- Add join-code based enrollment and soft-removal status for section memberships.

CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'REMOVED');

ALTER TABLE "Class"
ADD COLUMN "code" TEXT;

UPDATE "Class"
SET "code" = upper(substring(md5("id") from 1 for 6))
WHERE "code" IS NULL;

ALTER TABLE "Class"
ALTER COLUMN "code" SET NOT NULL;

CREATE UNIQUE INDEX "Class_code_key" ON "Class"("code");

ALTER TABLE "StudentSection"
ADD COLUMN "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE';

CREATE INDEX "StudentSection_status_idx" ON "StudentSection"("status");
