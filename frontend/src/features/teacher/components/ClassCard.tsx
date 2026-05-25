import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Pencil, Trash2, Users } from "lucide-react";
import type { TeacherClass } from "@/features/teacher/types/teacher.types";

type ClassCardProps = {
  classItem: TeacherClass;
  onEdit?: (classItem: TeacherClass) => void;
  onDelete?: (classItem: TeacherClass) => void;
};

export function ClassCard({ classItem, onEdit, onDelete }: ClassCardProps) {
  const navigate = useNavigate();

  return (
    <motion.article whileHover={{ y: -4 }} className="teacher-card p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.2em] text-accent">
            {classItem.gradeLevel}
          </p>
          <h2 className="mt-1 font-display text-2xl text-primary">{classItem.name}</h2>
          <p className="text-sm text-stone-foreground/70">
            Class code {classItem.code ?? "------"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit?.(classItem)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition hover:bg-primary/20"
            aria-label={`Edit ${classItem.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(classItem)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-destructive/25 bg-destructive/10 text-destructive transition hover:bg-destructive/20"
            aria-label={`Delete ${classItem.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl bg-black/20 p-3">
          <p className="font-display text-xl text-primary">{classItem.studentCount}</p>
          <p className="text-xs text-stone-foreground/60">Students</p>
        </div>
        <div className="rounded-xl bg-black/20 p-3">
          <p className="font-display text-xl text-primary">{classItem.activeModules}</p>
          <p className="text-xs text-stone-foreground/60">Quests</p>
        </div>
        <div className="rounded-xl bg-black/20 p-3">
          <p className="font-display text-xl text-primary">{classItem.atRiskCount}</p>
          <p className="text-xs text-stone-foreground/60">At risk</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex justify-between text-xs text-stone-foreground/65">
          <span>Average performance</span>
          <span>{classItem.averagePerformance}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-black/30">
          <div
            className="h-full bg-[var(--gradient-gold)]"
            style={{ width: `${classItem.averagePerformance}%` }}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={() =>
          navigate({ to: "/teacher/classes/$classId", params: { classId: classItem.id } })
        }
        className="btn-game mt-5 w-full text-sm"
      >
        View Class <ArrowRight className="h-4 w-4" />
      </button>
    </motion.article>
  );
}
