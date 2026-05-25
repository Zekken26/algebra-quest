import type { TeacherModule } from "@/features/teacher/types/teacher.types";

type ModuleEditorProps = {
  modules: TeacherModule[];
  onCreate: () => void;
  onEdit: (module: TeacherModule) => void;
  onDelete: (module: TeacherModule) => void;
  onTogglePublish: (module: TeacherModule) => void;
  onSelect: (module: TeacherModule) => void;
  selectedModuleId?: string;
};

export function ModuleEditor({
  modules,
  onCreate,
  onEdit,
  onDelete,
  onTogglePublish,
  onSelect,
  selectedModuleId,
}: ModuleEditorProps) {
  return (
    <section className="teacher-card p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-primary">Learning Modules</h2>
          <p className="text-sm text-stone-foreground/70">
            Create, edit, publish, and assign learning content.
          </p>
        </div>
        <button type="button" className="btn-game text-sm" onClick={onCreate}>
          Create Quest
        </button>
      </div>
      <div className="grid gap-4">
        {modules.map((module) => (
          <article
            key={module.id}
            className={`rounded-2xl border bg-black/20 p-4 ${selectedModuleId === module.id ? "border-primary" : "border-primary/15"}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl text-primary">{module.title}</p>
                <p className="text-sm text-stone-foreground/70">{module.topic}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs ${module.status === "published" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"}`}
              >
                {module.status}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-black/20 p-3">{module.lessonCount} lessons</div>
              <div className="rounded-xl bg-black/20 p-3">
                {module.quizQuestionCount} quiz questions
              </div>
              <div className="rounded-xl bg-black/20 p-3">
                {module.gameQuestionCount} game questions
              </div>
              <div className="rounded-xl bg-black/20 p-3">{module.completionRate}% completion</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-game btn-stone text-xs"
                onClick={() => onSelect(module)}
              >
                Select
              </button>
              <button
                type="button"
                className="btn-game btn-stone text-xs"
                onClick={() => onEdit(module)}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn-game btn-stone text-xs"
                onClick={() => onTogglePublish(module)}
              >
                {module.status === "published" ? "Unpublish" : "Publish"}
              </button>
              <button type="button" className="btn-game text-xs" onClick={() => onDelete(module)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
