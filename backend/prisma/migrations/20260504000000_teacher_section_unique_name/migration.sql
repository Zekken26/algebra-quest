-- Prevent duplicate section names for the same teacher at the database layer.
CREATE UNIQUE INDEX "Class_teacherId_name_key" ON "Class"("teacherId", "name");
