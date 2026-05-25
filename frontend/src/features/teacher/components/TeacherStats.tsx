type TeacherStatsProps = {
  questionCount: number;
  levelCount: number;
  moduleCount: number;
};

export function TeacherStats({ questionCount, levelCount, moduleCount }: TeacherStatsProps) {
  return (
    <div className="grid sm:grid-cols-3 gap-3 mb-6">
      <div className="panel-stone p-4">
        <p className="text-sm text-stone-foreground/70">Questions</p>
        <p className="font-display text-2xl text-primary">{questionCount}</p>
      </div>
      <div className="panel-stone p-4">
        <p className="text-sm text-stone-foreground/70">Levels</p>
        <p className="font-display text-2xl text-primary">{levelCount}</p>
      </div>
      <div className="panel-stone p-4">
        <p className="text-sm text-stone-foreground/70">Modules</p>
        <p className="font-display text-2xl text-primary">{moduleCount}</p>
      </div>
    </div>
  );
}
