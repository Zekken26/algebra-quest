import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Swords, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { fetchTeacherQuests, deleteTeacherQuest, type TeacherQuest } from "@/features/teacher/services/teacherService";

type QuestsTabProps = {
  classId: string;
  onLoad: () => void;
};

export function QuestsTab({ classId, onLoad }: QuestsTabProps) {
  const [quests, setQuests] = useState<TeacherQuest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const result = await fetchTeacherQuests(classId);
      setQuests(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load quests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [classId]);

  const removeQuest = async (questId: string) => {
    try {
      await deleteTeacherQuest(questId);
      toast.success("Quest deleted.");
      await load();
      onLoad();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete quest.");
    }
  };

  return (
    <div>
      <section className="teacher-card mb-6 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-primary">Class Quests</h2>
            <p className="text-sm text-stone-foreground/70">{quests.length} quests</p>
          </div>
          <Link to="/teacher/quests/create" className="btn-game text-sm">
            <Plus className="h-4 w-4" /> Create Quest
          </Link>
        </div>

        {loading ? (
          <p className="py-4 text-center text-sm text-stone-foreground/60">Loading quests...</p>
        ) : quests.length === 0 ? (
          <p className="py-4 text-center text-sm text-stone-foreground/60">No quests yet. Create one to get started.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quests.map((quest) => (
              <div key={quest.id} className="quest-panel p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xs uppercase tracking-[0.2em] text-accent">Level {quest.levelNumber}</p>
                    <h3 className="font-display text-lg text-primary">{quest.title}</h3>
                  </div>
                  <Swords className="h-5 w-5 text-primary shrink-0" />
                </div>
                <p className="text-sm text-stone-foreground/75">{quest.topic} - {quest.difficulty}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-stone-foreground/50">
                  <span className={`rounded-full px-2 py-0.5 ${quest.isPublished ? "bg-success/15 text-success" : "bg-stone-500/15 text-stone-400"}`}>
                    {quest.isPublished ? "Published" : "Draft"}
                  </span>
                  <span>{quest._count?.questions ?? 0} questions</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button type="button" className="btn-game btn-stone text-xs flex-1" onClick={() => toast.info("Edit quest coming soon.")}>Edit</button>
                  <button type="button" className="btn-game text-xs flex-1" onClick={() => { if (confirm(`Delete "${quest.title}"?`)) void removeQuest(quest.id); }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
