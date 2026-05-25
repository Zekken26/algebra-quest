import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ClassCard } from "@/features/teacher/components/ClassCard";
import { TeacherHeader } from "@/features/teacher/components/TeacherHeader";
import {
  createTeacherSection,
  deleteTeacherSection,
  fetchTeacherClasses,
  updateTeacherSection,
} from "@/features/teacher/services/teacherService";
import type { TeacherClass } from "@/features/teacher/types/teacher.types";

export function ClassManagementPage() {
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [editing, setEditing] = useState<TeacherClass | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TeacherClass | null>(null);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadClasses = async () => {
    setClasses(await fetchTeacherClasses());
  };

  useEffect(() => {
    void loadClasses().catch((error) =>
      toast.error(error instanceof Error ? error.message : "Unable to load sections."),
    );
  }, []);

  const openCreate = () => {
    setEditing({
      id: "",
      name: "",
      section: "",
      gradeLevel: "Class",
      studentCount: 0,
      averagePerformance: 0,
      activeModules: 0,
      atRiskCount: 0,
    });
    setName("");
  };

  const saveSection = async () => {
    if (!name.trim()) {
      toast.error("Class name is required.");
      return;
    }
    setSubmitting(true);
    try {
      if (editing?.id) {
        await updateTeacherSection(editing.id, { name: name.trim() });
        toast.success("Class updated.");
      } else {
        await createTeacherSection({ name: name.trim() });
        toast.success("Class created.");
      }
      setEditing(null);
      await loadClasses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save class.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSection = async (classItem: TeacherClass) => {
    try {
      await deleteTeacherSection(classItem.id);
      toast.success("Class deleted.");
      setPendingDelete(null);
      await loadClasses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete class.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      <TeacherHeader
        title="Class Management"
        subtitle="Create classes, review cohorts, and open class-level learning details."
        actionLabel="Create Class"
        onAction={openCreate}
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {classes.map((classItem) => (
          <ClassCard
            key={classItem.id}
            classItem={classItem}
            onEdit={(item) => {
              setEditing(item);
              setName(item.name);
            }}
            onDelete={setPendingDelete}
          />
        ))}
      </div>
      {editing ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
          <section className="teacher-card w-full max-w-md p-5">
            <h2 className="font-display text-xl text-primary">
              {editing.id ? "Edit Class" : "Create Class"}
            </h2>
            <label className="mt-4 grid gap-2">
              <span className="text-sm text-stone-foreground/70">Class name</span>
              <input
                className="teacher-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                className="btn-game btn-stone text-sm"
                onClick={() => setEditing(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-game text-sm"
                onClick={() => void saveSection()}
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
      {pendingDelete ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
          <section className="teacher-card w-full max-w-md p-5">
            <h2 className="font-display text-xl text-primary">Delete Class</h2>
            <p className="mt-3 text-sm leading-6 text-stone-foreground/75">
              Delete {pendingDelete.name}? This is only allowed when the section has no students,
              quests, guides, or progress.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                className="btn-game btn-stone text-sm"
                onClick={() => setPendingDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-game text-sm"
                onClick={() => void deleteSection(pendingDelete)}
              >
                Delete
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </motion.div>
  );
}
