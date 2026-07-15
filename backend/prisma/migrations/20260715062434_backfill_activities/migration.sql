-- Backfill existing Quests into Activity table
INSERT INTO "Activity" ("id", "type", "title", "description", "dueDate", "availableFrom", "availableTo", "totalPoints", "isPublished", "orderIndex", "teacherId", "sectionId", "questId", "contentId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  'QUEST'::"ActivityType",
  q."title",
  q."topic",
  NULL,
  NULL,
  NULL,
  NULL,
  q."isPublished",
  q."levelNumber",
  q."teacherId",
  q."classId",
  q."id",
  NULL,
  q."createdAt",
  q."updatedAt"
FROM "Quest" q
WHERE NOT EXISTS (
  SELECT 1 FROM "Activity" a WHERE a."questId" = q."id"
);

-- Backfill existing ClassContent into Activity table
INSERT INTO "Activity" ("id", "type", "title", "description", "dueDate", "availableFrom", "availableTo", "totalPoints", "isPublished", "orderIndex", "teacherId", "sectionId", "questId", "contentId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  CASE
    WHEN cc."type" = 'ASSIGNMENT' THEN 'ASSIGNMENT'::"ActivityType"
    WHEN cc."type" = 'PRETEST' THEN 'PRE_TEST'::"ActivityType"
    WHEN cc."type" = 'ASSESSMENT' THEN 'ASSESSMENT'::"ActivityType"
  END,
  cc."title",
  cc."description",
  cc."dueDate",
  cc."availableFrom",
  cc."availableTo",
  cc."maxScore",
  cc."isPublished",
  0,
  cc."teacherId",
  cc."sectionId",
  NULL,
  cc."id",
  cc."createdAt",
  cc."updatedAt"
FROM "ClassContent" cc
WHERE NOT EXISTS (
  SELECT 1 FROM "Activity" a WHERE a."contentId" = cc."id"
);
