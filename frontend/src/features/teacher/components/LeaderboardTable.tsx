import { Medal } from "lucide-react";
import type { TeacherStudent } from "@/features/teacher/types/teacher.types";

type LeaderboardTableProps = {
  students: TeacherStudent[];
};

export function LeaderboardTable({ students }: LeaderboardTableProps) {
  return (
    <div className="teacher-card overflow-hidden">
      <div className="border-b border-primary/10 p-5">
        <h2 className="font-display text-xl text-primary">Full Class Leaderboard</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/20 text-xs uppercase tracking-wide text-stone-foreground/60">
            <tr>
              <th className="p-4">Rank</th>
              <th className="p-4">Student</th>
              <th className="p-4">XP</th>
              <th className="p-4">Coins</th>
              <th className="p-4">Accuracy</th>
              <th className="p-4">Game Score</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id} className="border-t border-primary/10">
                <td className="p-4">
                  <span className="inline-flex items-center gap-2 font-display text-primary">
                    <Medal className="h-4 w-4" /> #{index + 1}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3 font-medium">
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
                    {student.name}
                  </div>
                </td>
                <td className="p-4">{student.xp}</td>
                <td className="p-4">{student.coins}</td>
                <td className="p-4">{student.accuracy}%</td>
                <td className="p-4">{student.gameScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
