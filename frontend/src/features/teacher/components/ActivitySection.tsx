import { BookCheck, BookOpen, FileText, Plus, Swords, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ActivityCard } from "@/features/teacher/components/ActivityCard";
import { ActivityForm } from "@/features/teacher/components/ActivityForm";
import { fetchClassActivities, type TeacherSection } from "@/features/teacher/services/teacherService";
import type { ActivityItem, ActivityType } from "@/features/teacher/types/teacher.types";

type TabId = "all" | ActivityType;

type Tab = {
  id: TabId;
  label: string;
  icon: typeof Swords;
};

const TABS: Tab[] = [
  { id: "all", label: "All Activities", icon: BookCheck },
  { id: "QUEST", label: "Quests", icon: Swords },
  { id: "ASSIGNMENT", label: "Assignments", icon: FileText },
  { id: "PRE_TEST", label: "Pre-Tests", icon: BookOpen },
  { id: "ASSESSMENT", label: "Assessments", icon: Trophy },
];

const TAB_TYPE_MAP: Record<string, ActivityType | undefined> = {
  all: undefined,
  QUEST: "QUEST",
  ASSIGNMENT: "ASSIGNMENT",
  PRE_TEST: "PRE_TEST",
  ASSESSMENT: "ASSESSMENT",
};

type Props = {
  classId: string;
  currentSection?: TeacherSection | null;
  onQuestCreated?: () => void;
};

export function ActivitySection({ classId, currentSection, onQuestCreated }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const type = TAB_TYPE_MAP[activeTab];
      const res = await fetchClassActivities(classId, type);
      setActivities(res.activities ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load activities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadActivities();
  }, [classId, activeTab]);

  const handleCreated = () => {
    setCreating(false);
    void loadActivities();
    if (onQuestCreated) onQuestCreated();
  };

  return (
    <section className="teacher-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-primary">Activities</h2>
          <p className="text-sm text-stone-foreground/70">{activities.length} total</p>
        </div>
        <button
          type="button"
          className="btn-game text-sm"
          onClick={() => setCreating(true)}
        >
          <Plus className="h-4 w-4" /> Create Activity
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-1">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-black/20 text-stone-foreground/70 hover:bg-black/30"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <TabIcon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="py-4 text-center text-sm text-stone-foreground/60">Loading activities...</p>
      ) : activities.length === 0 ? (
        <p className="py-4 text-center text-sm text-stone-foreground/60">
          No {activeTab === "all" ? "" : `${TABS.find((t) => t.id === activeTab)?.label.toLowerCase()} `}activities yet.
          Create one to get started.
        </p>
      ) : (
        <div className="grid gap-3">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onDeleted={() => setActivities((prev) => prev.filter((a) => a.id !== activity.id))}
              onTogglePublish={() => void loadActivities()}
              onEdit={() => toast.info("Edit mode coming soon.")}
            />
          ))}
        </div>
      )}

      {creating ? (
        <ActivityForm
          classId={classId}
          sectionId={classId}
          currentSection={currentSection}
          onClose={() => setCreating(false)}
          onCreated={handleCreated}
        />
      ) : null}
    </section>
  );
}
