-- ClassContent is the source of truth for student-facing class content. Keep its
-- paired Activity listing row synchronized so published content is discoverable.
UPDATE "Activity" AS activity
SET
  "title" = content."title",
  "description" = content."description",
  "dueDate" = content."dueDate",
  "availableFrom" = content."availableFrom",
  "availableTo" = content."availableTo",
  "totalPoints" = content."maxScore",
  "isPublished" = content."isPublished",
  "updatedAt" = CURRENT_TIMESTAMP
FROM "ClassContent" AS content
WHERE activity."contentId" = content."id";

-- Matches the authorization and visibility predicate used by student activity listings.
CREATE INDEX IF NOT EXISTS "Activity_sectionId_isPublished_availableFrom_availableTo_idx"
ON "Activity" ("sectionId", "isPublished", "availableFrom", "availableTo");
