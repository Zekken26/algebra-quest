import { Copy, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import {
  deleteTeacherSection,
  updateTeacherSection,
  type TeacherClassDetails,
} from "@/features/teacher/services/teacherService";

type SettingsTabProps = {
  details: TeacherClassDetails | null;
  classId: string;
  onLoad: () => void;
};

export function SettingsTab({ details, classId, onLoad }: SettingsTabProps) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [className, setClassName] = useState(details?.classInfo.name ?? "");
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const copyClassCode = async () => {
    if (!details?.classInfo.code) return;
    await navigator.clipboard.writeText(details.classInfo.code);
    toast.success("Class code copied.");
  };

  const saveClass = async () => {
    if (!className.trim()) { toast.error("Class name is required."); return; }
    setSaving(true);
    try {
      await updateTeacherSection(classId, { name: className.trim() });
      toast.success("Class updated.");
      setEditing(false);
      await onLoad();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update class.");
    } finally {
      setSaving(false);
    }
  };

  const deleteClass = async () => {
    try {
      await deleteTeacherSection(classId);
      toast.success("Class deleted.");
      navigate({ to: "/teacher/classes" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete class.");
    }
  };

  if (!details) return null;

  return (
    <div>
      <section className="teacher-card mb-6 p-5">
        <h2 className="font-display text-xl text-primary">Class Settings</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-black/20 p-4">
            <p className="text-xs text-stone-foreground/60">Class Name</p>
            <p className="mt-1 font-display text-lg text-primary">{details.classInfo.name}</p>
            <button type="button" className="btn-game btn-stone mt-2 text-xs" onClick={() => { setClassName(details.classInfo.name); setEditing(true); }}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          </div>

          <div className="rounded-xl bg-black/20 p-4">
            <p className="text-xs text-stone-foreground/60">Class Code</p>
            <p className="mt-1 font-display text-lg text-primary">{details.classInfo.code}</p>
            <button type="button" className="btn-game btn-stone mt-2 text-xs" onClick={() => void copyClassCode()}>
              <Copy className="h-3.5 w-3.5" /> Copy Code
            </button>
          </div>

          <div className="rounded-xl bg-black/20 p-4">
            <p className="text-xs text-stone-foreground/60">Teacher</p>
            <p className="mt-1 font-display text-lg text-primary">{details.classInfo.teacher.name}</p>
          </div>

          <div className="rounded-xl bg-black/20 p-4">
            <p className="text-xs text-stone-foreground/60">Created</p>
            <p className="mt-1 font-display text-lg text-primary">
              {new Date(details.classInfo.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-primary/10 pt-4">
          <button
            type="button"
            className="btn-game text-sm"
            onClick={() => setConfirmingDelete(true)}
          >
            <Trash2 className="h-4 w-4" /> Delete Class
          </button>
        </div>
      </section>

      {editing ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
          <section className="teacher-card w-full max-w-md p-5">
            <h2 className="font-display text-xl text-primary">Edit Class</h2>
            <label className="mt-4 grid gap-2">
              <span className="text-sm text-stone-foreground/70">Class name</span>
              <input className="teacher-input" value={className} onChange={(e) => setClassName(e.target.value)} />
            </label>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" className="btn-game btn-stone text-sm" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
              <button type="button" className="btn-game text-sm" onClick={() => void saveClass()} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {confirmingDelete ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
          <section className="teacher-card w-full max-w-md p-5">
            <h2 className="font-display text-xl text-primary">Delete Class</h2>
            <p className="mt-3 text-sm leading-6 text-stone-foreground/75">
              Delete {details.classInfo.name}? This is only allowed when the class has no students, quests, guides, or progress.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" className="btn-game btn-stone text-sm" onClick={() => setConfirmingDelete(false)}>Cancel</button>
              <button type="button" className="btn-game text-sm" onClick={() => void deleteClass()}>Delete</button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
