import { BookOpenText, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createTeacherGuide,
  deleteTeacherGuide,
  fetchTeacherGuides,
  type TeacherGuide,
} from "@/features/teacher/services/teacherService";

type GuidesTabProps = {
  classId: string;
};

export function GuidesTab({ classId }: GuidesTabProps) {
  const [guides, setGuides] = useState<TeacherGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    topic: "",
    shortExplanation: "",
    exampleProblem: "",
    solutionStepsText: "",
    tipsText: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const result = await fetchTeacherGuides(classId);
      setGuides(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load guides.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [classId]);

  const splitLines = (value: string) =>
    value.split("\n").map((l) => l.trim()).filter(Boolean);

  const saveGuide = async () => {
    if (!draft.title.trim() || !draft.topic.trim() || !draft.shortExplanation.trim() || !draft.exampleProblem.trim()) {
      toast.error("Complete the guide title, topic, explanation, and example.");
      return;
    }
    const solutionSteps = splitLines(draft.solutionStepsText);
    if (solutionSteps.length === 0) {
      toast.error("Add at least one solution step.");
      return;
    }
    try {
      await createTeacherGuide({
        title: draft.title.trim(),
        topic: draft.topic.trim(),
        shortExplanation: draft.shortExplanation.trim(),
        exampleProblem: draft.exampleProblem.trim(),
        solutionSteps,
        tips: splitLines(draft.tipsText),
        sectionId: classId,
      });
      toast.success("Quest guide created.");
      setCreating(false);
      setDraft({ title: "", topic: "", shortExplanation: "", exampleProblem: "", solutionStepsText: "", tipsText: "" });
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create guide.");
    }
  };

  const removeGuide = async (guideId: string) => {
    try {
      await deleteTeacherGuide(guideId);
      toast.success("Guide deleted.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete guide.");
    }
  };

  return (
    <div>
      <section className="teacher-card mb-6 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-primary">Quest Guides</h2>
            <p className="text-sm text-stone-foreground/70">{guides.length} guides</p>
          </div>
          <button type="button" className="btn-game text-sm" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Create Guide
          </button>
        </div>

        {loading ? (
          <p className="py-4 text-center text-sm text-stone-foreground/60">Loading guides...</p>
        ) : guides.length === 0 ? (
          <p className="py-4 text-center text-sm text-stone-foreground/60">No quest guides yet. Create one to get started.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {guides.map((guide) => (
              <div key={guide.id} className="quest-panel p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xs uppercase tracking-[0.2em] text-accent">{guide.topic}</p>
                    <h3 className="font-display text-lg text-primary">{guide.title}</h3>
                  </div>
                  <button
                    type="button"
                    className="text-destructive/70 hover:text-destructive"
                    onClick={() => { if (confirm(`Delete "${guide.title}"?`)) void removeGuide(guide.id); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm leading-6 text-stone-foreground/80 line-clamp-2">{guide.shortExplanation}</p>
                <p className="mt-2 text-xs text-stone-foreground/50">{guide.solutionSteps.length} steps</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {creating ? (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 px-4 py-8">
          <section className="teacher-card w-full max-w-2xl p-5">
            <h2 className="font-display text-xl text-primary">Create Quest Guide</h2>
            <div className="mt-4 grid gap-3">
              <input className="teacher-input" placeholder="Guide title" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
              <input className="teacher-input" placeholder="Topic" value={draft.topic} onChange={(e) => setDraft((d) => ({ ...d, topic: e.target.value }))} />
              <textarea className="teacher-input min-h-24" placeholder="Short explanation" value={draft.shortExplanation} onChange={(e) => setDraft((d) => ({ ...d, shortExplanation: e.target.value }))} />
              <input className="teacher-input" placeholder="Example problem" value={draft.exampleProblem} onChange={(e) => setDraft((d) => ({ ...d, exampleProblem: e.target.value }))} />
              <textarea className="teacher-input min-h-28" placeholder="Solution steps, one per line" value={draft.solutionStepsText} onChange={(e) => setDraft((d) => ({ ...d, solutionStepsText: e.target.value }))} />
              <textarea className="teacher-input min-h-20" placeholder="Tips, one per line" value={draft.tipsText} onChange={(e) => setDraft((d) => ({ ...d, tipsText: e.target.value }))} />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" className="btn-game btn-stone text-sm" onClick={() => setCreating(false)}>Cancel</button>
              <button type="button" className="btn-game text-sm" onClick={() => void saveGuide()}>Save Guide</button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
