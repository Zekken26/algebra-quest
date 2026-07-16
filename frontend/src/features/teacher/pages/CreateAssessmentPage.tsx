import { TeacherHeader } from "@/features/teacher/components/TeacherHeader";
import { AssessmentBuilder } from "@/features/teacher/components/AssessmentBuilder";

export function CreateAssessmentPage() {
  return (
    <div>
      <TeacherHeader
        title="Assessments"
        subtitle="Create and manage assessments for your classes."
      />
      <AssessmentBuilder />
    </div>
  );
}
