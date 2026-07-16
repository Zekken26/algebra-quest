import type { LucideIcon } from "lucide-react";

export type ClassNavTab = {
  id: string;
  label: string;
  icon: LucideIcon;
};

type ClassNavBarProps = {
  tabs: ClassNavTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
};

export function ClassNavBar({ tabs, activeTab, onTabChange }: ClassNavBarProps) {
  return (
    <nav className="quest-panel mb-6 overflow-hidden p-1.5">
      <div className="flex gap-1 overflow-x-auto scrollbar-none" style={{ scrollbarWidth: "none" }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-display font-bold uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow-gold)]"
                  : "text-stone-foreground/70 hover:bg-white/5 hover:text-primary"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.slice(0, 4)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
