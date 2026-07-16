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
    <div className="sticky top-0 z-30 mb-6 overflow-x-auto rounded-[14px] border border-[rgba(212,175,55,0.25)] bg-[rgba(8,24,18,0.85)] p-1.5 backdrop-blur-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
      <div className="flex gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex min-h-[44px] items-center gap-2.5 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/20 text-primary shadow-sm shadow-primary/20 ring-1 ring-primary/20"
                  : "text-stone-foreground/80 hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
              <span className={`font-display ${isActive ? "text-primary" : ""}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}