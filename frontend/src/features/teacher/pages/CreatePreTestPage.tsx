import { TeacherHeader } from "@/features/teacher/components/TeacherHeader";
import { PreTestBuilder } from "@/features/teacher/components/PreTestBuilder";

export function CreatePreTestPage() {
  return (
    <div>
      <TeacherHeader
        title="Pre-Tests"
        subtitle="Create and manage pre-tests for your classes."
      />
      <PreTestBuilder />
    </div>
  );
}
