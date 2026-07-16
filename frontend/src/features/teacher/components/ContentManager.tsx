import { BookOpen, FileText, Plus, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createClassContent,
  deleteClassContent,
  fetchSectionContent,
  togglePublishContent,
  type ClassContentItem,
} from "@/features/teacher/services/teacherService";
import type { ClassContentType } from "@/features/teacher/types/teacher.types";
import { EmptyState } from "@/shared/components/EmptyState";
import { SubmissionReviewDialog } from "./SubmissionReviewDialog";

type ContentManagerProps = {
  classId: string;
  contentType: ClassContentType;
  onRefresh?: () => void;
  FormComponent: React.ComponentType<{
    classId: string;
    contentType: ClassContentType;
    onClose: () => void;
    onCreated: () => void;
    editItem?: ClassContentItem | null;
  }>;
};

const typeMeta: Record<ClassContentType, { label: string; icon: typeof FileText; color: string }> = {
  ASSIGNMENT: { label: "Assignment", icon: FileText, color: "text-blue-400" },
  PRETEST: { label: "Pre-Test", icon: BookOpen, color: "text-accent" },
  ASSESSMENT: { label: "Assessment", icon: Trophy, color: "text-primary" },
};

export function ContentManager({ classId, contentType, onRefresh, FormComponent }: ContentManagerProps) {
  const [items, setItems] = useState<ClassContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassContentItem | null>(null);
  const [reviewingItem, setReviewingItem] = useState<ClassContentItem | null>(null);
  const meta = typeMeta[contentType];

  const load = async () => {
    setLoading(true);
    try {
      const result = await fetchSectionContent(classId, contentType);
      setItems(result.content);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Unable to load ${meta.label.toLowerCase()}s.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [classId, contentType]);

  const handleCreated = () => {
    setCreating(false);
    setEditingItem(null);
    void load();
    if (onRefresh) onRefresh();
  };

  const removeItem = async (item: ClassContentItem) => {
    try {
      await deleteClassContent(item.id);
      toast.success(`${meta.label} deleted.`);
      void load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Unable to delete ${meta.label.toLowerCase()}.`);
    }
  };

  const togglePublish = async (item: ClassContentItem) => {
    try {
      await togglePublishContent(item.id);
      toast.success(item.isPublished ? "Unpublished." : "Published.");
      void load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to toggle publish.");
    }
  };

  return (
    <div>
      <section className="teacher-card mb-6 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-primary">{meta.label}s</h2>
            <p className="text-sm text-stone-foreground/70">{items.length} total</p>
          </div>
          <button type="button" className="btn-game text-sm" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Create {meta.label}
          </button>
        </div>

        {loading ? (
          <p className="py-4 text-center text-sm text-stone-foreground/60">Loading {meta.label.toLowerCase()}s...</p>
        ) : items.length === 0 ? (
          <EmptyState title={`No ${meta.label.toLowerCase()}s yet`} message={`Create your first ${meta.label.toLowerCase()} to get started.`} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="quest-panel p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-black/30 p-2">
                    <meta.icon className={`h-5 w-5 ${meta.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg text-primary truncate">{item.title}</h3>
                    <p className="mt-0.5 text-xs text-stone-foreground/60">
                      {item._count?.questions ?? 0} questions
                      {item.dueDate ? <> &bull; Due {new Date(item.dueDate).toLocaleDateString()}</> : null}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    className={`rounded-full px-2 py-0.5 font-medium cursor-pointer transition-colors ${
                      item.isPublished ? "bg-success/15 text-success" : "bg-stone-500/15 text-stone-400"
                    }`}
                    onClick={() => void togglePublish(item)}
                  >
                    {item.isPublished ? "Published" : "Draft"}
                  </button>
                  {item.maxScore ? (
                    <span className="text-stone-foreground/50">{item.maxScore} pts</span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-stone-foreground/60 line-clamp-1">{item.description ?? ""}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className="btn-game btn-stone text-xs flex-1" onClick={() => setEditingItem(item)}>Edit</button>
                  <button type="button" className="btn-game btn-stone text-xs flex-1" onClick={() => setReviewingItem(item)}>Submissions</button>
                  <button type="button" className="btn-game text-xs" onClick={() => { if (confirm(`Delete "${item.title}"?`)) void removeItem(item); }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {creating ? (
        <FormComponent
          classId={classId}
          contentType={contentType}
          onClose={() => setCreating(false)}
          onCreated={handleCreated}
        />
      ) : null}

      {editingItem ? (
        <FormComponent
          classId={classId}
          contentType={contentType}
          onClose={() => setEditingItem(null)}
          onCreated={handleCreated}
          editItem={editingItem}
        />
      ) : null}

      {reviewingItem ? (
        <SubmissionReviewDialog
          contentItem={reviewingItem}
          classId={classId}
          onClose={() => setReviewingItem(null)}
        />
      ) : null}
    </div>
  );
}
