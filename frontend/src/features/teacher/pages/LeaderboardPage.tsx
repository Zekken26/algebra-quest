import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { LeaderboardTable } from "@/features/teacher/components/LeaderboardTable";
import { TeacherHeader } from "@/features/teacher/components/TeacherHeader";
import { TopStudentCard } from "@/features/teacher/components/TopStudentCard";
import {
  fetchTeacherLeaderboard,
  fetchTeacherSections,
  type TeacherSection,
} from "@/features/teacher/services/teacherService";
import type { TeacherStudent } from "@/features/teacher/types/teacher.types";

export function LeaderboardPage() {
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [sections, setSections] = useState<TeacherSection[]>([]);
  const [sectionId, setSectionId] = useState("");

  const loadLeaderboard = async (nextSectionId = sectionId) => {
    try {
      setStudents(await fetchTeacherLeaderboard(nextSectionId || undefined));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load leaderboard.");
    }
  };

  useEffect(() => {
    void fetchTeacherSections()
      .then((items) => {
        setSections(items);
        const firstSectionId = items[0]?.id ?? "";
        setSectionId(firstSectionId);
        return loadLeaderboard(firstSectionId);
      })
      .catch((error) =>
        toast.error(error instanceof Error ? error.message : "Unable to load sections."),
      );
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      <TeacherHeader
        title="Leaderboard"
        subtitle="Celebrate top performers and filter rankings by class, module, or date range."
        actionLabel="Export"
        onAction={() => {
          const csv = [
            "Name,Accuracy,Completion,XP",
            ...students.map(
              (student) =>
                `${student.name},${student.accuracy},${student.completion},${student.xp}`,
            ),
          ].join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "leaderboard.csv";
          link.click();
          URL.revokeObjectURL(url);
          toast.success("Leaderboard exported.");
        }}
      />
      <section className="teacher-card mb-6 p-4">
        <label className="grid gap-2 md:max-w-sm">
          <span className="text-sm text-stone-foreground/70">Filter by section</span>
          <select
            className="teacher-input"
            value={sectionId}
            onChange={(event) => {
              setSectionId(event.target.value);
              void loadLeaderboard(event.target.value);
            }}
          >
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </label>
      </section>
      <div className="mb-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        {students[0] ? <TopStudentCard student={students[0]} /> : null}
        <section className="teacher-card p-5">
          <h2 className="font-display text-xl text-primary">Top 5 Ranking</h2>
          <div className="mt-4 space-y-3">
            {students.slice(0, 5).map((student, index) => (
              <div
                key={student.id}
                className="flex items-center justify-between rounded-2xl border border-primary/15 bg-black/20 p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 font-display text-primary">
                    #{index + 1}
                  </span>
                  <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/20 bg-primary/10 font-display text-xs text-primary">
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
                    <p className="font-medium">{student.name}</p>
                    <p className="text-xs text-stone-foreground/60">{student.accuracy}% accuracy</p>
                  </div>
                </div>
                <span className="font-display text-primary">{student.xp} XP</span>
              </div>
            ))}
          </div>
        </section>
      </div>
      <LeaderboardTable students={students} />
    </motion.div>
  );
}
