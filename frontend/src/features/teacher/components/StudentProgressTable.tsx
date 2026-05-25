import type { TeacherStudent } from "@/features/teacher/types/teacher.types";

type StudentProgressTableProps = {
  students: TeacherStudent[];
  onRemove?: (student: TeacherStudent) => void;
  onViewProgress?: (student: TeacherStudent) => void;
};

export function StudentProgressTable({
  students,
  onRemove,
  onViewProgress,
}: StudentProgressTableProps) {
  return (
    <div className="teacher-card overflow-hidden">
      <div className="border-b border-primary/10 p-5">
        <h2 className="font-display text-xl text-primary">Student Progress</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/20 text-xs uppercase tracking-wide text-stone-foreground/60">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Completion</th>
              <th className="p-4">Quiz Avg</th>
              <th className="p-4">Game Score</th>
              <th className="p-4">Accuracy</th>
              <th className="p-4">Weak Areas</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-t border-primary/10">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 font-bold text-primary">
                      {student.avatar}
                    </div>
                    <span className="font-medium">{student.name}</span>
                  </div>
                </td>
                <td className="p-4">{student.completion}%</td>
                <td className="p-4">{student.quizAverage}%</td>
                <td className="p-4">{student.gameScore}</td>
                <td className="p-4">{student.accuracy}%</td>
                <td className="max-w-52 p-4 text-stone-foreground/70">
                  {student.weakAreas.join(", ") || "None"}
                </td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      student.status === "at-risk"
                        ? "bg-destructive/15 text-destructive"
                        : student.status === "thriving"
                          ? "bg-success/15 text-success"
                          : "bg-primary/15 text-primary"
                    }`}
                  >
                    {student.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn-game btn-stone text-xs"
                      onClick={() => onViewProgress?.(student)}
                    >
                      Progress
                    </button>
                    <button
                      type="button"
                      className="btn-game text-xs"
                      onClick={() => onRemove?.(student)}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
