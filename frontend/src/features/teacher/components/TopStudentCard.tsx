import { Award, Star } from "lucide-react";
import type { TeacherStudent } from "@/features/teacher/types/teacher.types";

type TopStudentCardProps = {
  student: TeacherStudent;
};

export function TopStudentCard({ student }: TopStudentCardProps) {
  return (
    <section className="teacher-card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg text-primary sm:text-xl">Top Student</h2>
        <Award className="h-5 w-5 text-primary" />
      </div>
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[var(--gradient-gold)] font-display text-lg text-gold-foreground shadow-[var(--shadow-glow-gold)] sm:h-16 sm:w-16 sm:text-xl">
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
        <div className="min-w-0">
          <p className="truncate font-display text-xl text-primary sm:text-2xl">{student.name}</p>
          <p className="text-sm text-stone-foreground/70">{student.accuracy}% accuracy</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl bg-black/20 p-3">
          <p className="truncate font-display text-lg text-primary sm:text-xl">{student.xp}</p>
          <p className="text-xs text-stone-foreground/60">XP</p>
        </div>
        <div className="rounded-xl bg-black/20 p-3">
          <p className="truncate font-display text-lg text-primary sm:text-xl">{student.gameScore}</p>
          <p className="text-xs text-stone-foreground/60">Game</p>
        </div>
        <div className="rounded-xl bg-black/20 p-3">
          <p className="truncate font-display text-lg text-primary sm:text-xl">{student.quizAverage}</p>
          <p className="text-xs text-stone-foreground/60">Quiz</p>
        </div>
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm leading-5 text-accent">
        <Star className="h-4 w-4" /> Strong candidate for peer tutoring.
      </p>
    </section>
  );
}
