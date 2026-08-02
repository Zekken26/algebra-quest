import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { DateTimeInput } from "@/shared/components/DateTimeInput";
import { fetchTeacherSections } from "@/features/teacher/services/teacherService";
import type { TeacherSection } from "@/features/teacher/services/teacherService";

type ModuleActivityFormProps = {
  title: string;
  variant?: "modal" | "page";
  initial?: {
    title?: string;
    description?: string | null;
    instructions?: string | null;
    dueDate?: string | null;
    availableFrom?: string | null;
    availableTo?: string | null;
    totalPoints?: number | null;
    isPublished?: boolean;
    sectionIds?: string[];
  };
  onSave: (data: {
    title: string;
    description: string | null;
    instructions: string | null;
    dueDate: string | null;
    availableFrom: string | null;
    availableTo: string | null;
    totalPoints: number | null;
    isPublished: boolean;
    sectionIds: string[];
  }) => Promise<void>;
  onCancel: () => void;
  fieldErrors?: Record<string, string>;
  isPublished?: boolean;
  onPublishChange?: (isPublished: boolean) => void;
  children?: React.ReactNode;
};

export function ModuleActivityForm({
  title,
  variant = "modal",
  initial,
  onSave,
  onCancel,
  fieldErrors = {},
  isPublished,
  onPublishChange,
  children,
}: ModuleActivityFormProps) {
  const [formTitle, setFormTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [instructions, setInstructions] = useState(initial?.instructions ?? "");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [availableFrom, setAvailableFrom] = useState(initial?.availableFrom ?? "");
  const [availableTo, setAvailableTo] = useState(initial?.availableTo ?? "");
  const [totalPoints, setTotalPoints] = useState(initial?.totalPoints?.toString() ?? "");
  const [sectionIds, setSectionIds] = useState<string[]>(initial?.sectionIds ?? []);
  const [sections, setSections] = useState<TeacherSection[]>([]);
  const [saving, setSaving] = useState(false);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const errors = { ...fieldErrors, ...localErrors };

  useEffect(() => {
    void fetchTeacherSections()
      .then(setSections)
      .catch(() => toast.error("Failed to load classes."));
  }, []);

  const toggleSection = (id: string) => {
    setSectionIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    const nextErrors: Record<string, string> = {};
    if (formTitle.trim().length < 2) {
      nextErrors.title = "Title must contain at least two characters.";
    }
    if (sectionIds.length === 0) {
      nextErrors.sectionIds = "Select at least one class.";
    }
    const due = dueDate ? new Date(dueDate) : null;
    const available = availableFrom ? new Date(availableFrom) : null;
    if ((due && Number.isNaN(due.getTime())) || (available && Number.isNaN(available.getTime()))) {
      nextErrors.dueDate = "Enter valid dates.";
    } else if (due && available && due < available) {
      nextErrors.dueDate = "Due date cannot be earlier than the availability date.";
    }
    setLocalErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);
    try {
      await onSave({
        title: formTitle.trim(),
        description: description.trim() || null,
        instructions: instructions.trim() || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        availableFrom: availableFrom ? new Date(availableFrom).toISOString() : null,
        availableTo: availableTo ? new Date(availableTo).toISOString() : null,
        totalPoints: totalPoints ? parseInt(totalPoints, 10) : null,
        isPublished: isPublished ?? initial?.isPublished ?? false,
        sectionIds,
      });
    } finally {
      setSaving(false);
    }
  };

  const formContent = (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-primary">{title}</h2>
        {variant === "modal" && (
          <button type="button" onClick={onCancel} className="text-stone-foreground/60 hover:text-stone-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-stone-foreground/80">Title *</span>
          <input
            className="teacher-input"
            value={formTitle}
            onChange={(e) => {
              setFormTitle(e.target.value);
              setLocalErrors((current) => ({ ...current, title: "" }));
            }}
            placeholder="Enter title..."
          />
          {errors.title && <span className="text-xs text-destructive">{errors.title}</span>}
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-stone-foreground/80">Description</span>
          <textarea
            className="teacher-input min-h-20"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description..."
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-stone-foreground/80">Instructions</span>
          <textarea
            className="teacher-input min-h-24"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Detailed instructions for students..."
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-stone-foreground/80">Due Date</span>
            <DateTimeInput
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                setLocalErrors((current) => ({ ...current, dueDate: "" }));
              }}
            />
            {errors.dueDate && <span className="text-xs text-destructive">{errors.dueDate}</span>}
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-stone-foreground/80">Available From</span>
            <DateTimeInput
              value={availableFrom}
              onChange={(e) => {
                setAvailableFrom(e.target.value);
                setLocalErrors((current) => ({ ...current, dueDate: "" }));
              }}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-stone-foreground/80">Available Until</span>
            <DateTimeInput
              value={availableTo}
              onChange={(e) => setAvailableTo(e.target.value)}
            />
          </label>
        </div>

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-stone-foreground/80">Total Points</span>
          <input
            type="number"
            className="teacher-input w-full sm:w-40"
            value={totalPoints}
            onChange={(e) => setTotalPoints(e.target.value)}
            min={0}
            placeholder="e.g. 100"
          />
        </label>

        <div className="grid gap-1.5">
          <span className="text-sm font-medium text-stone-foreground/80">Assign to Classes</span>
          {sections.length > 0 ? (
            <div className="grid gap-2 rounded-xl border border-primary/10 bg-black/20 p-3">
              {sections.map((section) => (
                <label key={section.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                  <input
                    type="checkbox"
                    checked={sectionIds.includes(section.id)}
                    onChange={() => toggleSection(section.id)}
                    className="h-4 w-4 accent-primary"
                  />
                  {section.name}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-foreground/60">No classes are available. Create a class before creating content.</p>
          )}
          {errors.sectionIds && <span className="text-xs text-destructive">{errors.sectionIds}</span>}
        </div>

        {onPublishChange && (
          <label className="flex items-center gap-2 rounded-xl border border-primary/10 bg-black/20 p-3 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished ?? false}
              onChange={(event) => onPublishChange(event.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <span>
              <span className="font-medium">Publish now</span>
              <span className="block text-xs text-stone-foreground/60">Leave unchecked to save this assignment as a draft.</span>
            </span>
          </label>
        )}

        {children}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" className="btn-game btn-stone text-sm" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="btn-game text-sm"
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </>
  );

  if (variant === "page") {
    return <section className="teacher-card mx-auto w-full max-w-4xl p-5">{formContent}</section>;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 px-4 py-8">
      <section className="teacher-card w-full max-w-2xl p-5">{formContent}</section>
    </div>
  );
}
