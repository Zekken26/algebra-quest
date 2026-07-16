import { BookOpen, FileText, ClipboardCheck, GraduationCap } from "lucide-react";

type Tab = "quests" | "assignments" | "pretests" | "assessments";

type TabNavProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

const tabs: { id: Tab; label: string; icon: typeof BookOpen }[] = [
  { id: "quests", label: "Quests", icon: BookOpen },
  { id: "assignments", label: "Assignments", icon: FileText },
  { id: "pretests", label: "Pre-Tests", icon: ClipboardCheck },
  { id: "assessments", label: "Assessments", icon: GraduationCap },
];

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="mb-6 overflow-x-auto rounded-xl border border-primary/15 bg-black/20 p-1">
      <div className="flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/20 text-primary shadow-sm shadow-primary/20"
                  : "text-stone-foreground/60 hover:bg-white/5 hover:text-stone-foreground/80"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
              <span className={`font-display ${isActive ? "text-primary" : ""}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="ml-1 h-1 w-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
