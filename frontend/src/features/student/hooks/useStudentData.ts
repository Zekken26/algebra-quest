import { useMemo, useState } from "react";
import {
  getStudentModules,
  getStudentProgress,
  saveStudentProgress,
} from "@/features/student/services/studentService";
import type { StudentProgress } from "@/features/student/types/student.types";

export function useStudentData() {
  const [progress, setProgress] = useState<StudentProgress>(() => getStudentProgress());
  const modules = useMemo(() => getStudentModules(), []);

  const persistProgress = (nextProgress: StudentProgress) => {
    setProgress(nextProgress);
    saveStudentProgress(nextProgress);
  };

  return {
    modules,
    progress,
    persistProgress,
  };
}
