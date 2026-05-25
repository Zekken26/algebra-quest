import { Award, Star } from "lucide-react";
import type { TeacherStudent } from "@/features/teacher/types/teacher.types";

type TopStudentCardProps = {
  student: TeacherStudent;
};

export function TopStudentCard({ student }: TopStudentCardProps) {
  return (
    <section className="teacher-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl text-primary">Top Student</h2>
        <Award className="h-5 w-5 text-primary" />
      </div>
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-[var(--gradient-gold)] font-display text-xl text-gold-foreground shadow-[var(--shadow-glow-gold)]">
          {student.avatarUrl ? (
            <img
              src={student.avatarUrl}
              alt={student.name}
              className="h-full w-full object-cover"
            />
          ) : (
            student.avatar
          )}
        </div>
        <div>
          <p className="font-display text-2xl text-primary">{student.name}</p>
          <p className="text-sm text-stone-foreground/70">{student.accuracy}% accuracy</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-black/20 p-3">
          <p className="font-display text-xl text-primary">{student.xp}</p>
          <p className="text-xs text-stone-foreground/60">XP</p>
        </div>
        <div className="rounded-xl bg-black/20 p-3">
          <p className="font-display text-xl text-primary">{student.gameScore}</p>
          <p className="text-xs text-stone-foreground/60">Game</p>
        </div>
        <div className="rounded-xl bg-black/20 p-3">
          <p className="font-display text-xl text-primary">{student.quizAverage}</p>
          <p className="text-xs text-stone-foreground/60">Quiz</p>
        </div>
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-accent">
        <Star className="h-4 w-4" /> Strong candidate for peer tutoring.
      </p>
    </section>
  );
}
